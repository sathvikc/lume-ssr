import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'lume-ssr'`
  },
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es', 'cjs']
    }
  }
});
