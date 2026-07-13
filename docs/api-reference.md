# API Reference

## JSX Setup

### Automatic runtime (recommended)

No pragma comments needed. Configure your build tool once:

```jsonc
// tsconfig.json / jsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "lume-ssr"
  }
}
```

```javascript
// vite.config.js
export default {
  esbuild: { jsx: 'automatic', jsxImportSource: 'lume-ssr' }
};
```

### Classic pragma

```javascript
/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from 'lume-ssr';
```

---

## `h(type, props, ...children)`

JSX pragma function.

- `type`: HTML tag name (string) or component function.
- `props`: Object containing attributes/props.
- `children`: Child elements.

Returns a `SafeString`, or a `Promise<SafeString>` when the subtree contains
async components.

Security behavior:
- String children and attribute values are HTML-escaped.
- Attribute names containing characters that could break out of the tag
  (whitespace, quotes, `=`, `>`, `/`) are dropped. Alpine/Vue-style names
  (`@click`, `:class`, `x-on:click.prevent`) are allowed.
- Invalid tag names throw.

Attribute handling:
- `className` → `class`, `htmlFor` → `for`.
- `style` accepts an object (`{ backgroundColor: 'red' }` → `background-color: red`).
- Boolean props render as bare attributes (`disabled`), except `aria-*` and the
  enumerated attributes `draggable` / `spellcheck` / `contenteditable`, which
  render explicit `"true"` / `"false"` values as the HTML spec requires.
- Tag and attribute case is preserved (SVG `<feGaussianBlur>`, `viewBox` work).
- Function-valued `on*` props are dropped (strings render as classic
  `onclick="..."` attributes).

## `Fragment`

Component to render children without a wrapper element. Supports async children.

## `renderToString(component, props)`

Renders a component to an HTML string.

- `component`: Component function, JSX element, or array of elements.
- `props`: Props object (optional, used when `component` is a function).
- **Returns**: `string` (if sync) or `Promise<string>` (if async) — just `await` it.

## `renderArray(items, renderFn)`

Renders an array of items and joins the result.

- `items`: Array of data items.
- `renderFn`: Function to render each item.

## `serializeState(state, options)`

Serializes state into a `<script type="application/json">` tag for client-side
hydration. Escapes `<` inside the JSON payload, so values containing
`</script>` cannot break out of the tag.

```javascript
serializeState({ count: 1 });
// <script type="application/json" id="__lume_state__">{"count":1}</script>

serializeState(data, { id: 'my-state' });
```

Pairs with lume-js `hydrateState()`, or read it manually:

```javascript
const state = JSON.parse(document.getElementById('__lume_state__').textContent);
```

## `renderDocument(options)`

Creates a full HTML document structure with doctype, charset and viewport meta tags.

- `options`: Object with `head`, `body`, `scripts`, `lang`.
- `lang` is escaped; `head`, `body` and `scripts` are inserted as-is (trusted).

## `raw(str)`

Marks a string as trusted HTML so it bypasses escaping. Only use with HTML you
control — never with user input.

```javascript
<div>{raw(markdownHtml)}</div>
```

`dangerouslySetInnerHTML={{ __html: ... }}` is also supported for familiarity.

## `escapeHtml(str)`

Escapes `&`, `<`, `>`, `"`, `'`. `SafeString` values pass through unescaped.

## `SafeString`

Wrapper class marking a string as already-rendered HTML.
