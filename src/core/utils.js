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
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Check if HTML tag is self-closing
 * @param {string} tag
 * @returns {boolean}
 */
export function isSelfClosing(tag) {
    const selfClosingTags = new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);
    return selfClosingTags.has(tag.toLowerCase());
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

    const attributes = [];

    for (const [key, value] of Object.entries(props)) {
        // Skip children, key, ref
        if (key === 'children' || key === 'key' || key === 'ref') {
            continue;
        }

        // Drop attribute names that could break out of the tag
        if (!VALID_ATTR_NAME.test(key)) {
            continue;
        }

        // Handle className -> class
        if (key === 'className') {
            attributes.push(`class="${escapeHtml(String(value))}"`);
            continue;
        }

        // Handle htmlFor -> for
        if (key === 'htmlFor') {
            attributes.push(`for="${escapeHtml(String(value))}"`);
            continue;
        }

        // Handle style object
        if (key === 'style' && typeof value === 'object') {
            const styleString = formatStyle(value);
            if (styleString) {
                attributes.push(`style="${styleString}"`);
            }
            continue;
        }

        // Handle boolean attributes
        // ARIA and enumerated attributes need explicit "true"/"false" values
        // (a bare `aria-hidden` or `draggable` is invalid HTML).
        // Other booleans use the shorthand: present if true, omitted if false.
        if (typeof value === 'boolean') {
            if (key.startsWith('aria-') || ENUMERATED_ATTRS.has(key)) {
                attributes.push(`${key}="${value}"`);
            } else if (value) {
                attributes.push(key);
            }
            continue;
        }

        // Handle event handlers (convert to string for SSR if it's a string, otherwise ignore functions)
        if (key.startsWith('on')) {
            if (typeof value === 'string') {
                attributes.push(`${key.toLowerCase()}="${escapeHtml(value)}"`);
            }
            continue;
        }

        // Handle other attributes
        if (value !== null && value !== undefined) {
            attributes.push(`${key}="${escapeHtml(String(value))}"`);
        }
    }

    return attributes.length > 0 ? ' ' + attributes.join(' ') : '';
}
