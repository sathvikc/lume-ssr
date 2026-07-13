# Client-Side Hydration

Lume-SSR renders static HTML strings. To add interactivity, you can "hydrate" the HTML on the client side using any library.

## Passing state from server to client

Use `serializeState()` to embed state safely. It emits a `<script type="application/json">` tag and escapes `<` inside the payload, so user data containing `</script>` cannot break out of the tag:

```javascript
// Server
import { renderToString, serializeState } from 'lume-ssr';

const html = renderToString(<App />);
res.send(`<!DOCTYPE html>
  ${html}
  ${serializeState(state)}
  <script type="module" src="/client.js"></script>
`);
```

> ⚠️ Avoid the common `window.__STATE__ = ${JSON.stringify(state)}` pattern inside a
> `<script>` tag — if any state value contains `</script>`, it becomes an XSS hole.
> `serializeState()` exists so you never have to think about this.

## Using Lume.js

Hydrate on the client:

```javascript
// Client
import { state, bindDom } from 'lume-js';

const initial = JSON.parse(document.getElementById('__lume_state__').textContent);
const store = state(initial);
bindDom(document.body, store);
```

Because lume-js binds through `data-*` attributes, there is no tree reconciliation:
the server HTML doesn't need to match a client render, so hydration mismatches
cannot happen.

## Using Alpine.js

Embed Alpine.js directives directly in your JSX:

```jsx
const Counter = () => (
  <div x-data="{ count: 0 }">
    <span x-text="count"></span>
    <button {...{ '@click': 'count++' }}>Increment</button>
  </div>
);
```

Include the Alpine.js script in your HTML head.

## Using Vanilla JS

Add event listeners to the DOM elements:

```javascript
document.getElementById('my-button').addEventListener('click', () => {
  // ...
});
```
