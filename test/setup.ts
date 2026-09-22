import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Testing Library registers its own cleanup only when `afterEach` is a global. The tests import
// from `vitest` instead, so register it here.
afterEach(cleanup);

// jsdom has no ResizeObserver. The tree only needs one to exist; tests that need a container
// size mock `getBoundingClientRect`, which the tree reads on mount.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// jsdom doesn't implement the SVG animated properties that d3 reads: d3-interpolate reads
// `transform` when it tweens a `transform` attribute, and d3-zoom reads `width` and `height`
// to compute the zoom extent. Without them, zoom and transitions throw.
Object.defineProperty(SVGElement.prototype, 'transform', {
  configurable: true,
  get() {
    return { baseVal: { consolidate: () => null } };
  },
});
for (const name of ['width', 'height']) {
  Object.defineProperty(SVGElement.prototype, name, {
    configurable: true,
    get() {
      return { baseVal: { value: parseFloat(this.getAttribute(name)) || 0 } };
    },
  });
}
