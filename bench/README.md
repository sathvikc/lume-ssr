# Benchmarks

Compares lume-ssr against other JSX-to-HTML string renderers on a realistic
page: header, nav, a 100-row × 5-column table with content that requires
escaping, and a footer (~17KB of HTML output).

```bash
cd bench
npm install
npm run bench
```

## Results

Node v22, Linux x64 (June 2026):

| Renderer                | ops/sec | ms/op | relative |
| ----------------------- | ------- | ----- | -------- |
| @kitajs/html            | 7,681   | 0.130 | 2.2x     |
| **lume-ssr**            | 3,532   | 0.283 | 1.0x     |
| preact-render-to-string | 3,547   | 0.282 | 1.0x     |
| hono/jsx                | 2,118   | 0.472 | 0.6x     |
| react-dom/server        | 605     | 1.654 | 0.17x    |

Notes:

- @kitajs/html is faster because it returns raw strings with no wrapper
  objects; lume-ssr keeps the `SafeString` wrapper as its escaping/security
  model. That trade-off is deliberate.
- Numbers vary by machine; run the benchmark yourself. The workload is the
  same element tree built with each library's own `createElement` API.
