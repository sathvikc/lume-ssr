# AI Agent Context & Instructions

**Role:** You are an expert software engineer working on a High-Performance, Framework-Agnostic, Standards-Only HTML generation library. 
**Objective:** Maintain strict adherence to the "Unix Philosophy" and "Zero Runtime" architecture.

---

## 🛑 The 5 Immutable Laws (DO NOT BREAK)

1.  **NO Client Runtime allowed:** Never import a library that requires a browser runtime (like React, Vue, Alpine). The output must be pure HTML/String.
2.  **NO Node.js Specifics in Core:** `src/core/` must be 100% universal. Do not use `fs`, `path`, or `process`.
3.  **NO Virtual DOM:** We operate on Strings. Do not suggest diffing algorithms.
4.  **NO "Proprietary" Syntax:** We use Standard JSX. Do not invent `<v-if>` or `@click`. Use JS logic (`.map`, `? :`).
5.  **Pure Functions Only:** Components are functions `(props) => SafeString`. No Classes. No `this`.

---

## 🧠 Mental Model for Code Generation

**You are NOT writing React.**
- ❌ `useEffect`, `useState`, `useContext` -> **BANNED**.
- ❌ `onClick={() => {}}` -> **BANNED** (Function refs die in stringification).
- ✅ `<button onclick="globalFn()">` -> **ALLOWED** (String attributes).
- ✅ `<button data-action="save">` -> **PREFERRED** (Event Delegation).

**You are NOT writing EJS/Handlebars.**
- ❌ `<% if (x) { %>` -> **BANNED**.
- ✅ `{ x && <span>...</span> }` -> **REQUIRED** (Standard JS expressions).

---

## 📂 Project Structure Understanding

- **`src/core/jsx.js`**: The compiler. It translates `h()` calls to `SafeString`. 
- **`src/core/render.js`**: The API. `renderToString()`.
- **`src/core/utils.js`**: Universal helpers. No dependencies allowed here.

---

## 📝 Common Patterns to Follow

### 1. The "Universal Component" Pattern
When asked to create a reusable component, use this template:
```javascript
import { h } from '../core/jsx.js'; // Ensure correct path

/**
 * Universal Card Component
 * Works in: Node.js, Edge, Browser (CSR)
 * @param {object} props
 * @param {string} props.title
 */
export function Card({ title, children }) {
  // Logic here (Isomorphic only)
  const safeTitle = title.trim();

  return (
    <div class="card">
      <h3>{safeTitle}</h3>
      <div class="card-body">
        {children}
      </div>
    </div>
  );
}
```

### 2. The "Event Intent" Pattern
When adding interactivity explanation:
"Since we don't not ship a JS runtime, we use data attributes to declare intent."

```javascript
/* Preferred Output */
<button data-action="delete" data-id="123">Delete</button>
```

---

## ⚠️ Critical Edge Cases

- **XSS Protection:** Always assume user input is dangerous. `core/jsx.js` auto-escapes, but be careful with `dangerouslySetInnerHTML`.
- **Hydration:** If the user asks "How do I make this interactive?", suggest **Event Delegation** scripts (Vanilla JS) or a tiny hydration script (Lume-JS), but KEEP THE COMPONENT PURE.
