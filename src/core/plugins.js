/**
 * Element plugin system - the extension point for the renderer.
 *
 * A plugin can inspect or transform every element at render time:
 *
 *   use({
 *     name: 'csp-nonce',
 *     element(tag, props, children) {
 *       if (tag === 'script') return { props: { ...props, nonce: NONCE } };
 *     }
 *   });
 *
 * Contract:
 * - `element(tag, props, children)` runs for HTML tags (not components),
 *   in registration order, before validation and attribute formatting.
 * - Return nothing to leave the element untouched, or an object with any of
 *   `tag`, `props`, `children` to replace those values.
 * - Plugins are process-global: register them at server start, not per
 *   request. Rendering stays pure - plugins see elements, they don't own state.
 */

// Internal: h() reads .length directly as its fast path - with no plugins
// registered the cost is one property access per element.
export const registeredPlugins = [];
const plugins = registeredPlugins;

/**
 * Register a plugin. Returns a function that unregisters it.
 * @param {{ name: string, element?: (tag: string, props: object|null, children: any[]) => void|{tag?: string, props?: object, children?: any[]} }} plugin
 * @returns {() => void}
 */
export function use(plugin) {
    if (!plugin || typeof plugin.name !== 'string' || plugin.name === '') {
        throw new Error('Plugin must be an object with a string `name`');
    }
    if (plugin.element !== undefined && typeof plugin.element !== 'function') {
        throw new Error(`Plugin "${plugin.name}": \`element\` must be a function`);
    }
    plugins.push(plugin);
    return () => unuse(plugin.name);
}

/**
 * Unregister a plugin by name.
 * @param {string} name
 */
export function unuse(name) {
    const i = plugins.findIndex(p => p.name === name);
    if (i !== -1) {
        plugins.splice(i, 1);
    }
}

/**
 * Run all element hooks for one element. Called from h() for string tags.
 * Returns the (possibly replaced) tag/props/children.
 */
export function applyElementPlugins(tag, props, children) {
    for (let i = 0; i < plugins.length; i++) {
        const hook = plugins[i].element;
        if (!hook) continue;
        const result = hook(tag, props, children);
        if (result) {
            if (result.tag !== undefined) tag = result.tag;
            if (result.props !== undefined) props = result.props;
            if (result.children !== undefined) children = result.children;
        }
    }
    return { tag, props, children };
}
