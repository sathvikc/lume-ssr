import type { Component, Element } from './index.js';
import { Fragment, JSX } from './jsx-runtime.js';

export function jsxDEV(
    type: string | Component<any>,
    props?: Record<string, unknown> | null,
    key?: string | number,
    isStaticChildren?: boolean,
    source?: unknown,
    self?: unknown
): Element;

export { Fragment, JSX };
