# Vision

> **The standards-first web stack. Lume-SSR turns JSX into plain HTML on the server. Lume-JS makes that HTML reactive in the browser with ~2KB and data-attributes. No VDOM, no hydration mismatch, no proprietary syntax — view source and understand your page.**

## Why this exists

Modern meta-frameworks solve real problems, but they charge for it: a build system you don't control, a client runtime you may not need, and hydration machinery whose failure modes (mismatch errors, double renders) exist only because the architecture requires the client to re-derive what the server already rendered.

Lume takes the other path. The server emits standard HTML. The client — if it needs reactivity at all — binds to that HTML through `data-*` attributes. There is no client render of the component tree, so there is nothing to mismatch. We call this **hydration by attributes, not by reconciliation**, and it is the load-bearing technical idea of the whole stack.

## The family

Independent bricks, shared philosophy, best together:

| Library | Job | Status |
| --- | --- | --- |
| **lume-js** | Reactive state + DOM binding via `data-*` (plugins + handlers) | Stable (v2.x, 355 tests) |
| **lume-ssr** | JSX → HTML strings/streams (element plugins + composition) | This repo |
| **lume-docs** | Documentation sites built on the two above | Planned |

Each library works standalone with anything (htmx, Alpine, vanilla JS, any server, any backend language consuming the HTML). The shared naming signals they compose well — it never means lock-in.

## Who this is for

- Mostly-server-rendered sites with islands of reactivity: content sites, dashboards, forms, e-commerce.
- The htmx/Alpine audience who want typed, composable **JSX authoring** on the server instead of template strings.
- Backend-minded developers who want HTML out of their Express/Hono/Workers app without adopting a frontend toolchain.
- Teams shipping sites that must still build and run in ten years. Frameworks die; HTML is forever.

## What we refuse to become

- A meta-framework. No router, data layer, or image pipeline in core — those are plain packages built on the extension points.
- A VDOM. We render strings; the browser is the renderer.
- A walled garden. Output is standard HTML; leave anytime.

## Honest limitations (we publish these ourselves)

- **Complex stateful UI is the ceiling.** Rich editors, drag-and-drop boards, heavily animated trees — React/Svelte will serve you better, and we say so.
- **Two layers, one contract.** Server components are JSX; client behavior is data-attributes; the state shape connects them. Renaming a state key touches both sides.
- **No component-level client interactivity.** Interactivity is bindings over the page (the Knockout model), not shippable interactive components.
- **Small ecosystem.** Mitigated by the fact that "it's just HTML/JS" means every vanilla library already works.

## Measures of success

1. A developer can go from `npm install` to streamed, hydrated page in under ten minutes with only the README.
2. The benchmark page stays within 2x of the fastest JSX string renderer and ahead of preact/hono/react (`bench/`).
3. Security model unbroken: zero escaping bypasses shipped, ever.
4. lume-docs is built entirely on lume-ssr + lume-js — we are our own first production user.
5. At least one community package (router, markdown, islands) built on the plugin/composition surface without needing a core change.
