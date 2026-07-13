# AGENTS.md — Guide for AI Coding Agents

This file is the entry point for any AI agent (Claude, Copilot, Cursor, ...) working on this repository. Deeper context lives in `docs/ai/` and `docs/design/`.

## What this project is

Lume-SSR is a minimal, standards-based JSX-to-HTML rendering primitive. It is **not a framework**: no router, no data layer, no client runtime. It pairs with [lume-js](https://github.com/sathvikc/lume-js) (reactive state via `data-*` attributes) but both work standalone.

Read before making design changes:
- `docs/design/CORE_PHILOSOPHY.md` — the constitutional law of the codebase
- `docs/design/VISION.md` — positioning, audience, roadmap
- `docs/design/DESIGN_DECISIONS.md` — decisions already made; don't relitigate
- `docs/extending.md` — the extension architecture (plugins, composition, output)
- `SECURITY.md` — the security model and its non-negotiable invariants

## Commands

```bash
npm test                 # node:test suite (no dependencies needed for core)
npm run build:examples   # build all examples to dist/
node bench/index.js      # benchmark vs react/preact/kitajs/hono (cd bench && npm i first)
```

CI runs `node --test` on Node 18/20/22. All of it must stay green.

## Repository map

```
src/index.js              Public exports
src/jsx-runtime.js        Automatic JSX runtime (jsxImportSource)
src/core/jsx.js           h(), Fragment, renderChildren — the renderer
src/core/render.js        renderToString, renderDocument, serializeState
src/core/stream.js        renderToStream, Suspense, htmlResponse
src/core/plugins.js       use()/unuse() element plugin system
src/core/a11y.js          a11y warnings (implemented as a plugin)
src/core/utils.js         escapeHtml, formatAttributes, SafeString, raw
types/                    Hand-written .d.ts (keep in sync with src!)
test/                     node:test suites — every bug fix needs a regression test
bench/                    Benchmark workspace (own package.json)
docs/                     User docs + design docs + AI context
```

## Hard rules (violations break the project's promises)

1. **Never weaken the security model.** No API, option, flag, or plugin capability that disables escaping or bypasses tag/attribute-name validation. The only raw-HTML escape hatches are `raw()` and `dangerouslySetInnerHTML` — explicit and local. See `SECURITY.md`.
2. **Zero runtime dependencies.** `src/` must import nothing from
   node_modules. Dev/bench dependencies are fine in their own scopes.
3. **`src/core/` stays universal.** No `fs`, `path`, `process`, no DOM APIs. Web standards only (`ReadableStream`, `TextEncoder`, `Response` are OK — they exist in Node 18+, Deno, Bun, and Workers).
4. **No VDOM, no classes, no hooks.** Components are pure functions
   `(props) => SafeString | Promise<SafeString>`.
5. **Every behavior change needs a test.** Security fixes need a regression
   test that reproduces the original hole.
6. **Types ship by hand.** If you change a public signature in `src/`, update `types/*.d.ts` and verify with `tsc --noEmit --strict types/*.d.ts`.
7. **Don't regress the benchmark.** Run `node bench/index.js` after touching the hot path (`jsx.js`, `utils.js`). The plugin fast path must stay one property access per element when no plugins are registered.
8. **New capabilities arrive as plugins or new helpers, not as changes to existing signatures.** That is the stability promise in `docs/extending.md`.

## Things to be careful about (known sharp edges)

- `renderToString` returns `string` for sync trees and `Promise<string>` for
  async ones — deliberate (see DESIGN_DECISIONS #3). Don't "fix" it.
- Suspense boundaries register during the synchronous JSX evaluation started by `renderToStream(fn)`. Suspense inside an async component body (after the first `await`) degrades to pass-through — that's by design.
- `escapeHtml` returns non-strings unchanged; callers stringify first.
- Plugins are process-global. Never make rendering depend on per-request
  plugin registration.
- Attribute names allow `@` and `:` (Alpine/Vue shorthands). Any widening of `VALID_ATTR_NAME` or `VALID_TAG_NAME` must prove the added characters cannot terminate an attribute or tag (no whitespace, quotes, `=`, `>`, `/`).

## Style

- ES modules, `const` by default, 4-space indent in `src/`, JSDoc on exports.
- Comments explain constraints the code can't show — not what the next line does.
- Write docs in the existing voice: direct, honest, no marketing fluff.
  Claims about performance or security must be backed by `bench/` or `test/`.
