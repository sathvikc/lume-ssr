# Extending Lume-SSR

Lume-SSR mirrors the lume-js philosophy: a small core with explicit extension
points. lume-js has `state()` + plugins and `bindDom()` + handlers; lume-ssr
has three layers you can build on without ever forking the core:

| Layer | Extension point | Build with it |
| --- | --- | --- |
| Elements | `use()` plugins | CSP nonces, class prefixing, asset rewriting, lint rules |
| Components | plain functions | layouts, providers, routers, design systems |
| Output | strings + web streams | any server, any runtime, any cache |

Because every layer is a standard JavaScript value (object, function, string,
`ReadableStream`), additions land as new plugins or helper functions — not
breaking changes to the core.

---

## 1. Element plugins

A plugin can inspect or transform **every HTML element** at render time — the
one thing you can't do from outside the renderer. Mirrors lume-js `bindDom`
handlers: a named object with one hook.

```javascript
import { use } from 'lume-ssr';

// Add a CSP nonce to every script tag
use({
  name: 'csp-nonce',
  element(tag, props) {
    if (tag === 'script') return { props: { ...props, nonce: myNonce } };
  }
});
```

Contract:

- `element(tag, props, children)` runs for HTML tags (not component
  functions), in registration order.
- Return nothing to leave the element untouched, or `{ tag?, props?, children? }`
  to replace those parts. Replaced tags are still validated and replaced
  props are still escaped — plugins cannot bypass the security model.
- `use()` returns an unregister function; `unuse(name)` also works.
- Plugins are process-global: register at server start, not per request.

The built-in a11y warnings are themselves a plugin — `enableA11yWarnings()`
is just `use({ name: 'a11y', element: checkA11y })`. If the core team ships
features this way, so can you.

More plugin sketches:

```javascript
// Prefix all classes (design-system isolation)
use({
  name: 'prefix',
  element(tag, props) {
    if (props?.class) return { props: { ...props, class: `app-${props.class}` } };
  }
});

// Rewrite asset URLs to a CDN
use({
  name: 'cdn',
  element(tag, props) {
    if (tag === 'img' && props?.src?.startsWith('/assets/')) {
      return { props: { ...props, src: CDN + props.src } };
    }
  }
});
```

## 2. Components are the middleware

There is no special middleware API for page-level concerns — function
composition already is one. A "layout" is a component that takes children; a
"provider" is a component that passes props down; a router is a function from
a request to a component.

```javascript
// A router in ~10 lines, using the standard URLPattern API
const routes = [
  { pattern: new URLPattern({ pathname: '/' }), page: Home },
  { pattern: new URLPattern({ pathname: '/posts/:slug' }), page: Post },
];

function route(url) {
  for (const { pattern, page } of routes) {
    const match = pattern.exec(url);
    if (match) return { page, params: match.pathname.groups };
  }
  return { page: NotFound, params: {} };
}
```

Anyone can publish `lume-router`, `lume-markdown`, `lume-islands` as plain
packages of functions — no core changes, no version coupling.

## 3. Any server, any runtime

The output is a string or a web-standard `ReadableStream`, so every server
already speaks it.

```javascript
// Web-standard servers (Cloudflare Workers, Deno, Bun, Hono...)
import { htmlResponse } from 'lume-ssr';
export default {
  fetch: (req) => htmlResponse(Page, { props: { url: req.url } })
};

// Express / Fastify / raw Node (strings)
app.get('/', async (req, res) => {
  res.send(`<!DOCTYPE html>${await renderToString(<Page url={req.url} />)}`);
});

// Node streaming
import { Readable } from 'node:stream';
app.get('/', (req, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  Readable.fromWeb(renderToStream(() => <Page url={req.url} />)).pipe(res);
});
```

## Stability promise

The extension contract is intentionally tiny: plugin objects, component
functions, strings, web streams. New capabilities arrive as new named plugins
or new exported helpers — existing code keeps working.
