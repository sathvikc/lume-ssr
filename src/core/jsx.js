import { escapeHtml, SafeString } from './utils.js';

export function h(type, props, ...children) {
    const flattenedChildren = children.flat(Infinity).filter(c => 
        c !== null && c !== undefined && c !== false && c !== true
    );

    if (typeof type === 'function') {
        return type({ ...props, children: flattenedChildren });
    }

    const content = flattenedChildren.map(c => 
        c instanceof SafeString ? c.toString() : escapeHtml(String(c))
    ).join('');
    
    return new SafeString(`<${type}>${content}</${type}>`);
}
