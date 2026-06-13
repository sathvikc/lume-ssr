# Benchmarks

Compares lume-ssr against other JSX-to-HTML string renderers on a realistic
page: header, nav, a 100-row × 5-column table with content that requires
escaping, and a footer (~17KB of HTML output).

```bash
cd bench
npm install
npm run bench
```

## Fairness

Escaping is part of the work being measured. @kitajs/html does **not** escape
content by default (escaping is opt-in via its `safe` attribute), so the
benchmark sets `safe` on every element that renders user data — the same
escaping work the escape-by-default libraries always do. Without this
correction kitajs appears ~40% faster than it is for equivalent output.
Output byte counts are printed so you can verify every library produced
escaped HTML.

## Results

Node v22, Linux x64 (June 2026), median of 3 runs:

| Renderer                | ops/sec | ms/op | relative |
| ----------------------- | ------- | ----- | -------- |
| @kitajs/html            | ~8,500  | 0.118 | 1.55x    |
| **lume-ssr**            | ~5,400  | 0.185 | 1.0x     |
| preact-render-to-string | ~4,800  | 0.21  | 0.9x     |
| hono/jsx                | ~3,500  | 0.28  | 0.65x    |
| react-dom/server        | ~970    | 1.03  | 0.18x    |

Notes:

- The remaining gap to @kitajs/html is the cost of the security model:
  escape-by-default requires the `SafeString` wrapper to distinguish rendered
  HTML from user text. Removing all safety entirely measures ~2x faster — and
  is exactly the change `SECURITY.md` forbids. The wrapper stays.
- Numbers vary by machine and run; run the benchmark yourself. The workload
  is the same element tree built with each library's own `createElement` API.
