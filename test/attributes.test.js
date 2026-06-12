import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, formatAttributes, formatStyle, escapeHtml, SafeString } from '../src/index.js';

const html = (el) => String(el);

test('escapes attribute values', () => {
    assert.equal(
        html(h('div', { title: '"><script>' })),
        '<div title="&quot;&gt;&lt;script&gt;"></div>'
    );
});

test('drops attribute names that could break out of the tag', () => {
    assert.equal(
        html(h('div', { 'x onmouseover=alert(1) y': 'v' })),
        '<div></div>'
    );
    assert.equal(html(h('div', { '"><script>': 'v' })), '<div></div>');
});

test('allows namespaced and dotted attribute names', () => {
    assert.equal(
        html(h('use', { 'xlink:href': '#icon' })),
        '<use xlink:href="#icon"></use>'
    );
});

test('allows Alpine/Vue shorthand attribute names', () => {
    assert.equal(
        html(h('button', { '@click': 'count++' })),
        '<button @click="count++"></button>'
    );
    assert.equal(html(h('div', { ':class': 'open' })), '<div :class="open"></div>');
    assert.equal(
        html(h('form', { 'x-on:submit.prevent': 'save()' })),
        '<form x-on:submit.prevent="save()"></form>'
    );
});

test('className maps to class', () => {
    assert.equal(html(h('div', { className: 'a b' })), '<div class="a b"></div>');
});

test('htmlFor maps to for', () => {
    assert.equal(html(h('label', { htmlFor: 'x' })), '<label for="x"></label>');
});

test('boolean attributes render as shorthand', () => {
    assert.equal(html(h('input', { disabled: true })), '<input disabled />');
    assert.equal(html(h('input', { disabled: false })), '<input />');
});

test('aria boolean attributes render explicit true/false', () => {
    assert.equal(html(h('div', { 'aria-hidden': true })), '<div aria-hidden="true"></div>');
    assert.equal(html(h('div', { 'aria-expanded': false })), '<div aria-expanded="false"></div>');
});

test('enumerated attributes render explicit true/false', () => {
    assert.equal(html(h('div', { draggable: true })), '<div draggable="true"></div>');
    assert.equal(html(h('div', { spellcheck: false })), '<div spellcheck="false"></div>');
    assert.equal(html(h('div', { contenteditable: true })), '<div contenteditable="true"></div>');
});

test('preserves attribute name case (SVG viewBox)', () => {
    assert.equal(
        html(h('svg', { viewBox: '0 0 10 10' })),
        '<svg viewBox="0 0 10 10"></svg>'
    );
});

test('style objects render kebab-case CSS', () => {
    assert.equal(
        html(h('div', { style: { backgroundColor: 'red', fontSize: '12px' } })),
        '<div style="background-color: red; font-size: 12px"></div>'
    );
});

test('style strings render as-is (escaped)', () => {
    assert.equal(html(h('div', { style: 'color: red' })), '<div style="color: red"></div>');
});

test('event handler functions are dropped, strings kept', () => {
    assert.equal(html(h('button', { onclick: () => {} })), '<button></button>');
    assert.equal(
        html(h('button', { onClick: 'doThing()' })),
        '<button onclick="doThing()"></button>'
    );
});

test('null and undefined attribute values are omitted', () => {
    assert.equal(html(h('div', { id: null, title: undefined })), '<div></div>');
});

test('children, key and ref props are not rendered as attributes', () => {
    assert.equal(html(h('li', { key: 'k', ref: 'r' }, 'x')), '<li>x</li>');
});

test('formatStyle handles non-objects', () => {
    assert.equal(formatStyle(null), '');
    assert.equal(formatStyle('x'), '');
});

test('formatAttributes handles empty props', () => {
    assert.equal(formatAttributes(null), '');
    assert.equal(formatAttributes({}), '');
});

test('escapeHtml escapes all dangerous characters', () => {
    assert.equal(escapeHtml(`&<>"'`), '&amp;&lt;&gt;&quot;&#039;');
});

test('escapeHtml passes SafeString through unescaped', () => {
    assert.equal(escapeHtml(new SafeString('<b>')), '<b>');
});

test('escapeHtml returns non-strings unchanged', () => {
    assert.equal(escapeHtml(42), 42);
});
