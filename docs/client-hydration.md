# Client-Side Hydration

Lume-SSR renders static HTML strings. To add interactivity, you can "hydrate" the HTML on the client side using any library.

## Using Lume.js

Pass the initial state from the server to the client:

```javascript
// Server
const html = renderToString(<App />);
res.send(`
  ${html}
  <script>window.__STATE__ = ${JSON.stringify(state)};</script>
  <script type="module" src="/client.js"></script>
`);
```

Hydrate on the client:

```javascript
// Client
import { state, bindDom } from 'lume-js';
const store = state(window.__STATE__);
bindDom(document.body, store);
```

## Using Alpine.js

Embed Alpine.js directives directly in your JSX:

```jsx
const Counter = () => (
  <div x-data="{ count: 0 }">
    <span x-text="count"></span>
    <button @click="count++">Increment</button>
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
