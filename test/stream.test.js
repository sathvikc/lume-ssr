import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, renderToString, renderToStream, Suspense } from '../src/index.js';

async function collect(stream) {
    const decoder = new TextDecoder();
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(decoder.decode(chunk, { stream: true }));
    }
    return chunks;
}

const delay = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));

test('renderToStream streams a sync tree as a single chunk', async () => {
    const chunks = await collect(renderToStream(() => h('p', null, 'hi')));
    assert.deepEqual(chunks, ['<p>hi</p>']);
});

test('renderToStream flushes the shell before suspended content', async () => {
    const Late = async () => {
        await delay(10);
        return h('span', null, 'late');
    };
    const Page = () => h('main', null,
        h('h1', null, 'Now'),
        h(Suspense, { fallback: h('p', null, 'Loading...') }, h(Late, null))
    );

    const chunks = await collect(renderToStream(Page));
    assert.equal(chunks.length, 2);
    // Shell: static content + fallback inside a boundary, plus the swap helper
    assert.ok(chunks[0].includes('<h1>Now</h1>'));
    assert.ok(chunks[0].includes('data-lume-boundary="0"'));
    assert.ok(chunks[0].includes('<p>Loading...</p>'));
    assert.ok(chunks[0].includes('window.$lume'));
    assert.ok(!chunks[0].includes('<span>late</span>'));
    // Chunk: resolved content in a template plus the swap call
    assert.ok(chunks[1].includes('<template data-lume-chunk="0"><span>late</span></template>'));
    assert.ok(chunks[1].includes('$lume(0)'));
});

test('multiple Suspense boundaries stream independently', async () => {
    const Fast = async () => delay(5, h('i', null, 'fast'));
    const Slow = async () => delay(30, h('b', null, 'slow'));
    const Page = () => h('div', null,
        h(Suspense, { fallback: 'f1' }, h(Slow, null)),
        h(Suspense, { fallback: 'f2' }, h(Fast, null))
    );

    const chunks = await collect(renderToStream(Page));
    assert.equal(chunks.length, 3);
    // The fast boundary arrives before the slow one (out-of-order)
    assert.ok(chunks[1].includes('fast'));
    assert.ok(chunks[2].includes('slow'));
});

test('Suspense with sync children renders inline (no boundary)', async () => {
    const Page = () => h('div', null, h(Suspense, { fallback: 'x' }, h('p', null, 'sync')));
    const chunks = await collect(renderToStream(Page));
    assert.deepEqual(chunks, ['<div><p>sync</p></div>']);
});

test('Suspense is transparent inside renderToString', async () => {
    const Late = async () => h('span', null, 'late');
    const out = await renderToString(h('div', null, h(Suspense, { fallback: 'x' }, h(Late, null))));
    assert.equal(out, '<div><span>late</span></div>');
});

test('failed boundary keeps its fallback when no onError is given', async () => {
    const Boom = async () => { throw new Error('boom'); };
    const original = console.error;
    console.error = () => {};
    try {
        const Page = () => h('div', null, h(Suspense, { fallback: h('p', null, 'spinner') }, h(Boom, null)));
        const chunks = await collect(renderToStream(Page));
        assert.equal(chunks.length, 1);
        assert.ok(chunks[0].includes('spinner'));
    } finally {
        console.error = original;
    }
});

test('failed boundary renders onError markup', async () => {
    const Boom = async () => { throw new Error('boom'); };
    const Page = () => h('div', null,
        h(Suspense, {
            fallback: 'loading',
            onError: (err) => h('p', { class: 'error' }, err.message)
        }, h(Boom, null))
    );
    const chunks = await collect(renderToStream(Page));
    assert.equal(chunks.length, 2);
    assert.ok(chunks[1].includes('<p class="error">boom</p>'));
});

test('onError works in renderToString mode too', async () => {
    const Boom = async () => { throw new Error('boom'); };
    const out = await renderToString(
        h(Suspense, { onError: () => h('p', null, 'failed') }, h(Boom, null))
    );
    assert.equal(out, '<p>failed</p>');
});

test('async fallback throws a clear error', () => {
    const Late = async () => 'x';
    assert.throws(
        () => renderToStream(() => h(Suspense, { fallback: h(Late, null) }, h(Late, null))),
        /fallback must be synchronous/
    );
});

test('escaping still applies to streamed content', async () => {
    const Evil = async () => '<script>alert(1)</script>';
    const Page = () => h(Suspense, { fallback: 'x' }, h(Evil, null));
    const chunks = await collect(renderToStream(Page));
    assert.ok(chunks[1].includes('&lt;script&gt;'));
    assert.ok(!chunks[1].includes('<script>alert(1)'));
});
