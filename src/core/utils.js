export class SafeString {
    constructor(str) {
        this.str = str;
    }
    toString() {
        return this.str;
    }
}

export function escapeHtml(str) {
    if (str instanceof SafeString) return str.toString();
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
