import { escapeHtml, SafeString } from './utils.js';

export function h(type, ...children) {
    const flattenedChildren = children.flat(Infinity);
    const content = flattenedChildren.map(c => 
        c instanceof SafeString ? c.toString() : escapeHtml(String(c))
    ).join('');
    
    return new SafeString(`<${type}>${content}</${type}>`);
}
