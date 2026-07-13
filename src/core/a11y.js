/**
 * Opt-in accessibility warnings, checked at render time on the server.
 * Zero cost unless enabled (a single null check per element).
 */

let a11yHandler = null;

/**
 * Enable accessibility warnings during rendering.
 * @param {(message: string) => void} [handler] - defaults to console.warn
 */
export function enableA11yWarnings(handler) {
    a11yHandler = handler || ((message) => console.warn(`[lume-ssr a11y] ${message}`));
}

export function disableA11yWarnings() {
    a11yHandler = null;
}

/**
 * Run accessibility checks for one element. No-op unless warnings are enabled.
 * @param {string} tag
 * @param {object|null} props
 */
export function checkA11y(tag, props) {
    if (!a11yHandler) {
        return;
    }
    const p = props || {};

    if (tag === 'img' && !('alt' in p)) {
        a11yHandler('<img> is missing an alt attribute. Use alt="" for decorative images.');
    }

    if (tag === 'iframe' && !('title' in p)) {
        a11yHandler('<iframe> is missing a title attribute describing its content.');
    }

    if (tag === 'html' && !p.lang) {
        a11yHandler('<html> is missing a lang attribute (e.g. lang="en").');
    }

    if (tag === 'a' && !('href' in p)) {
        a11yHandler('<a> without href is not keyboard-accessible. Use <button> for actions.');
    }

    const tabindex = p.tabindex !== undefined ? p.tabindex : p.tabIndex;
    if (tabindex !== undefined && Number(tabindex) > 0) {
        a11yHandler(`Positive tabindex (${tabindex}) breaks natural tab order. Use 0 or -1.`);
    }

    if ((tag === 'div' || tag === 'span') &&
        (typeof p.onclick === 'string' || typeof p.onClick === 'string')) {
        a11yHandler(`Click handler on non-interactive <${tag}>. Use <button> so keyboard and screen reader users can activate it.`);
    }
}
