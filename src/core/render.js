import { SafeString } from './utils.js';

/**
 * Render a component to HTML string
 * 
 * @param {function|string|SafeString} component - Component or JSX element
 * @param {object} props - Props to pass (if component is function)
 * @returns {string} HTML string
 */
export function renderToString(component, props = {}) {
  // If component is a function, call it with props
  if (typeof component === 'function') {
    const result = component(props);
    // Handle async components
    if (result instanceof Promise) {
      return result.then(r => r instanceof SafeString ? r.toString() : String(r));
    }
    return result instanceof SafeString ? result.toString() : String(result);
  }

  // If component is a Promise (result of async JSX Component), await it
  if (component instanceof Promise) {
    return component.then(c => renderToString(c));
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
 * Create a full HTML document
 * @param {object} options
 * @param {string|SafeString} options.head - Content for <head>
 * @param {string|SafeString} options.body - Content for <body>
 * @param {string} options.scripts - Scripts to include
 * @param {string} options.lang - Language attribute (default: 'en')
 * @returns {string} Full HTML document
 */
export function renderDocument({ head = '', body = '', scripts = '', lang = 'en' }) {
  const headStr = head instanceof SafeString ? head.toString() : head;
  const bodyStr = body instanceof SafeString ? body.toString() : body;

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${headStr}
  </head>
  <body>
    ${bodyStr}
    ${scripts}
  </body>
</html>`;
}
