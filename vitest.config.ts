import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      // Library source only: tests and fixtures don't count toward the thresholds.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/tests/**'],
      reporter: ['text', 'lcov'],
      thresholds: { statements: 90, branches: 84, functions: 90, lines: 88 },
    },
  },
});
