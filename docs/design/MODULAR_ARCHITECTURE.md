# Modular Architecture Strategy

To align with the developer's vision of Lume-JS 2.0 and avoid "Kitchen Sink" bloat, `lume-ssr` will adopt a strict **Core vs. Addons** split.

## 1. The Core (Strict)
This is the "Universal" part. It generates strings.
- **Location:** `src/core/`
- **Dependency:** 0 Dependencies.
- **Scope:** 
  - `h()` (JSX compiler)
  - `renderToString()` (String generator)
  - `SafeString` (XSS protection)

## 2. The Addons (Optional)
These are "Quality of Life" features. You import them ONLY if you need them. They are not bundled by default.

### Potential Addons
- **`src/addons/router/`**: A tiny regex-based request matcher.
  - *Why:* Because `lume-ssr` often sits behind `http.createServer`, developers need a way to say "If `/about`, render `<About />`".
- **`src/addons/context/`**: A Prop-Drilling solver.
  - *Why:* Deeply nested server trees might need `User` object everywhere.
- **`src/addons/stream/`**: (Future) Streaming HTML support.

## 3. Directory Structure
```
src/
├── core/
│   ├── jsx.js        (The compiler)
│   ├── render.js     (The API)
│   └── utils.js      (SafeString)
├── addons/
│   ├── router.js     (Optional Router)
│   └── context.js    (Optional Context)
└── index.js          (Exports CORE only)
```

## 4. Usage Pattern
```javascript
// The user imports core stuff
import { renderToString } from 'lume-ssr';

// The user imports addons explicitly
import { matchRoute } from 'lume-ssr/addons/router';
```
This ensures that a user building a simple component doesn't pay the mental (or byte) cost of a Router they don't use.
