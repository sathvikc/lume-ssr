/**
 * Opt-in accessibility warnings, checked at render time on the server.
 * Implemented as an element plugin - zero cost unless enabled.
 */
import { use, unuse } from './plugins.js';

/**
 * Run accessibility checks for one element, reporting through `warn`.
 * @param {string} tag
 * @param {object|null} props
 * @param {(message: string) => void} warn
 */
export function checkA11y(tag, props, warn) {
    const p = props || {};

    if (tag === 'img' && !('alt' in p)) {
        warn('<img> is missing an alt attribute. Use alt="" for decorative images.');
    }

    if (tag === 'iframe' && !('title' in p)) {
        warn('<iframe> is missing a title attribute describing its content.');
    }

    if (tag === 'html' && !p.lang) {
        warn('<html> is missing a lang attribute (e.g. lang="en").');
    }

    if (tag === 'a' && !('href' in p)) {
        warn('<a> without href is not keyboard-accessible. Use <button> for actions.');
    }

    const tabindex = p.tabindex !== undefined ? p.tabindex : p.tabIndex;
    if (tabindex !== undefined && Number(tabindex) > 0) {
        warn(`Positive tabindex (${tabindex}) breaks natural tab order. Use 0 or -1.`);
    }

    if ((tag === 'div' || tag === 'span') &&
        (typeof p.onclick === 'string' || typeof p.onClick === 'string')) {
        warn(`Click handler on non-interactive <${tag}>. Use <button> so keyboard and screen reader users can activate it.`);
    }
}

/**
 * Enable accessibility warnings during rendering.
 * @param {(message: string) => void} [handler] - defaults to console.warn
 */
export function enableA11yWarnings(handler) {
    const warn = handler || ((message) => console.warn(`[lume-ssr a11y] ${message}`));
    unuse('a11y');
    use({
        name: 'a11y',
        element(tag, props) {
            checkA11y(tag, props, warn);
        }
    });
}

export function disableA11yWarnings() {
    unuse('a11y');
}
