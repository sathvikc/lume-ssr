import { escapeHtml, SafeString } from './utils.js';

export function h(type, props, ...children) {
    const flattenedChildren = children.flat(Infinity).filter(c => 
        c !== null && c !== undefined && c !== false && c !== true
    );

    if (typeof type === 'function') {
        const result = type({ ...props, children: flattenedChildren });
        return result;
    }

    const formatChild = (child) => {
        if (child instanceof SafeString) return child.toString();
        return escapeHtml(String(child));
    };

    if (flattenedChildren.some(c => c instanceof Promise)) {
        return Promise.all(flattenedChildren).then(resolved => {
            const content = resolved.map(formatChild).join('');
            return new SafeString(`<${type}>${content}</${type}>`);
        });
    }

    const content = flattenedChildren.map(child => formatChild(child)).join('');
    return new SafeString(`<${type}>${content}</${type}>`);
}
