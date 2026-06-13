import { formatAttributes, isSelfClosing, escapeHtml, SafeString } from './utils.js';
import { registeredPlugins, applyElementPlugins } from './plugins.js';

// Tag names must look like real HTML/SVG/custom-element tags. Case is
// preserved so SVG tags like <feGaussianBlur> render correctly.
const VALID_TAG_NAME = /^[a-zA-Z][a-zA-Z0-9-]*$/;

/**
 * Render a single child to its string form.
 * Strings are escaped; SafeStrings pass through; arrays render recursively.
 */
function formatChild(child) {
    if (child instanceof SafeString) {
        return child.str;
    }
    if (typeof child === 'string') {
        return escapeHtml(child);
    }
    if (typeof child === 'number') {
        return '' + child;
    }
    if (child === null || child === undefined || typeof child === 'boolean') {
        return '';
    }
    if (Array.isArray(child)) {
        let out = '';
        for (let i = 0; i < child.length; i++) {
            out += formatChild(child[i]);
        }
        return out;
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
    let out = '';
    for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (c instanceof Promise) {
            // Switch to the async path for the remaining children
            const done = out;
            return Promise.all(children.slice(i)).then(resolved => {
                let rest = done;
                for (let j = 0; j < resolved.length; j++) {
                    rest += formatChild(resolved[j]);
                }
                return rest;
            });
        }
        out += formatChild(c);
    }
    return out;
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
    // Flatten only when an array child exists (e.g. items.map). Flattening is
    // load-bearing for async: it hoists nested Promises to the top level
    // where renderChildren can await them.
    let flattenedChildren = children;
    for (let i = 0; i < flattenedChildren.length; i++) {
        if (Array.isArray(flattenedChildren[i])) {
            flattenedChildren = children.flat(Infinity);
            break;
        }
    }

    // If type is a function (component), call it.
    // Components get the filtered-children contract (no null/boolean holes);
    // plain elements skip the filter - formatChild renders those as ''.
    if (typeof type === 'function') {
        const filtered = flattenedChildren.filter(c =>
            c !== null && c !== undefined && c !== false && c !== true
        );
        return type({ ...props, children: filtered });
    }

    if (typeof type === 'string') {
        // Element plugins may replace tag, props or children
        if (registeredPlugins.length) {
            const result = applyElementPlugins(type, props, flattenedChildren);
            type = result.tag;
            props = result.props;
            flattenedChildren = result.children;
        }

        if (!VALID_TAG_NAME.test(type)) {
            throw new Error(`Invalid tag name: ${JSON.stringify(type)}`);
        }

        // Handle dangerouslySetInnerHTML (formatAttributes ignores the key)
        let innerHTML = null;
        if (props && props.dangerouslySetInnerHTML && props.dangerouslySetInnerHTML.__html) {
            innerHTML = props.dangerouslySetInnerHTML.__html;
        }

        const attrs = formatAttributes(props);

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
