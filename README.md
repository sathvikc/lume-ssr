# Lume-SSR: Infrastructure for the Web

> **"The web is powerful. Frameworks are optional. Pick wisely."**

Lume-SSR is not a framework. It is a rendering primitive that returns control to you. 

Most server-side solutions today (Next.js, Astro, Remix) are "walled gardens": they force you into their routing, their build steps, and their state management.

**Lume-SSR is a brick.** You use it to build your own house.

It does exactly one thing: **It turns standard JSX into HTML strings.**

- **0 bytes** client-side runtime (by default).
- **Standards-based** (just uses standard JSX).
- **Agnostic** (Works with Express, Hono, Fastify, Cloudflare Workers, or static scripts).

## The Philosophy

We believe developers have forgotten how powerful the native web platform is. We often reach for 45KB frameworks to solve problems that standards already solve.

- **Reactivity?** You might not need a VDOM.
- **Routing?** The browser has a History API.
- **Dates?** `Intl.DateTimeFormat` exists.

Lume-SSR allows you to render your HTML on the server without buying into a massive client-side ecosystem. It respects the platform.

## Features

- 🏗 **Universal**: Runs in Node.js, Deno, Bun, Cloudflare Workers.
- ⚡ **Fast**: Zero overhead abstraction. It's just function calls.
- 🎯 **Focused**: No built-in router. No data fetching layer. No magic.
- 🧩 **Modular**: Compiles JSX to clean HTML strings. Pair it with **[Lume-JS](https://github.com/sathvikc/lume-js)** for interactivity, or **htmx**, or **Alpine**, or **Vanilla JS**.

## Installation

```bash
npm install lume-ssr
```

## Usage

Lume-SSR is just a function.

```javascript
import { renderToString } from 'lume-ssr';

const App = ({ name }) => (
  <header>
    <h1>Hello {name}</h1>
    <p>Rendered on the server.</p>
  </header>
);

const html = renderToString(<App name="Developer" />);
// Output: "<header><h1>Hello Developer</h1><p>Rendered on the server.</p></header>"
```

### With Express

```javascript
import express from 'express';
import { renderToString } from 'lume-ssr';
import { App } from './App.jsx';

const app = express();

app.get('/', (req, res) => {
  const html = renderToString(<App url={req.url} />);
  res.send(`<!DOCTYPE html>${html}`);
});
```

### With Static Site Generation (SSG)

You don't need a heavy SSG framework. You just need a script.

```javascript
import fs from 'fs';
import { renderToString } from 'lume-ssr';
import { Page } from './Page.jsx';

const html = renderToString(<Page />);
fs.writeFileSync('dist/index.html', html);
```

## Contributing

We welcome contributions that align with the philosophy: **Keep it simple. Use the platform.**

## License

MIT

