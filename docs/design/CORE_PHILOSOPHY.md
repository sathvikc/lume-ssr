# Core Philosophy

This document outlines the fundamental principles driving this project. It is the "Constitutional Law" of the codebase—all technical decisions must verify against these pillars.

---

## 1. The "Standards-Only" Principle

**Decision:** The output of this library is **Standard HTML Strings**, and the input is **Standard JavaScript**. We avoid proprietary syntax wherever possible.

**Reasoning:**
- **Durability:** Frameworks die; HTML is forever. A component written as a function returning a string will likely run 10 years from now. A component written in a specific framework version (e.g., React Class Components) is already "legacy".
- **Portability:** HTML strings can be sent from a Node.js server, a Go server, embedded in a PHP app, or injected into a `<div>` by a jQuery script.
- **Simplicity:** By targeting the lowest common denominator (strings), we remove the need for complex runtime layers (Virtual DOMs, Observables, Signals) in the rendering tier.

**Alternatives Considered:**
- ❌ **Virtual DOM:** Adds runtime weight and complexity. Good for complex state, bad for "just rendering HTML".
- ❌ **Template DSLs (Handlebars/Mustache):** Great for strings, but lose the power of JavaScript expressions (TypeScript, linting, composition).

---

## 2. Framework Agnosticism (The "Unix Philosophy")

**Decision:** This library does **one thing**: converts JSX structures into HTML strings. It does not know about:
- Your HTTP Server (Express, Hono, Fastify)
- Your Client Framework (Lume, Alpine, React, Vanilla)
- Your Build Tool (Vite, Webpack, TSC)

**Reasoning:**
- **Integration:** You should be able to "drop this in" to an existing Express API to render an email template without rewriting your server stack.
- **Respect:** We assume the developer knows how they want to serve/hyrdate content. We just provide the markup.
- **Escape Hatch:** Modern meta-frameworks (Next/Nuxt/Astro) are "All or Nothing". This library is "Just a piece".

---

## 3. Universal / Isomorphic by Design

**Decision:** The core logic must run in **any JavaScript environment** (Node.js, Deno, Bun, Browser, Edge Workers).

**Reasoning:**
- **Code Sharing:** A developer should be able to write a `<Card />` component and use it to:
    1. Render the initial HTML on the server (SEO/Percieved usage).
    2. Re-render it on the client after fetching new data (CSR).
- **No "Server-Only" logic:** We avoid Node.js specific APIs (like `fs` or `Buffer`) in the core rendering path.
- **No "Browser-Only" logic:** We avoid DOM specific APIs (like `document.createElement`) in the core rendering path.

**Tradeoff:** 
- We cannot use standard DOM events (`onclick={fn}`) directly because functions don't serialize to strings. We rely on **Event Delegation** or classic attribute strings (`onclick="globalFn()"`) for interactivity.

---

## 4. JSX as a "Logic Layer", not a "Framework"

**Decision:** We use JSX solely as clearer syntax for nested function calls (`h()`). We do not attach special meaning (lifecycle hooks, state context) to the JSX itself.

**Reasoning:**
- **DX (Developer Experience):** JSX provides strict typing (TSX), syntax highlighting, and auto-formatting (Prettier). It is objectively superior to template strings for authoring hierarchical structures.
- **Zero Magic:** `<div />` is just syntax sugar for `h('div')`. No hidden observers, no proxies, no signals. Just functions returning strings.

---

## Summary for Contributors

If you propose a feature, ask:
1. Does it require a client-side runtime? (If yes -> Reject, belongs in userland/hydration layer).
2. Does it break apart from standard HTML? (If yes -> Reject).
3. Does it restrict where the code runs? (If yes -> Reject).
