export class SafeString {
    constructor(str) {
        this.str = str;
    }
    toString() {
        return this.str;
    }
}

/**
 * Mark a string as trusted HTML so it bypasses escaping.
 * Only use with HTML you control - never with user input.
 * @param {string} str
 * @returns {SafeString}
 */
export function raw(str) {
    return str instanceof SafeString ? str : new SafeString(String(str));
}

const ESCAPE_TEST = /[&<>"']/;

/**
 * Escape HTML entities to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
    if (str instanceof SafeString) {
        return str.toString();
    }
    if (typeof str !== 'string') {
        return str;
    }
    if (!ESCAPE_TEST.test(str)) {
        return str;
    }
    // Single pass: copy clean spans, splice in entities
    let out = '';
    let last = 0;
    for (let i = 0; i < str.length; i++) {
        let entity;
        switch (str.charCodeAt(i)) {
            case 38: entity = '&amp;'; break;   // &
            case 60: entity = '&lt;'; break;    // <
            case 62: entity = '&gt;'; break;    // >
            case 34: entity = '&quot;'; break;  // "
            case 39: entity = '&#039;'; break;  // '
            default: continue;
        }
        out += str.slice(last, i) + entity;
        last = i + 1;
    }
    return out + str.slice(last);
}

const SELF_CLOSING_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

/**
 * Check if HTML tag is self-closing
 * @param {string} tag
 * @returns {boolean}
 */
export function isSelfClosing(tag) {
    return SELF_CLOSING_TAGS.has(tag) || SELF_CLOSING_TAGS.has(tag.toLowerCase());
}

/**
 * Convert camelCase to kebab-case (for CSS properties)
 * @param {string} str
 * @returns {string}
 */
export function camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Format style object to CSS string
 * @param {object} styleObj
 * @returns {string}
 */
export function formatStyle(styleObj) {
    if (!styleObj || typeof styleObj !== 'object') {
        return '';
    }
    return Object.entries(styleObj)
        .map(([key, value]) => {
            const kebabKey = camelToKebab(key);
            const escapedValue = escapeHtml(String(value));
            return `${kebabKey}: ${escapedValue}`;
        })
        .join('; ');
}

// Attribute names must not contain characters that can break out of the tag
// (whitespace, quotes, =, >, /) - those are an injection vector via spread
// props. `@` and `:` are allowed so Alpine/Vue-style shorthands (`@click`,
// `:class`, `x-on:click.prevent`) keep working.
const VALID_ATTR_NAME = /^[a-zA-Z:@][a-zA-Z0-9:._@-]*$/;

// Validated names are cached: real pages reuse a handful of attribute names
// millions of times. Bounded so adversarial spread props can't grow it.
const VALID_NAME_CACHE = new Set();
const VALID_NAME_CACHE_MAX = 1000;

function isValidAttrName(key) {
    if (VALID_NAME_CACHE.has(key)) {
        return true;
    }
    if (!VALID_ATTR_NAME.test(key)) {
        return false;
    }
    if (VALID_NAME_CACHE.size < VALID_NAME_CACHE_MAX) {
        VALID_NAME_CACHE.add(key);
    }
    return true;
}

// Enumerated attributes take literal "true"/"false" values; a bare attribute
// name (the boolean-attribute shorthand) is invalid for these.
const ENUMERATED_ATTRS = new Set(['draggable', 'spellcheck', 'contenteditable']);

/**
 * Format props object to HTML attributes string
 * @param {object} props
 * @returns {string}
 */
export function formatAttributes(props) {
    if (!props || typeof props !== 'object') {
        return '';
    }

    let out = '';

    for (const key of Object.keys(props)) {
        // Skip children, key, ref and the raw-HTML escape hatch
        if (key === 'children' || key === 'key' || key === 'ref' || key === 'dangerouslySetInnerHTML') {
            continue;
        }

        // Drop attribute names that could break out of the tag
        if (!isValidAttrName(key)) {
            continue;
        }

        const value = props[key];

        // Fast path: plain string values on safe names
        if (typeof value === 'string') {
            if (key === 'className') {
                out += ` class="${escapeHtml(value)}"`;
            } else if (key === 'htmlFor') {
                out += ` for="${escapeHtml(value)}"`;
            } else if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) { // 'on*'
                out += ` ${key.toLowerCase()}="${escapeHtml(value)}"`;
            } else {
                out += ` ${key}="${escapeHtml(value)}"`;
            }
            continue;
        }

        // Handle boolean attributes
        // ARIA and enumerated attributes need explicit "true"/"false" values
        // (a bare `aria-hidden` or `draggable` is invalid HTML).
        // Other booleans use the shorthand: present if true, omitted if false.
        if (typeof value === 'boolean') {
            if (key.startsWith('aria-') || ENUMERATED_ATTRS.has(key)) {
                out += ` ${key}="${value}"`;
            } else if (value && !(key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110)) {
                out += ` ${key}`;
            }
            continue;
        }

        // Handle style object
        if (key === 'style' && typeof value === 'object') {
            const styleString = formatStyle(value);
            if (styleString) {
                out += ` style="${styleString}"`;
            }
            continue;
        }

        // Event handlers: only string values render (functions don't serialize)
        if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) { // 'on*'
            continue;
        }

        // Handle other attributes
        if (value !== null && value !== undefined) {
            if (key === 'className') {
                out += ` class="${escapeHtml(String(value))}"`;
            } else if (key === 'htmlFor') {
                out += ` for="${escapeHtml(String(value))}"`;
            } else {
                out += ` ${key}="${escapeHtml(String(value))}"`;
            }
        }
    }

    return out;
}
