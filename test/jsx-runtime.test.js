import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jsx, jsxs, Fragment } from '../src/jsx-runtime.js';
import { jsxDEV } from '../src/jsx-dev-runtime.js';

const html = (el) => String(el);

test('jsx renders an element with no children', () => {
    assert.equal(html(jsx('div', { class: 'x' })), '<div class="x"></div>');
});

test('jsx renders a single child (automatic transform shape)', () => {
    assert.equal(html(jsx('p', { children: 'hi' })), '<p>hi</p>');
});

test('jsxs renders multiple children (automatic transform shape)', () => {
    assert.equal(
        html(jsxs('ul', { children: [jsx('li', { children: 'a' }), jsx('li', { children: 'b' })] })),
        '<ul><li>a</li><li>b</li></ul>'
    );
});

test('jsx escapes string children', () => {
    assert.equal(html(jsx('p', { children: '<x>' })), '<p>&lt;x&gt;</p>');
});

test('jsx supports function components', () => {
    const Item = ({ label }) => jsx('li', { children: label });
    assert.equal(html(jsx(Item, { label: 'x' })), '<li>x</li>');
});

test('jsx supports Fragment', () => {
    assert.equal(
        html(jsx(Fragment, { children: [jsx('b', { children: 'a' }), 'c'] })),
        '<b>a</b>c'
    );
});

test('jsxDEV matches jsx output', () => {
    assert.equal(
        html(jsxDEV('p', { children: 'hi' }, undefined, false, undefined, undefined)),
        html(jsx('p', { children: 'hi' }))
    );
});
