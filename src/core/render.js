import { SafeString } from './utils.js';

export function renderToString(component, props = {}) {
  if (typeof component === 'function') {
    const result = component(props);
    if (result instanceof Promise) {
      return result.then(r => r instanceof SafeString ? r.toString() : String(r));
    }
    return result instanceof SafeString ? result.toString() : String(result);
  }
  if (component instanceof Promise) {
    return component.then(c => renderToString(c));
  }
  if (component instanceof SafeString) return component.toString();
  return String(component);
}
