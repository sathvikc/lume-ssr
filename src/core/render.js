import { SafeString } from './utils.js';

export function renderToString(component, props = {}) {
  if (typeof component === 'function') {
    const result = component(props);
    return result instanceof SafeString ? result.toString() : String(result);
  }
  if (component instanceof SafeString) return component.toString();
  return String(component);
}
