import { describe, expect, it } from 'vitest';
import {
  clampZoom,
  defaults,
  effectiveScaleExtent,
  isModified,
  modifiedKeys,
  reducer,
} from './playground.js';

describe('effectiveScaleExtent and clampZoom', () => {
  it('keeps a valid extent as it is', () => {
    expect(effectiveScaleExtent({ min: 0.1, max: 1 })).toEqual({ min: 0.1, max: 1 });
    expect(clampZoom(0.5, { min: 0.1, max: 1 })).toBe(0.5);
  });

  it('lifts a zero min and a max below the min, so the tree never gets a blank or flipping extent', () => {
    expect(effectiveScaleExtent({ min: 0, max: 0 })).toEqual({ min: 0.01, max: 0.01 });
    expect(effectiveScaleExtent({ min: 2, max: 1 })).toEqual({ min: 2, max: 2 });
    expect(clampZoom(1, { min: 2, max: 1 })).toBe(2);
    expect(clampZoom(0, { min: 0.1, max: 1 })).toBe(0.1);
    expect(clampZoom(5, { min: 0.1, max: 1 })).toBe(1);
  });
});

describe('reducer', () => {
  it('applies a patch', () => {
    const next = reducer(defaults, { type: 'patch', patch: { orientation: 'vertical' } });
    expect(next.orientation).toBe('vertical');
    expect(modifiedKeys(next)).toEqual(['orientation']);
  });

  it('turns hasInteractiveNodes on with the inputs renderer and off again when leaving it', () => {
    const next = reducer(defaults, { type: 'patch', patch: { nodeRenderer: 'inputs' } });
    expect(next.hasInteractiveNodes).toBe(true);
    // Choosing it again, or turning the flag off afterwards, is left alone.
    const off = reducer(next, { type: 'patch', patch: { hasInteractiveNodes: false } });
    expect(off.hasInteractiveNodes).toBe(false);
    expect(reducer(off, { type: 'patch', patch: { nodeRenderer: 'inputs' } })).toEqual(off);
    // Leaving the renderer restores the default.
    const back = reducer(next, { type: 'patch', patch: { nodeRenderer: 'default' } });
    expect(back.hasInteractiveNodes).toBe(false);
  });

  it('lets a patch that sets hasInteractiveNodes itself win over the renderer rule', () => {
    const next = reducer(defaults, {
      type: 'patch',
      patch: { nodeRenderer: 'inputs', hasInteractiveNodes: false },
    });
    expect(next.hasInteractiveNodes).toBe(false);
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
