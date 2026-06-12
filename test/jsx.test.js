import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, Fragment, SafeString, renderToString } from '../src/index.js';

const html = (el) => String(el);

test('renders a basic element', () => {
    assert.equal(html(h('div', null, 'hello')), '<div>hello</div>');
});

test('renders nested elements', () => {
    assert.equal(
        html(h('ul', null, h('li', null, 'a'), h('li', null, 'b'))),
        '<ul><li>a</li><li>b</li></ul>'
    );
});

test('escapes text children', () => {
    assert.equal(
        html(h('p', null, '<script>alert(1)</script>')),
        '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>'
    );
});

test('does not escape SafeString children', () => {
    assert.equal(
        html(h('div', null, new SafeString('<b>bold</b>'))),
        '<div><b>bold</b></div>'
    );
});

test('renders number children', () => {
    assert.equal(html(h('p', null, 42)), '<p>42</p>');
});

test('filters null, undefined and boolean children', () => {
    assert.equal(
        html(h('div', null, null, undefined, false, true, 'x')),
        '<div>x</div>'
    );
});

test('flattens nested child arrays (e.g. items.map)', () => {
    assert.equal(
        html(h('ul', null, ['a', 'b'].map(x => h('li', null, x)))),
        '<ul><li>a</li><li>b</li></ul>'
    );
});

test('preserves tag name case for SVG elements', () => {
    assert.equal(
        html(h('feGaussianBlur', { stdDeviation: 5 })),
        '<feGaussianBlur stdDeviation="5"></feGaussianBlur>'
    );
});

test('renders custom elements', () => {
    assert.equal(html(h('my-widget', null, 'x')), '<my-widget>x</my-widget>');
});

test('throws on invalid tag names', () => {
    assert.throws(() => h('div onclick=alert(1)', null), /Invalid tag name/);
});

test('renders void elements without children', () => {
    assert.equal(html(h('img', { src: 'x.png', alt: '' })), '<img src="x.png" alt="" />');
    assert.equal(html(h('br', null)), '<br />');
});

test('calls function components with props and children', () => {
    const Card = ({ title, children }) => h('div', { class: 'card' }, h('h2', null, title), children);
    assert.equal(
        html(h(Card, { title: 'Hi' }, h('p', null, 'body'))),
        '<div class="card"><h2>Hi</h2><p>body</p></div>'
    );
});

test('dangerouslySetInnerHTML injects raw html', () => {
    assert.equal(
        html(h('div', { dangerouslySetInnerHTML: { __html: '<b>raw</b>' } })),
        '<div><b>raw</b></div>'
    );
});

test('Fragment renders children without a wrapper', () => {
    assert.equal(
        html(h(Fragment, null, h('p', null, 'a'), h('p', null, 'b'))),
        '<p>a</p><p>b</p>'
    );
});

test('Fragment escapes text children', () => {
    assert.equal(html(h(Fragment, null, '<x>')), '&lt;x&gt;');
});

test('Fragment handles a single child', () => {
    assert.equal(html(h(Fragment, null, 'only')), 'only');
});

test('Fragment with no children renders empty string', () => {
    assert.equal(html(Fragment({})), '');
    assert.equal(html(Fragment()), '');
});

test('async component resolves inside an element', async () => {
    const Late = async () => h('span', null, 'late');
    const out = await renderToString(h('div', null, h(Late, null)));
    assert.equal(out, '<div><span>late</span></div>');
});

test('async component resolves inside a Fragment', async () => {
    const Late = async () => h('span', null, 'late');
    const out = await renderToString(h(Fragment, null, h('b', null, 'now'), h(Late, null)));
    assert.equal(out, '<b>now</b><span>late</span>');
});

test('async children escape resolved strings', async () => {
    const Evil = async () => '<script>';
    const out = await renderToString(h('div', null, h(Evil, null)));
    assert.equal(out, '<div>&lt;script&gt;</div>');
});

test('deeply nested async components bubble up', async () => {
    const Inner = async () => h('i', null, 'deep');
    const Outer = () => h('section', null, h('div', null, h(Inner, null)));
    const out = await renderToString(h(Outer, null));
    assert.equal(out, '<section><div><i>deep</i></div></section>');
});
