import type { Child, Component, Element, HTMLAttributes } from './index.js';

export function jsx(
    type: string | Component<any>,
    props?: Record<string, unknown> | null,
    key?: string | number
): Element;

export const jsxs: typeof jsx;

export function Fragment(props?: { children?: Child | Child[] }): Element;

export namespace JSX {
    type Element = import('./index.js').Element;
    interface ElementChildrenAttribute {
        children: {};
    }
    interface IntrinsicAttributes {
        key?: string | number;
    }
    interface IntrinsicElements {
        [tagName: string]: HTMLAttributes;
    }
}
