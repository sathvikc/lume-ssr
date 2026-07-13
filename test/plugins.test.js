import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, use, unuse, renderToString, htmlResponse } from '../src/index.js';

const html = (el) => String(el);

function withPlugin(plugin, fn) {
    const remove = use(plugin);
    try {
        return fn();
    } finally {
        remove();
    }
}

test('element plugin can rewrite props', () => {
    const out = withPlugin({
        name: 'nonce',
        element(tag, props) {
            if (tag === 'script') return { props: { ...props, nonce: 'abc' } };
        }
    }, () => html(h('script', { src: '/x.js' })));
    assert.equal(out, '<script src="/x.js" nonce="abc"></script>');
});

test('element plugin can rewrite the tag', () => {
    const out = withPlugin({
        name: 'b-to-strong',
        element(tag) {
            if (tag === 'b') return { tag: 'strong' };
        }
    }, () => html(h('b', null, 'x')));
    assert.equal(out, '<strong>x</strong>');
});

test('element plugin can rewrite children', () => {
    const out = withPlugin({
        name: 'redact',
        element(tag, props, children) {
            if (tag === 'secret-text') return { tag: 'span', children: ['[redacted]'] };
        }
    }, () => html(h('secret-text', null, 'password123')));
    assert.equal(out, '<span>[redacted]</span>');
});

test('plugins run in registration order', () => {
    const calls = [];
    const r1 = use({ name: 'first', element: () => { calls.push(1); } });
    const r2 = use({ name: 'second', element: () => { calls.push(2); } });
    try {
        h('div', null);
        assert.deepEqual(calls, [1, 2]);
    } finally {
        r1();
        r2();
    }
});

test('plugins do not run for component functions', () => {
    const tags = [];
    withPlugin({ name: 'spy', element(tag) { tags.push(tag); } }, () => {
        const Card = () => h('div', null, 'x');
        renderToString(h(Card, null));
    });
    assert.deepEqual(tags, ['div']);
});

test('unuse removes a plugin; rendering returns to normal', () => {
    use({ name: 'temp', element: () => ({ tag: 'i' }) });
    unuse('temp');
    assert.equal(html(h('b', null, 'x')), '<b>x</b>');
});

test('plugin-rewritten tags are still validated', () => {
    assert.throws(() => withPlugin({
        name: 'evil',
        element: () => ({ tag: 'div onclick=alert(1)' })
    }, () => h('div', null)), /Invalid tag name/);
});

test('use validates the plugin shape', () => {
    assert.throws(() => use({}), /string `name`/);
    assert.throws(() => use({ name: 'x', element: 'nope' }), /must be a function/);
    unuse('x');
});

test('htmlResponse returns a streaming text/html Response', async () => {
    const res = htmlResponse(() => h('p', null, 'hi'));
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(res.status, 200);
    assert.equal(await res.text(), '<p>hi</p>');
});

test('htmlResponse honors status, custom headers and props', async () => {
    const Page = ({ name }) => h('h1', null, name);
    const res = htmlResponse(Page, {
        props: { name: 'Lume' },
        status: 404,
        headers: { 'x-test': '1' }
    });
    assert.equal(res.status, 404);
    assert.equal(res.headers.get('x-test'), '1');
    assert.equal(await res.text(), '<h1>Lume</h1>');
});
