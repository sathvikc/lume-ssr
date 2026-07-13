# Lume-SSR Architecture (as of branch `claude/lume-ssr-review-xcapiq`)

Current-state documentation. Philosophy and rationale: `docs/design/CORE_PHILOSOPHY.md`, `docs/design/DESIGN_DECISIONS.md`, `docs/design/VISION.md`. Plugin guide: `docs/extending.md`. (`main` is 5 commits behind and lacks tests, streaming, the JSX runtime, types, plugins, and the security hardening described here.)

## Problem it solves

Render standard JSX to HTML on the server or at build time with zero client runtime and zero dependencies — including **out-of-order streaming** for slow async data — without buying a framework's routing/state/build ecosystem.

## System diagram

```
     .jsx source ── classic pragma (h) ──────────────┐
                 └─ automatic runtime (jsx/jsxs) ────┤   "jsxImportSource": "lume-ssr"
                                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │ src/core/jsx.js  h(type, props, ...children)            │
        │   • lazy flatten (only when an array child exists)      │
        │   • element plugins hook (registeredPlugins.length ⇒ 0-cost when unused)
        │   • tag-name validation  • dangerouslySetInnerHTML      │
        │   • renderChildren: sync fast path, switches to         │
        │     Promise.all mid-list when it meets an async child   │
        └────────────┬────────────────────────────────────────────┘
                     ▼ SafeString | Promise<SafeString>
   ┌──────────────────────────────┐   ┌────────────────────────────────────┐
   │ src/core/render.js           │   │ src/core/stream.js                 │
   │  renderToString (fn/element/ │   │  Suspense: registers boundary,     │
   │   array/promise → honest     │   │   streams fallback now             │
   │   string|Promise<string>)    │   │  renderToStream: shell first, then │
   │  renderDocument (lang        │   │   <template>+swap per boundary as  │
   │   escaped; head/body/scripts │   │   each promise resolves            │
   │   are trusted-HTML params)   │   │   (web ReadableStream<Uint8Array>) │
   │  serializeState (hydration   │   │  htmlResponse: new Response(stream)│
   │   JSON, </script>-safe)      │   └────────────────────────────────────┘
   │  renderArray (SYNC ONLY ⚠)   │
   └──────────────────────────────┘
        plugins (src/core/plugins.js): use({name, element(tag,props,children)})
        a11y (src/core/a11y.js): opt-in warnings, implemented as a plugin
```

## Module walkthrough

### `src/core/utils.js`
- **`SafeString`** — the trust boundary; **`raw(str)`** is the explicit opt-in.
- **`escapeHtml`** — regex fast-path (`/[&<>"']/` test) then a single-pass charCode
  switch; SafeStrings pass through; non-strings return unchanged (all render call sites
  now `String()` first).
- **`formatAttributes`** — attribute-**name** validation
  (`/^[a-zA-Z:@][a-zA-Z0-9:._@-]*$/`, bounded 1000-entry cache — kills the
  spread-props injection vector while keeping Alpine/Vue shorthands working); string
  fast-path; `className/htmlFor` mapping; ARIA + enumerated attrs (`draggable`,
  `spellcheck`, `contenteditable`) render literal `"true"/"false"`; other booleans use
  presence shorthand (never for `on*`); style objects via `formatStyle` (values escaped);
  `on*` string values render escaped, functions are dropped.

### `src/core/jsx.js`
- `h()` flattens children **lazily** (only if an array child exists — flattening also
  hoists nested Promises to where `renderChildren` can await them), invokes function
  components with filtered children, runs element plugins for string tags, validates the
  tag name (throws on invalid), handles `dangerouslySetInnerHTML`, void tags, and builds
  `SafeString` (or `Promise<SafeString>` when children are async).
- `renderChildren()` renders synchronously until it meets a Promise, then switches to
  `Promise.all` for the remainder — sync trees never allocate promises.
- `formatChild()` escapes strings and `String(object)`s, passes SafeStrings, renders
  numbers, drops null/undefined/booleans (enables `{cond && <X/>}`).

### `src/jsx-runtime.js` / `src/jsx-dev-runtime.js`
React-17 automatic transform (`jsx`/`jsxs`/`Fragment`) delegating to `h` —
`"jsx": "react-jsx"` + `"jsxImportSource": "lume-ssr"` just works (tested).

### `src/core/render.js`
- `renderToString` — recursive over functions/elements/arrays/promises/SafeStrings;
  return type is the *documented* union `string | Promise<string>`.
- `renderDocument` — HTML5 shell; `lang` escaped; `head/body/scripts` are trusted-HTML
  parameters by design.
- `serializeState(state, {id})` — the lume-js hydration handshake:
  `<script type="application/json">` with `<`, U+2028, U+2029 escaped in the payload and
  the id attribute escaped; pairs with lume-js `hydrateState()`.
- `renderArray` — legacy sync-only helper (⚠ async renderFn produces
  `"[object Promise]"`; `renderToString(items.map(...))` is the async-safe path).

### `src/core/stream.js`
- **`Suspense`** — during a `renderToStream` pass, async children register a boundary and
  a synchronous fallback renders in place (`<div data-lume-boundary=N style="display:contents">`).
  Outside streaming it's a transparent async pass-through. `onError(err)` may return
  replacement markup; otherwise the fallback stays and the error is logged.
- **`renderToStream`** — evaluates the component function while a module-level boundary
  registry is active (JSX evaluation is fully synchronous, so concurrent renders can't
  interleave), flushes the shell + a ~200-byte swap script, then streams each boundary as
  `<template data-lume-chunk=N>` + `$lume(N)` swap call as its promise resolves —
  out-of-order streaming with no client runtime beyond that script.
- **`htmlResponse`** — `new Response(renderToStream(...))` with `text/html` — one line on
  Workers/Deno/Bun/Hono.

### `src/core/plugins.js` + `src/core/a11y.js`
`use({name, element(tag, props, children)})` hooks run per HTML element before
validation/formatting and may replace tag/props/children (CSP nonce injection, URL
rewriting, etc. — see docs/extending.md). Process-global by design. The opt-in a11y
checker (`enableA11yWarnings()`) is itself a plugin: img-alt, iframe-title, html-lang,
href-less anchors, positive tabindex, click-handlers-on-div warnings at render time.

## Testing & CI

`test/` uses **`node:test`** — zero test-framework dependencies; 92 tests across jsx,
attributes (the XSS regression suite), render, stream (incl. out-of-order timing),
plugins, a11y, jsx-runtime. CI (`.github/workflows/ci.yml`) runs the suite on Node
18/20/22 on push/PR.

## Dependency rationale

**Runtime: zero** (the Suspense swap script is inline, not a dependency). Dev-only:
`tsx`, `esbuild`, `express`, `vite`, `@types/node` — used exclusively by examples/scripts.

## Extension points

1. **Element plugins** (`use`) — the sanctioned hook into rendering.
2. **`raw()` / SafeString** — participate in the trust model.
3. **`serializeState`** — hydration handshake for lume-js or any client reader.
4. **`htmlResponse` / `renderToStream`** — drop-in for any web-standard server.
