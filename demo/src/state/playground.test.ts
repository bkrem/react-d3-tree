import { describe, expect, it } from 'vitest';
import { defaults, isModified, modifiedKeys, reducer } from './playground.js';

describe('reducer', () => {
  it('applies a patch', () => {
    const next = reducer(defaults, { type: 'patch', patch: { orientation: 'vertical' } });
    expect(next.orientation).toBe('vertical');
    expect(modifiedKeys(next)).toEqual(['orientation']);
  });

  it('turns on hasInteractiveNodes when the inputs renderer is chosen', () => {
    const next = reducer(defaults, { type: 'patch', patch: { nodeRenderer: 'inputs' } });
    expect(next.hasInteractiveNodes).toBe(true);
    // Choosing it again, or turning the flag off afterwards, is left alone.
    const off = reducer(next, { type: 'patch', patch: { hasInteractiveNodes: false } });
    expect(off.hasInteractiveNodes).toBe(false);
    expect(reducer(off, { type: 'patch', patch: { nodeRenderer: 'inputs' } })).toEqual(off);
  });

  it('resets one group and leaves the others', () => {
    const changed = reducer(defaults, {
      type: 'patch',
      patch: { orientation: 'vertical', zoom: 0.5, collapsible: false },
    });
    const next = reducer(changed, { type: 'reset-group', group: 'layout' });
    expect(next.orientation).toBe('horizontal');
    expect(next.zoom).toBe(0.5);
    expect(next.collapsible).toBe(false);
    expect(reducer(next, { type: 'reset-all' })).toBe(defaults);
  });

  it('stores a settled drag or zoom as an explicit translate and zoom', () => {
    const next = reducer(defaults, {
      type: 'set-transform',
      translate: { x: 120, y: 80 },
      zoom: 0.75,
    });
    expect(next.translate).toEqual({ x: 120, y: 80 });
    expect(next.zoom).toBe(0.75);
    expect(isModified(next, 'translate')).toBe(true);
    expect(isModified(next, 'zoom')).toBe(true);
  });

  it('returns the same state when the transform has not changed', () => {
    const moved = reducer(defaults, {
      type: 'set-transform',
      translate: { x: 120, y: 80 },
      zoom: 0.75,
    });
    expect(
      reducer(moved, { type: 'set-transform', translate: { x: 120, y: 80 }, zoom: 0.75 })
    ).toBe(moved);
  });
});
