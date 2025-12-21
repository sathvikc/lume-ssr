# Design Decisions

This document tracks the critical architectural decisions made for Lume-SSR and the reasoning behind them.

## 1. Positioning as Infrastructure
**Date:** December 13, 2025
**Verdict:** Lume-SSR is a "Rendering Primitive", not a "Framework".

- **Decision:** We do not compete with Astro or Next.js. We provide the raw engine (`renderToString`) that others can build frameworks on top of (or use raw).
- **Reasoning:** Competing on features (routing, image optimization) is a losing battle. Competing on *simplicity* and *standards* is a defensible niche.
- **Reference:** `docs/design/REFRAMED_VERDICT.md`

## 2. Native Async Support
**Date:** December 13, 2025
**Verdict:** `renderToString` supports Async Components natively.

- **Decision:** The renderer must handle `Promise` returns from components.
- **Reasoning:** `async/await` is a standard JavaScript feature. Preventing its use forces developers to use external data-fetching patterns (like `getServerSideProps`), which violates our "Just JavaScript" philosophy.

## 3. Polymorphic Return Type
**Date:** December 13, 2025
**Verdict:** `renderToString` returns `string | Promise<string>`.

- **Decision:**
    - If the component tree is fully synchronous, `renderToString` returns a `string` immediately.
    - If *any* component in the tree returns a `Promise`, `renderToString` returns a `Promise<string>`.
- **Reasoning:**
    - **Performance:** synchronous rendering remains blocking/fast for simple templates.
    - **Simplicity:** One function API (`renderToString`) is simpler than bifurcating into `renderToString` vs `renderAsync`.
    - **Compatibility:** This aligns with how standard JS functions operate (if you don't await, it's sync; if you await, it's async... though technically the return type differs, the *usage pattern* is intuitive).

## 4. Zero-Config Output (Standard HTML)
**Date:** Continuous
**Verdict:** No proprietary output formats.

- **Decision:** The output is always a standard HTML string. No "virtual nodes" JSON, no intermediate streams (unless requested via future `renderStream`).
- **Reasoning:** HTML is the universal interface of the web.
