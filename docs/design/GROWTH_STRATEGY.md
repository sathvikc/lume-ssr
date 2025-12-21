# Growth & Virality Strategy

To make this project "viral" and popular, we must position it against the current fatigue with heavy meta-frameworks, while being **brutally honest** about its scope.

---

## 1. The Core Narrative: "The Un-Framework"

**The Hook:** "Stop shipping React to the client just to render a list."

**The Positioning:**
It is **NOT** a Client-Side Framework (like React/Vue).
It is a **Universal HTML Compiler** (like a super-powered `String.template`).

**The Promise:**
> "Reliable Server Rendering. Optional Client Templating."

---

## 2. Dealing with the "CSR Trap" (The Focus Problem)

We must avoid selling this as a full React replacement for interactive apps, because users will try to rebuild `useState` and get frustrated when inputs lose focus.

**Correct Usage Messaging:**
- **DO:** Use it to render lists, cards, modals, and static content dynamically.
- **DO NOT:** Use it to manage the state of a Form Control (Text Input, Checkbox) while the user is interacting with it.

**The "Utilities" Angle:**
Position it as a better `document.createElement`.
Instead of:
```javascript
const div = document.createElement('div');
div.className = 'card';
div.innerHTML = `<h1>${title}</h1>`; // Dangerous XSS?
```
Use:
```javascript
const html = Card({ title });
container.innerHTML = html; // Safe, Typed, Clean.
```

---

## 3. Key Differentiators

| Feature | Competitors (React/Preact) | Competitors (EJS/Handlebars) | This Project |
|Str|Str|Str|Str|
| **Authoring** | JSX (Great) | String Templates (Poor) | JSX (Great) |
| **Runtime** | Heavy (VDOM) | Light (Strings) | **Zero (Strings)** |
| **Use Case** | Full Application State | Server Templates | **Isomorphic Templating** |

---

## 4. Viral Tactics

### A. The "Universal Component" Demo
Build a demo that shows the *exact same component file* running in Node.js and the Browser.
*Showcase:* A "Product Card". Something that doesn't hold input focus.

### B. The "HTMX Companion" Angle
HTMX is massive right now. HTMX users need a backend templating language.
- **This Project is the "Missing Link" for HTMX.** (Use JSX components to return HTML partials).

### C. The "No-Build" Challenge
Show a video of using this library in a browser with NO build step (using an ESM import of the compiler).

---

## 5. Ecosystem Suggestions

To encourage adoption, we should provide "Starters" for popular niche stacks:
- **Express + [Project] + HTMX**
- **Hono + [Project] + Cloudflare**
- **Vanilla JS + [Project] (Client Only)**

## 6. Potential Slogans
- "JSX for the rest of us."
- "The HTML Compiler."
- "Just Functions. Just Strings."
- "Server First. Client Ready."
