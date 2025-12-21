# Coding Rules & Technical Constraints

These rules are strict. Violations will break the "Universal" promise of the library.

---

## 1. Syntax & Style

- **ES Modules Only:** Use `import` / `export`. No `require()`.
- **Prefer Const:** Use `const` for everything unless re-assignment is strictly needed.
- **No Class Components:** All components must be functional.
- **Extensions:**
  - `.js` for source files (to keep it standard).
  - `.jsx` / `.tsx` is allowed for consuming applications, but the **core library** must be usable as plain JS if possible (via build step).

## 2. Dependencies

- **Zero Runtime Deps:** The `core/` folder must have **0 dependencies** in `package.json`.
- **Dev Dependencies:** Only build tools (Vite, esbuild) and Types (TypeScript) are allowed.

## 3. Performance & Memory

- **String Concatenation over Arrays:** For huge lists, `array.join('')` is faster than `str +=`.
- **SafeString Immutability:** Once a `SafeString` is created, it should not be mutated.
- **Escape Early:** Escape potentially dangerous strings *before* wrapping them in `SafeString`.

## 4. Security (XSS Prevention)

- **Default to Safe:** Everything inside `{...}` in JSX acts like `innerText` (auto-escaped).
- **Explicit Danger:** If a user wants to pass raw HTML, they must explicitly assume risk (implementation TBD, currently `SafeString` wraps trusted content).

## 5. Testing

- **Unit Tests:** Must test both the String Output and the Logic.
- **Example:**
  ```javascript
  // Good Test
  test('renders user card', () => {
    const html = renderToString(<Card name="Alice" />).toString();
    expect(html).toBe('<div class="card">Alice</div>');
  });
  ```
