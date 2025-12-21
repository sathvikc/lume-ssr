# Architecture & Patterns

This document details the technical implementation patterns that emerge from our Core Philosophy.

---

## 1. Components as Pure Functions

**Concept:** 
A Component is simply a JavaScript function that accepts `props` and returns a `SafeString` (or a `Promise` that resolves to one).

```javascript
// Component Definition
export function UserCard({ name, role }) {
  return (
    <div class="card">
      <h2>{name}</h2>
      <span class="role">{role}</span>
    </div>
  );
}
```

**Implementation:**
- The JSX compiler transforms `<UserCard ... />` into `UserCard({ ... })`.
- **No Class Components.**
- **No `this` context.**
- **No Lifecycle methods (`onMount`, `useEffect`).**

**Why:** 
Functions are the most portable unit of logic in JavaScript. They are easily tested, easily composed (`compose(fn1, fn2)`), and tree-shakeable.

---

## 2. The "Universal" Runtime Model

Because our components are just string-returning functions, strictly decoupled from the DOM and Node.js APIs, they enable unique usage patterns:

### Pattern A: Classic Server-Side Rendering (SSR)
**Context:** Node.js / Bun / Edge Worker
```javascript
import { renderToString } from 'lume-ssr';
import { App } from './App.jsx';

app.get('/', (req, res) => {
  const html = renderToString(<App user={req.user} />);
  res.send(html);
});
```

### Pattern B: Client-Side Rendering (CSR)
**Context:** Browser
```javascript
import { UserCard } from './UserCard.js'; // Transpiled

// User is creating components dynamically based on API data
fetch('/api/users').then(users => {
  const list = document.getElementById('user-list');
  
  // Note: No "mount" or "render" function needed. 
  // We just call the function and use the string.
  list.innerHTML = users.map(user => UserCard(user)).join('');
});
```

**Key Insight:** The "Renderer" on the client does not exist. The *Browser itself* (`innerHTML`) is the renderer.

---

## 3. Event Handling Strategy

Since we render strings, we cannot pass function references to event listeners like `onclick`.

### ❌ The "React Pattern" (Does NOT work)
```javascript
function Button() {
  const handleClick = () => console.log('hi');
  return <button onclick={handleClick}>Click</button>; 
  // ⚠️ Function is lost during stringification!
}
```

### ✅ The "Delegation Pattern" (Recommended)
We encourage data-driven architecture. Components declare *intent* via data attributes, and a top-level script handles *behavior*.

**Component:**
```javascript
function Button({ id }) {
  // "I am an action-delete button for item X"
  return <button data-action="delete" data-id={id}>Delete</button>;
}
```

**Client Script (e.g., Lume.js / Vanilla):**
```javascript
document.body.addEventListener('click', e => {
  // Single listener handles ALL buttons in the app
  const btn = e.target.closest('[data-action="delete"]');
  if (btn) {
    deleteItem(btn.dataset.id);
  }
});
```
**Benefits:**
- **Performance:** Fewer event listeners attached.
- **Resilience:** If `innerHTML` replaces the list, the body listener still works (no need to re-bind).
- **Coupling:** HTML logic (structure) is separated from JS logic (behavior).

---

## 4. Control Flow (Loops & Conditionals)

We do not introduce `v-if` or `x-for`. We use standard JavaScript flow control.

**Loops:** `items.map(item => <Item />)`
**If/Else:** `{ condition ? <True /> : <False /> }`
**Short-circuit:** `{ show && <Component /> }`

This ensures that any developer who knows JavaScript automatically knows how to use this library.
