# CLAUDE.md — Lume-SSR

> Agent onboarding for the **`claude/lume-ssr-review-xcapiq` branch** — the real state of the project (5 commits ahead of `main`; `main` is a year-old prototype by comparison — don't audit or build on `main`). Behavioral rules: `docs/ai/AGENT_CONTEXT.md` (the 5 Immutable Laws) and `docs/ai/CODING_RULES.md`. Design record: `docs/design/DESIGN_DECISIONS.md` + `docs/design/VISION.md`.

## What this is

Lume-SSR is a zero-dependency JSX-to-HTML rendering primitive — "a brick, not a framework." A classic pragma (`h`/`Fragment`) *and* an automatic JSX runtime (`lume-ssr/jsx-runtime`) build escaped HTML strings bottom-up; async components compose via promise-bubbling; `renderToStream`/`Suspense` provide out-of-order streaming over a web-standard `ReadableStream`; an element plugin system (`use()`) is the extension point (a11y warnings ship as one such plugin). Works in Node ≥18, Deno, Bun, Workers. Not yet published to npm.

## Current state (verified 2026-07-07 on this branch)

- **92/92 tests pass** (`node --test`, 7 files, ~100 ms, zero test-framework deps).
- **CI exists:** `.github/workflows/ci.yml` — Node 18/20/22 matrix running `node --test`.
- **Security hardening landed:** attribute-name validation (bounded cache), tag-name validation, `renderDocument` `lang` escaped, `serializeState` with `</script>`-breakout + U+2028/9 protection, object children escaped via `String()`+escape, `raw()` as the explicit trust API.
- **Types:** handwritten `types/*.d.ts` (index, jsx-runtime, jsx-dev-runtime), wired in
  `exports`.
- **Known remaining gaps:** `renderArray` is still sync-only (async renderFn → `"[object Promise]"`); version claims 1.0.0 with no CHANGELOG and no publish workflow; `author` empty; dev-chain npm advisories (esbuild 0.19, express 4.18). See `docs/audit/PRODUCTION_AUDIT.md`.

## Directory map

```
src/index.js            # exports: h, Fragment, renderToString, renderArray, renderDocument,
                        #   serializeState, escapeHtml, raw, SafeString, formatAttributes,
                        #   formatStyle, renderToStream, Suspense, htmlResponse, use, unuse,
                        #   enableA11yWarnings, disableA11yWarnings
src/jsx-runtime.js      # automatic transform: jsx/jsxs/Fragment ("jsxImportSource": "lume-ssr")
src/jsx-dev-runtime.js  # dev variant (delegates to jsx-runtime)
src/core/jsx.js         # h() pragma: lazy flatten, plugin hook, tag validation, renderChildren
src/core/utils.js       # SafeString, raw(), single-pass escapeHtml, formatAttributes
                        #   (name validation + cache, ARIA/enumerated booleans), formatStyle
src/core/render.js      # renderToString (arrays + async, honest union type), renderArray (sync!),
                        #   renderDocument (lang escaped), serializeState (hydration handshake)
src/core/stream.js      # renderToStream (web ReadableStream), Suspense (out-of-order swap),
                        #   htmlResponse (one-line web-standard Response)
src/core/plugins.js     # use()/unuse(): element(tag, props, children) hooks, process-global
src/core/a11y.js        # opt-in render-time a11y warnings (implemented as a plugin)
types/                  # handwritten .d.ts × 3 — update with any public API change
test/                   # node:test suites: jsx, attributes, render, stream, plugins, a11y, jsx-runtime
docs/ai/, docs/design/  # agent laws · philosophy/decisions/vision (owner's record)
docs/extending.md       # plugin-system guide
docs/audit/             # production audit + roadmap + progress (re-reviewed on this branch)
examples/, scripts/     # runnable demos, example dev-server/static-build (tsx-run)
.github/workflows/ci.yml# Node 18/20/22 matrix, node --test
```

## Commands

```bash
npm test                 # node --test → 92 tests, ~100ms
npm run dev:examples     # express dev server over examples/
npm run build:examples   # static-build examples into dist/
```

## The 5 Immutable Laws (docs/ai/AGENT_CONTEXT.md — never break)

1. NO client runtime — output is pure HTML strings (the Suspense swap script is the one deliberate, ~200-byte exception; keep it that way).
2. NO Node.js specifics in `src/core/` — universal only (web `ReadableStream`, not Node streams).
3. NO virtual DOM. 4. NO proprietary syntax — standard JSX. 5. Pure function components.

## Gotchas & invariants

- **SafeString is the trust boundary**; `raw()` is the only sanctioned way to mark trusted HTML. Plain strings passed to `renderToString`/`renderDocument` bypass escaping — caller-owned trust, keep documented.
- **Async return types:** `renderToString` returns `string | Promise<string>` (honest and
  typed now). `renderArray` does NOT support async render functions — prefer
  `renderToString(items.map(...))`, which does.
- **`renderToStream` needs a component FUNCTION** (`renderToStream(() => <Page/>)`) so Suspense boundaries register with that render; passing an evaluated element skips boundary registration. Suspense fallbacks must be synchronous (throws otherwise).
- **Plugins are process-global** — register at server start, not per request. `h()`'s
  fast path is `registeredPlugins.length === 0`.
- **Attribute names** must match `/^[a-zA-Z:@][a-zA-Z0-9:._@-]*$/` (Alpine/Vue shorthands like `@click`, `x-on:click.prevent` intentionally allowed); invalid names are silently dropped. Tag names must match `/^[a-zA-Z][a-zA-Z0-9-]*$/` or `h()` throws.
- **ARIA + enumerated attrs** (`draggable`, `spellcheck`, `contenteditable`) render literal `"true"/"false"`; other booleans use presence shorthand; boolean `on*` never renders.
- **Void tags silently drop children.** `on*` string props render as inline handlers
  (CSP-hostile — pair with a nonce plugin; see docs/extending.md).
- The Suspense swap `<script>` is inline — under a strict CSP, inject a nonce via an
  element plugin.

## What NOT to touch

- `main` — stale; this branch is the line of development.
- Zero runtime dependencies; `test/` staying framework-free (`node:test`) is deliberate.
- `docs/design/**` — owner's record; amend, don't rewrite.
- Don't bump the version (1.0.0 debate is an owner decision — see audit).
