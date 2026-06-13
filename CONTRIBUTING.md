# Contributing to Lume-SSR

Thanks for your interest! This project has a deliberately small surface and a
strong philosophy — please read this page before opening a PR; it will save
us both time.

## The one-question filter

> Does this change keep the core a **small, secure, universal JSX→HTML
> primitive** — or does it grow the core toward being a framework?

Lume-SSR grows through its extension points (`docs/extending.md`), not its
core. Routers, markdown pipelines, island helpers, integrations: build them
as plain packages on top — we'll happily link them from the README.

## What we welcome

- Bug fixes **with a regression test**
- Security hardening (see `SECURITY.md` — red lines apply)
- Performance improvements that keep `node bench/index.js` honest
- Better error messages, types, and docs
- New element plugins as *examples/recipes* in docs
- Recipes for servers/runtimes we haven't documented

## What will be declined

- **Anything that weakens the security model** — no options that disable
  escaping, no ambient raw-HTML modes, no validation bypasses. This is
  non-negotiable; see `SECURITY.md` for the full list.
- Runtime dependencies in `src/`
- Routers, data-fetching layers, caching layers, CSS-in-JS in core
- Node/DOM-specific APIs in `src/core/` (web standards only)
- VDOM, class components, lifecycle hooks, proprietary template syntax
- Breaking changes to existing exports (new capabilities arrive as new
  plugins or new helpers — that's the stability promise)

## Workflow

```bash
npm install          # dev deps (tsx, esbuild...) — core itself has none
npm test             # node:test, must pass on Node 18+
npm run build:examples
cd bench && npm i && npm run bench   # if you touched the hot path
```

Before submitting:

1. Tests pass (`npm test`) and new behavior is covered by new tests.
2. If you changed a public signature, update `types/*.d.ts` and check with
   `npx tsc --noEmit --strict types/*.d.ts`.
3. Security-relevant change? Include the attack as a test.
4. Keep commits focused; explain *why* in the message body.

## Code style

ES modules, functional components only, `const` by default, JSDoc on public
functions. Comments should state constraints the code can't express — not
narrate the code. Match the file you're editing.

## Conduct

Be kind, be honest, assume good faith. Criticism of code is welcome;
criticism of people is not.
