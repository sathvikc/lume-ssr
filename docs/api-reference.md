# API Reference

## `h(type, props, ...children)`

JSX pragma function.

- `type`: HTML tag name (string) or component function.
- `props`: Object containing attributes/props.
- `children`: Child elements.

## `Fragment`

Component to render children without a wrapper element.

## `renderToString(component, props)`

Renders a component to an HTML string.

- `component`: Component function or JSX element.
- `props`: Props object (optional).
- **Returns**: `string` (if sync) or `Promise<string>` (if async).

## `renderArray(items, renderFn)`

Renders an array of items.

- `items`: Array of data items.
- `renderFn`: Function to render each item.

## `renderDocument(options)`

Creates a full HTML document structure.

- `options`: Object with `head`, `body`, `scripts`, `lang`.
