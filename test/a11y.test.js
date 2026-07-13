import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, enableA11yWarnings, disableA11yWarnings } from '../src/index.js';

function captureWarnings(fn) {
    const warnings = [];
    enableA11yWarnings(msg => warnings.push(msg));
    try {
        fn();
    } finally {
        disableA11yWarnings();
    }
    return warnings;
}

test('warns on img without alt', () => {
    const warnings = captureWarnings(() => h('img', { src: 'x.png' }));
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /alt/);
});

test('does not warn on img with alt (including empty)', () => {
    const warnings = captureWarnings(() => {
        h('img', { src: 'x.png', alt: '' });
        h('img', { src: 'y.png', alt: 'A cat' });
    });
    assert.deepEqual(warnings, []);
});

test('warns on iframe without title', () => {
    const warnings = captureWarnings(() => h('iframe', { src: 'x.html' }));
    assert.match(warnings[0], /title/);
});

test('warns on html without lang', () => {
    const warnings = captureWarnings(() => h('html', null, h('body', null)));
    assert.match(warnings[0], /lang/);
});

test('warns on anchor without href', () => {
    const warnings = captureWarnings(() => h('a', { onClick: 'go()' }, 'click'));
    assert.ok(warnings.some(w => /href/.test(w)));
});

test('warns on positive tabindex', () => {
    const warnings = captureWarnings(() => h('div', { tabindex: 5 }));
    assert.match(warnings[0], /tabindex/);
});

test('allows tabindex 0 and -1', () => {
    const warnings = captureWarnings(() => {
        h('div', { tabindex: 0 });
        h('div', { tabindex: -1 });
    });
    assert.deepEqual(warnings, []);
});

test('warns on click handlers on non-interactive elements', () => {
    const warnings = captureWarnings(() => h('div', { onclick: 'go()' }));
    assert.match(warnings[0], /button/);
});

test('no warnings and no cost when disabled', () => {
    const warnings = [];
    enableA11yWarnings(msg => warnings.push(msg));
    disableA11yWarnings();
    h('img', { src: 'x.png' });
    assert.deepEqual(warnings, []);
});
