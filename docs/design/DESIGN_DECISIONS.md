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

## 5. Security Model: SafeString + Name Validation
**Date:** June 13, 2026
**Verdict:** Escaping is the entire security model; it is layered and non-bypassable.

- **Decision:** Escape all string children/attribute values by default; validate attribute *names* and tag names against breakout characters; `raw()` and `dangerouslySetInnerHTML` are the only explicit trust markers; `serializeState()` is the only blessed way to pass state to the client.
- **Reasoning:** A string renderer's only security promise is its escaping. Bypasses must be local and greppable, never ambient. See `SECURITY.md` for the red lines.
- **Trade-off accepted:** The `SafeString` wrapper costs ~2x vs @kitajs/html's raw-string approach (see `bench/`). We keep it: the wrapper is what makes "escaped by default, trusted by exception" enforceable.

## 6. Automatic JSX Runtime
**Date:** June 13, 2026
**Verdict:** Ship `lume-ssr/jsx-runtime` alongside the classic `h` pragma.

- **Decision:** Support `jsxImportSource: "lume-ssr"` so no per-file pragma comments are needed.
- **Reasoning:** Every modern toolchain (TS, Vite, esbuild) defaults to the automatic transform. Requiring pragmas contradicts the "nice DX" goal.

## 7. Streaming via Suspense, Not a New Core
**Date:** June 13, 2026
**Verdict:** Out-of-order streaming with an explicit `<Suspense>` boundary; web-standard `ReadableStream<Uint8Array>` output.

- **Decision:** `renderToStream(fn)` evaluates JSX synchronously, flushes the shell with fallbacks, then streams each boundary's content as it resolves (template + tiny inline swap script). `Suspense` is transparent inside `renderToString`.
- **Reasoning:** The eager string model means a root promise resolves only when everything resolves; boundaries are the only way to flush early without a VDOM. Web streams work in Node 18+, Deno, Bun, and Workers — one API, every runtime.
- **Constraint:** Boundaries register during synchronous evaluation (single-threaded, no interleaving). Suspense after an `await` inside an async component degrades gracefully to pass-through.

## 8. Element Plugins as THE Extension Point
**Date:** June 13, 2026
**Verdict:** `use()/unuse()` element plugins mirror lume-js's handler architecture.

- **Decision:** Plugins may inspect/replace tag, props, and children of every HTML element. They run before validation, so they cannot bypass the security model. Process-global, registration order, ~zero cost when none registered.
- **Reasoning:** Element interception is the one thing users can't do from outside; everything above it (routers, layouts) is plain function composition. Growing via plugins + new helpers is the anti-breaking-change strategy.
- **Proof:** The built-in a11y warnings are implemented as a plugin.

## 9. A11y Warnings in the Renderer
**Date:** June 13, 2026
**Verdict:** Opt-in render-time accessibility checks ship in core.

- **Decision:** `enableA11yWarnings()` warns on missing `img alt`/`iframe title`/`html lang`/`a href`, positive tabindex, and click handlers on non-interactive elements.
- **Reasoning:** No competing string renderer has this; it converts the a11y pitch from aspiration to feature. Opt-in keeps the zero-magic promise.

## 10. Enumerated & ARIA Attributes Render Explicit Values
**Date:** June 13, 2026
**Verdict:** `aria-*`, `draggable`, `spellcheck`, `contenteditable` booleans render `"true"`/`"false"`; other booleans use the bare-attribute shorthand.

- **Reasoning:** Bare `aria-hidden` or `draggable` is invalid HTML and broken ARIA. Correct-by-construction output is the whole point of the library.

## 11. Alpine/Vue Shorthand Attributes Pass Through
**Date:** June 13, 2026
**Verdict:** `@click`, `:class`, `x-on:*.modifier` are valid attribute names here.

- **Reasoning:** `@`, `:` and `.` cannot terminate an attribute or tag, so allowing them is safe — and "pair with Alpine" is a documented integration. We still never *invent* such syntax ourselves (Core Philosophy #1).

## 12. Naming Collision Acknowledged
**Date:** June 13, 2026
**Verdict:** "Lume" collides with lume.land (Deno SSG) and lume.io (3D library); a rename (candidates: fyr, tindra, or "Lume Stack" umbrella) is under consideration before lume-docs ships.

- **Reasoning:** Renaming cost grows with every release; the decision point is before the third library lands.
