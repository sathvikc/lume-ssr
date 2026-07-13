import { formatAttributes, isSelfClosing, escapeHtml, SafeString } from './utils.js';

// Tag names must look like real HTML/SVG/custom-element tags. Case is
// preserved so SVG tags like <feGaussianBlur> render correctly.
const VALID_TAG_NAME = /^[a-zA-Z][a-zA-Z0-9-]*$/;

/**
 * Render a single child to its string form.
 * Strings are escaped; SafeStrings pass through; arrays render recursively.
 */
function formatChild(child) {
    if (child === null || child === undefined || typeof child === 'boolean') {
        return '';
    }
    if (child instanceof SafeString) {
        return child.toString();
    }
    if (Array.isArray(child)) {
        return child.map(formatChild).join('');
    }
    if (typeof child === 'string') {
        return escapeHtml(child);
    }
    return escapeHtml(String(child));
}

/**
 * Render a list of children to a string.
 * If any child is a Promise, returns a Promise of the joined string.
 * @param {Array} children
 * @returns {string|Promise<string>}
 */
export function renderChildren(children) {
    if (children.some(c => c instanceof Promise)) {
        return Promise.all(children).then(resolved =>
            resolved.map(formatChild).join('')
        );
    }
    return children.map(formatChild).join('');
}

/**
 * JSX pragma function - converts JSX to HTML strings
 *
 * @param {string|function} type - HTML tag name or component function
 * @param {object} props - Element attributes/props
 * @param {...any} children - Child elements
 * @returns {SafeString|Promise<SafeString>} HTML string wrapped in SafeString
 */
export function h(type, props, ...children) {
    // Flatten children and filter out null/undefined/boolean
    const flattenedChildren = children.flat(Infinity).filter(c =>
        c !== null && c !== undefined && c !== false && c !== true
    );

    // If type is a function (component), call it
    if (typeof type === 'function') {
        return type({ ...props, children: flattenedChildren });
    }

    if (typeof type === 'string') {
        if (!VALID_TAG_NAME.test(type)) {
            throw new Error(`Invalid tag name: ${JSON.stringify(type)}`);
        }

        let innerHTML = null;
        const propsCopy = { ...props };

        // Handle dangerouslySetInnerHTML
        if (propsCopy.dangerouslySetInnerHTML && propsCopy.dangerouslySetInnerHTML.__html) {
            innerHTML = propsCopy.dangerouslySetInnerHTML.__html;
            delete propsCopy.dangerouslySetInnerHTML;
        }

        const attrs = formatAttributes(propsCopy);

        // Handle self-closing (void) tags - children are not allowed
        if (isSelfClosing(type)) {
            return new SafeString(`<${type}${attrs} />`);
        }

        if (innerHTML !== null) {
            return new SafeString(`<${type}${attrs}>${innerHTML}</${type}>`);
        }

        const content = renderChildren(flattenedChildren);
        if (content instanceof Promise) {
            return content.then(c => new SafeString(`<${type}${attrs}>${c}</${type}>`));
        }
        return new SafeString(`<${type}${attrs}>${content}</${type}>`);
    }

    return new SafeString('');
}

/**
 * Fragment component - renders children without wrapper
 * @returns {SafeString|Promise<SafeString>}
 */
export function Fragment({ children } = {}) {
    const list = (Array.isArray(children) ? children : [children])
        .flat(Infinity)
        .filter(c => c !== null && c !== undefined && c !== false && c !== true);

    const content = renderChildren(list);
    if (content instanceof Promise) {
        return content.then(c => new SafeString(c));
    }
    return new SafeString(content);
}
