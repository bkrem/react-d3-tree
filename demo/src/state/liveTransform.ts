import type { Point } from './playground.js';

/** The zoom and translate applied to the tree, as reported by `Tree`'s `onTransformChange`. */
export interface LiveTransform {
  zoom: number;
  translate: Point;
}

export interface LiveStore {
  get(): LiveTransform | null;
  set(next: LiveTransform): void;
  subscribe(listener: () => void): () => void;
}

type Schedule = (flush: () => void) => void;

const nextFrame: Schedule = flush => {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(flush);
  else setTimeout(flush, 0);
};

const same = (a: LiveTransform | null, b: LiveTransform) =>
  a !== null &&
  a.zoom === b.zoom &&
  a.translate.x === b.translate.x &&
  a.translate.y === b.translate.y;

/**
 * Holds the live transform outside React state. `Tree` reports on every drag and zoom tick, and
 * putting that in app state would re-render the tree, which recomputes the whole layout, on each
 * tick. The store coalesces ticks to one notification per frame and skips unchanged values, so only
 * the subscribed status bar renders.
 */
export function createLiveStore(schedule: Schedule = nextFrame): LiveStore {
  let value: LiveTransform | null = null;
  let pending: LiveTransform | null = null;
  let scheduled = false;
  const listeners = new Set<() => void>();

  const flush = () => {
    scheduled = false;
    const next = pending;
    pending = null;
    if (next === null || same(value, next)) return;
    value = next;
    listeners.forEach(listener => listener());
  };

  return {
    get: () => value,
    set(next) {
      pending = next;
      if (!scheduled) {
        scheduled = true;
        schedule(flush);
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
