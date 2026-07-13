/**
 * Automatic JSX runtime (React 17+ transform).
 *
 * Lets build tools transform JSX without pragma comments:
 *   - tsconfig.json: { "jsx": "react-jsx", "jsxImportSource": "lume-ssr" }
 *   - vite/esbuild:  { jsx: 'automatic', jsxImportSource: 'lume-ssr' }
 */
import { h, Fragment } from './core/jsx.js';

export function jsx(type, props, key) {
    const { children, ...rest } = props ?? {};
    if (children === undefined) {
        return h(type, rest);
    }
    if (Array.isArray(children)) {
        return h(type, rest, ...children);
    }
    return h(type, rest, children);
}

// In the automatic runtime jsxs is the static-children variant; output is
// identical for string rendering.
export const jsxs = jsx;

export { Fragment };
