import { SafeString } from './utils.js';
import { renderChildren } from './jsx.js';
import { renderToString } from './render.js';

// Suspense boundaries register here during the synchronous JSX evaluation
// started by renderToStream. JSX evaluation never yields to the event loop,
// so concurrent renders cannot interleave registrations.
let activeBoundaries = null;

/**
 * Suspense - streams a fallback immediately and swaps in async content when
 * it resolves (out-of-order streaming).
 *
 * - Inside renderToStream: renders the fallback with a boundary marker; the
 *   resolved content is streamed later as a <template> + swap script.
 * - Inside renderToString (or with fully sync children): transparent - the
 *   content renders in place.
 * - `onError(err)` may return replacement markup for a failed boundary.
 *   Without it, a failed boundary keeps its fallback and the error is logged.
 *
 * @param {object} props
 * @param {any} [props.fallback=''] - Markup shown until content resolves (must be sync)
 * @param {any} [props.children]
 * @param {(err: any) => any} [props.onError]
 */
export function Suspense({ fallback = '', children = [], onError } = {}) {
    const list = Array.isArray(children) ? children : [children];
    const content = renderChildren(list);

    // Fully synchronous content needs no boundary
    if (!(content instanceof Promise)) {
        return new SafeString(content);
    }

    // Outside a streaming render: behave like a plain async pass-through
    if (activeBoundaries === null) {
        return content.then(
            c => new SafeString(c),
            err => {
                if (!onError) throw err;
                return Promise.resolve(renderToString(onError(err))).then(c => new SafeString(c));
            }
        );
    }

    const fallbackHtml = renderChildren([fallback]);
    if (fallbackHtml instanceof Promise) {
        throw new Error('Suspense fallback must be synchronous');
    }

    const id = activeBoundaries.length;
    activeBoundaries.push({ id, content, onError });
    return new SafeString(
        `<div data-lume-boundary="${id}" style="display:contents">${fallbackHtml}</div>`
    );
}

// Injected once, before the first boundary chunk. Replaces a boundary's
// fallback with the streamed <template> content.
const SWAP_SCRIPT =
    `<script>window.$lume=window.$lume||function(i){` +
    `var t=document.querySelector('template[data-lume-chunk="'+i+'"]'),` +
    `p=document.querySelector('[data-lume-boundary="'+i+'"]');` +
    `if(t&&p)p.replaceWith(t.content);if(t)t.remove();};</script>`;

/**
 * Render a component to a web-standard ReadableStream of UTF-8 bytes.
 * Works with `new Response(stream)` (Workers, Deno, Bun) and
 * `Readable.fromWeb(stream)` (Node).
 *
 * Pass a component FUNCTION (not an evaluated element) so Suspense
 * boundaries can register with this render:
 *
 *   const stream = renderToStream(() => <Page />);
 *
 * The shell (everything outside Suspense) is flushed first; each boundary's
 * content follows as it resolves.
 *
 * @param {function|any} component - Component function (or pre-rendered element)
 * @param {object} [props]
 * @returns {ReadableStream<Uint8Array>}
 */
/**
 * Render a component into a web-standard Response with text/html headers.
 * One line on any web-standard server (Workers, Deno, Bun, Hono, ...):
 *
 *   export default { fetch: (req) => htmlResponse(() => <Page url={req.url} />) };
 *
 * Streams Suspense boundaries automatically; sync trees arrive as one chunk.
 *
 * @param {function|any} component - Component function (or pre-rendered element)
 * @param {object} [init] - ResponseInit, plus optional `props` for the component
 * @returns {Response}
 */
export function htmlResponse(component, init = {}) {
    const { props, ...responseInit } = init;
    const headers = new Headers(responseInit.headers);
    if (!headers.has('content-type')) {
        headers.set('content-type', 'text/html; charset=utf-8');
    }
    return new Response(renderToStream(component, props), { ...responseInit, headers });
}

export function renderToStream(component, props = {}) {
    const boundaries = [];
    const prev = activeBoundaries;
    activeBoundaries = boundaries;
    let root;
    try {
        root = typeof component === 'function' ? component(props) : component;
    } finally {
        activeBoundaries = prev;
    }

    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                const shell = await renderToString(root);
                if (boundaries.length === 0) {
                    controller.enqueue(encoder.encode(shell));
                    controller.close();
                    return;
                }

                controller.enqueue(encoder.encode(shell + SWAP_SCRIPT));

                await Promise.all(boundaries.map(async ({ id, content, onError }) => {
                    let html;
                    try {
                        html = await content;
                    } catch (err) {
                        if (!onError) {
                            console.error('[lume-ssr] Suspense boundary failed; fallback left in place:', err);
                            return;
                        }
                        html = await renderToString(onError(err));
                    }
                    controller.enqueue(encoder.encode(
                        `<template data-lume-chunk="${id}">${html}</template><script>$lume(${id})</script>`
                    ));
                }));

                controller.close();
            } catch (err) {
                controller.error(err);
            }
        }
    });
}
