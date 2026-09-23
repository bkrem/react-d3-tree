import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import pkg from '../package.json' with { type: 'json' };

export default defineConfig({
  // The demo is served from https://bkrem.github.io/react-d3-tree/.
  base: '/react-d3-tree/',
  plugins: [react()],
  define: {
    __RD3T_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    // `react-d3-tree` is a workspace link, so its `lib/` would otherwise resolve `react` from the
    // repo root's node_modules (React 16, the library's dev dependency) instead of the demo's.
    dedupe: ['react', 'react-dom'],
  },
  test: {
    // Pure modules only: state, URL and JSX codecs, dataset parsing.
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
