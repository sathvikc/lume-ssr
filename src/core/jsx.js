import { formatAttributes, isSelfClosing, escapeHtml, SafeString } from './utils.js';

/**
 * JSX pragma function - converts JSX to HTML strings
 * 
 * @param {string|function} type - HTML tag name or component function
 * @param {object} props - Element attributes/props
 * @param {...any} children - Child elements
 * @returns {SafeString|string} HTML string wrapped in SafeString
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
        let innerHTML = null;
        const propsCopy = { ...props };

        // Handle dangerouslySetInnerHTML
        if (propsCopy.dangerouslySetInnerHTML && propsCopy.dangerouslySetInnerHTML.__html) {
            innerHTML = propsCopy.dangerouslySetInnerHTML.__html;
            delete propsCopy.dangerouslySetInnerHTML;
        }

        const attrs = formatAttributes(propsCopy);
        const tag = type.toLowerCase();

        // Handle self-closing tags
        if (isSelfClosing(tag)) {
            return new SafeString(`<${tag}${attrs} />`);
        }

        // Helper to format children strings
        const formatChild = (child) => {
            if (child instanceof SafeString) {
                return child.toString();
            }
            if (typeof child === 'string') {
                return escapeHtml(child);
            }
            return String(child);
        };

        if (innerHTML !== null) {
            return new SafeString(`<${tag}${attrs}>${innerHTML}</${tag}>`);
        } else {
            // Check for Promises in children (Bubble up async)
            if (flattenedChildren.some(c => c instanceof Promise)) {
                return Promise.all(flattenedChildren).then(resolved => {
                    const content = resolved.map(formatChild).join('');
                    return new SafeString(`<${tag}${attrs}>${content}</${tag}>`);
                });
            }

            // Sync path
            const content = flattenedChildren.map(formatChild).join('');
            return new SafeString(`<${tag}${attrs}>${content}</${tag}>`);
        }
    }

    return new SafeString('');
}

/**
 * Fragment component - renders children without wrapper
 */
export function Fragment({ children }) {
    if (Array.isArray(children)) {
        return new SafeString(children.map(c =>
            c instanceof SafeString ? c.toString() : escapeHtml(String(c))
        ).join(''));
    }
    if (children instanceof SafeString) {
        return children;
    }
    return new SafeString(children ? escapeHtml(String(children)) : '');
}
