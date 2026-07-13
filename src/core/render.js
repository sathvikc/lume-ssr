import { SafeString, escapeHtml } from './utils.js';

/**
 * Render a component to HTML string
 *
 * @param {function|string|SafeString|Promise|Array} component - Component or JSX element
 * @param {object} props - Props to pass (if component is function)
 * @returns {string|Promise<string>} HTML string (Promise if the tree contains async components)
 */
export function renderToString(component, props = {}) {
  // If component is a function, call it with props
  if (typeof component === 'function') {
    const result = component(props);
    // Handle async components
    if (result instanceof Promise) {
      return result.then(r => renderToString(r));
    }
    return renderToString(result);
  }

  // If component is a Promise (result of async JSX Component), await it
  if (component instanceof Promise) {
    return component.then(c => renderToString(c));
  }

  // Arrays of rendered elements (e.g. items.map(...)) join in order
  if (Array.isArray(component)) {
    const rendered = component.map(c => renderToString(c));
    if (rendered.some(r => r instanceof Promise)) {
      return Promise.all(rendered).then(r => r.join(''));
    }
    return rendered.join('');
  }

  // If component is SafeString, return string
  if (component instanceof SafeString) {
    return component.toString();
  }

  // If component is already a string (rendered JSX), return it
  if (typeof component === 'string') {
    return component;
  }

  // Handle other types
  return String(component);
}

/**
 * Render an array of components (useful for lists)
 * @param {Array} items - Array of items to render
 * @param {function} renderFn - Function to render each item
 * @returns {string} Joined HTML string
 */
export function renderArray(items, renderFn) {
  if (!Array.isArray(items)) {
    return '';
  }
  return items.map(item => {
    const result = renderFn(item);
    return result instanceof SafeString ? result.toString() : String(result);
  }).join('');
}

/**
 * Serialize state into a JSON script tag for client-side hydration.
 * Safe against </script> breakout: `<` is escaped inside the JSON payload.
 * Pairs with lume-js `hydrateState()`, but works with any client code that
 * reads `JSON.parse(document.getElementById(id).textContent)`.
 *
 * @param {any} state - JSON-serializable state
 * @param {object} [options]
 * @param {string} [options.id='__lume_state__'] - id of the script tag
 * @returns {SafeString} `<script type="application/json" id="...">...</script>`
 */
export function serializeState(state, { id = '__lume_state__' } = {}) {
  const json = JSON.stringify(state === undefined ? null : state)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return new SafeString(`<script type="application/json" id="${escapeHtml(id)}">${json}</script>`);
}

/**
 * Create a full HTML document
 * @param {object} options
 * @param {string|SafeString} options.head - Content for <head>
 * @param {string|SafeString} options.body - Content for <body>
 * @param {string} options.scripts - Scripts to include
 * @param {string} options.lang - Language attribute (default: 'en')
 * @returns {string} Full HTML document
 */
export function renderDocument({ head = '', body = '', scripts = '', lang = 'en' } = {}) {
  const headStr = head instanceof SafeString ? head.toString() : head;
  const bodyStr = body instanceof SafeString ? body.toString() : body;
  const scriptsStr = scripts instanceof SafeString ? scripts.toString() : scripts;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(String(lang))}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${headStr}
  </head>
  <body>
    ${bodyStr}
    ${scriptsStr}
  </body>
</html>`;
}
