---
title: Getting Started with Lume-SSR
date: 2025-01-15
author: John Doe
tags: tutorial, ssr, javascript
---

# Getting Started with Lume-SSR

Welcome to Lume-SSR! This is your first blog post demonstrating how easy it is to create a blog with server-side rendering.

## What is Lume-SSR?

Lume-SSR is a minimal JSX-to-HTML rendering library that follows the Lume.js philosophy. It compiles JSX to pure HTML strings with zero runtime overhead.

## Key Features

- **Minimal & Focused**: Single responsibility - JSX to HTML
- **Zero Runtime**: Pure HTML output, no framework overhead
- **Framework-Agnostic**: Works with any client-side library
- **Static Site Generation**: Build to static files

## Getting Started

```javascript
import { renderToString } from 'lume-ssr';

const App = ({ name }) => <h1>Hello {name}</h1>;
const html = renderToString(<App name="World" />);
```

That's it! You now have pure HTML ready to serve.
