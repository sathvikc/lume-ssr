import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    h,
    raw,
    renderToString,
    renderArray,
    renderDocument,
    serializeState,
    SafeString
} from '../src/index.js';

test('renderToString returns a plain string for sync trees', () => {
    const out = renderToString(h('p', null, 'hi'));
    assert.equal(typeof out, 'string');
    assert.equal(out, '<p>hi</p>');
});

test('renderToString calls function components with props', () => {
    const Greet = ({ name }) => h('h1', null, `Hello ${name}`);
    assert.equal(renderToString(Greet, { name: 'Dev' }), '<h1>Hello Dev</h1>');
});

test('renderToString returns a Promise for async trees', async () => {
    const Late = async () => h('p', null, 'late');
    const out = renderToString(h('div', null, h(Late, null)));
    assert.ok(out instanceof Promise);
    assert.equal(await out, '<div><p>late</p></div>');
});

test('renderToString handles arrays of elements', () => {
    const out = renderToString([h('p', null, 'a'), h('p', null, 'b')]);
    assert.equal(out, '<p>a</p><p>b</p>');
});

test('renderToString handles arrays containing async elements', async () => {
    const Late = async () => h('p', null, 'b');
    const out = await renderToString([h('p', null, 'a'), h(Late, null)]);
    assert.equal(out, '<p>a</p><p>b</p>');
});

test('renderArray joins rendered items', () => {
    const out = renderArray([1, 2], n => h('li', null, n));
    assert.equal(out, '<li>1</li><li>2</li>');
});

test('renderArray returns empty string for non-arrays', () => {
    assert.equal(renderArray(null, () => ''), '');
});

test('raw marks trusted html', () => {
    assert.ok(raw('<b>x</b>') instanceof SafeString);
    assert.equal(renderToString(h('div', null, raw('<b>x</b>'))), '<div><b>x</b></div>');
});

test('renderDocument produces a full document', () => {
    const doc = renderDocument({ body: '<p>hi</p>' });
    assert.ok(doc.startsWith('<!DOCTYPE html>'));
    assert.ok(doc.includes('<html lang="en">'));
    assert.ok(doc.includes('<p>hi</p>'));
});

test('renderDocument escapes the lang attribute', () => {
    const doc = renderDocument({ lang: 'en"><script>alert(1)</script>' });
    assert.ok(!doc.includes('<script>alert(1)</script>'));
    assert.ok(doc.includes('lang="en&quot;&gt;&lt;script&gt;'));
});

test('serializeState emits a JSON script tag', () => {
    const tag = String(serializeState({ count: 1 }));
    assert.equal(
        tag,
        '<script type="application/json" id="__lume_state__">{"count":1}</script>'
    );
});

test('serializeState accepts a custom id and escapes it', () => {
    const tag = String(serializeState({}, { id: 'app"-state' }));
    assert.ok(tag.includes('id="app&quot;-state"'));
});

test('serializeState prevents </script> breakout', () => {
    const tag = String(serializeState({ evil: '</script><script>alert(1)</script>' }));
    assert.ok(!tag.includes('</script><script>'));
    assert.ok(tag.includes('\\u003c/script'));
    // Round-trips: the client gets the original value back
    const json = tag.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    assert.deepEqual(JSON.parse(json), { evil: '</script><script>alert(1)</script>' });
});

test('serializeState escapes U+2028/U+2029 line separators', () => {
    const tag = String(serializeState({ s: '  ' }));
    assert.ok(!tag.includes(' '));
    assert.ok(!tag.includes(' '));
    assert.ok(tag.includes('\\u2028\\u2029'));
});

test('serializeState handles undefined state', () => {
    assert.ok(String(serializeState(undefined)).includes('>null</script>'));
});
