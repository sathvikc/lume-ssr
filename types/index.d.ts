/**
 * Type definitions for lume-ssr.
 */

export class SafeString {
    constructor(str: string);
    toString(): string;
}

/** Anything that can appear as a JSX child. */
export type Child =
    | string
    | number
    | boolean
    | null
    | undefined
    | SafeString
    | Promise<Child>
    | Child[];

/** The result of rendering a JSX element. */
export type Element = SafeString | Promise<SafeString>;

/** What a component may return. */
export type ComponentResult = Element | string | Promise<string | SafeString>;

/** A component is a plain function from props to markup. */
export type Component<P = {}> = (props: P & { children?: Child[] }) => ComponentResult;

/** Common HTML attributes. Permissive by design: any attribute is allowed. */
export interface HTMLAttributes {
    id?: string;
    class?: string;
    className?: string;
    htmlFor?: string;
    style?: string | Record<string, string | number>;
    title?: string;
    lang?: string;
    dir?: string;
    hidden?: boolean;
    tabindex?: number | string;
    role?: string;
    href?: string;
    src?: string;
    alt?: string;
    type?: string;
    name?: string;
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
    checked?: boolean;
    required?: boolean;
    readonly?: boolean;
    selected?: boolean;
    draggable?: boolean;
    spellcheck?: boolean;
    contenteditable?: boolean;
    dangerouslySetInnerHTML?: { __html: string };
    children?: Child | Child[];
    key?: string | number;
    [attr: string]: unknown;
}

export function h(
    type: string | Component<any>,
    props?: Record<string, unknown> | null,
    ...children: Child[]
): Element;

export function Fragment(props?: { children?: Child | Child[] }): Element;

/** Render a list of children; Promise when any child is async. */
export function renderChildren(children: Child[]): string | Promise<string>;

export function renderToString(component: string | SafeString): string;
export function renderToString(component: Promise<unknown>): Promise<string>;
export function renderToString<P>(
    component: Component<P>,
    props?: P
): string | Promise<string>;
export function renderToString(
    component: unknown,
    props?: Record<string, unknown>
): string | Promise<string>;

export function renderArray<T>(
    items: T[],
    renderFn: (item: T) => string | SafeString
): string;

/**
 * Serialize state into a `<script type="application/json">` tag for
 * client-side hydration (pairs with lume-js `hydrateState()`).
 */
export function serializeState(state: unknown, options?: { id?: string }): SafeString;

export function renderDocument(options?: {
    head?: string | SafeString;
    body?: string | SafeString;
    scripts?: string | SafeString;
    lang?: string;
}): string;

/** Mark a string as trusted HTML so it bypasses escaping. */
export function raw(str: string | SafeString): SafeString;

/**
 * Render to a web-standard ReadableStream of UTF-8 bytes. Pass a component
 * function so Suspense boundaries stream out of order; the shell flushes first.
 */
export function renderToStream<P>(
    component: Component<P> | unknown,
    props?: P
): ReadableStream<Uint8Array>;

/**
 * Streams a fallback immediately and swaps in async content when it resolves.
 * Transparent inside renderToString or when children are synchronous.
 */
export function Suspense(props: {
    fallback?: Child;
    children?: Child | Child[];
    onError?: (err: unknown) => Child;
}): Element;

/** Enable render-time accessibility warnings (defaults to console.warn). */
export function enableA11yWarnings(handler?: (message: string) => void): void;
export function disableA11yWarnings(): void;

export function escapeHtml(str: string): string;
export function escapeHtml<T>(str: T): T;
export function formatAttributes(props: Record<string, unknown>): string;
export function formatStyle(styleObj: Record<string, string | number>): string;

declare const _default: {
    h: typeof h;
    Fragment: typeof Fragment;
    renderToString: typeof renderToString;
};
export default _default;

declare global {
    namespace JSX {
        type Element = import('./index.js').Element;
        interface ElementChildrenAttribute {
            children: {};
        }
        interface IntrinsicAttributes {
            key?: string | number;
        }
        interface IntrinsicElements {
            [tagName: string]: import('./index.js').HTMLAttributes;
        }
    }
}
