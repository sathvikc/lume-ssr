/**
 * Automatic JSX dev runtime (used when build tools run in development mode).
 */
import { jsx, Fragment } from './jsx-runtime.js';

export function jsxDEV(type, props, key, isStaticChildren, source, self) {
    return jsx(type, props, key);
}

export { Fragment };
