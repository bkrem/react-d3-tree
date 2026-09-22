import { describe, expect, it, vi } from 'vitest';
import { createLiveStore } from './liveTransform.js';

function manualStore() {
  const flushes: (() => void)[] = [];
  const store = createLiveStore(flush => flushes.push(flush));
  const flush = () => {
    const pending = flushes.splice(0);
    pending.forEach(f => f());
  };
  return { store, flush, scheduled: () => flushes.length };
}

describe('createLiveStore', () => {
  it('starts empty and applies a value on the next frame', () => {
    const { store, flush } = manualStore();
    const listener = vi.fn<() => void>();
    store.subscribe(listener);
    store.set({ zoom: 1, translate: { x: 10, y: 20 } });
    expect(store.get()).toBeNull();
    expect(listener).not.toHaveBeenCalled();
    flush();
    expect(store.get()).toEqual({ zoom: 1, translate: { x: 10, y: 20 } });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('coalesces every tick in a frame into one notification with the last value', () => {
    const { store, flush, scheduled } = manualStore();
    const listener = vi.fn<() => void>();
    store.subscribe(listener);
    for (let i = 1; i <= 50; i++) store.set({ zoom: 1, translate: { x: i, y: 0 } });
    expect(scheduled()).toBe(1);
    flush();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.get()?.translate.x).toBe(50);
  });

  it('skips notifications when the value has not changed', () => {
    const { store, flush } = manualStore();
    const listener = vi.fn<() => void>();
    store.subscribe(listener);
    store.set({ zoom: 0.5, translate: { x: 1, y: 1 } });
    flush();
    store.set({ zoom: 0.5, translate: { x: 1, y: 1 } });
    flush();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', () => {
    const { store, flush } = manualStore();
    const listener = vi.fn<() => void>();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set({ zoom: 2, translate: { x: 0, y: 0 } });
    flush();
    expect(listener).not.toHaveBeenCalled();
    expect(store.get()?.zoom).toBe(2);
  });
});
