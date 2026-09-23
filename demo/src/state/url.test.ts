import { describe, expect, it } from 'vitest';
import { defaults, type PlaygroundState } from './playground.js';
import { fromSearchParams, toSearchParams } from './url.js';

const modified: PlaygroundState = {
  ...defaults,
  dataset: 'flare',
  orientation: 'vertical',
  pathFunc: 'step',
  nodeSize: { x: 200, y: 180 },
  separation: { siblings: 1.5, nonSiblings: 2 },
  depthFactor: -300,
  translate: { x: 120, y: 40 },
  initialDepth: 2,
  collapsible: false,
  centerOnClick: true,
  zoom: 0.5,
  scaleExtent: { min: 0.2, max: 3 },
  transitionDuration: 250,
  nodeRenderer: 'foreign-object',
};

describe('toSearchParams', () => {
  it('is empty for the defaults', () => {
    expect(toSearchParams(defaults).toString()).toBe('');
  });

  it('writes only the props that differ from the defaults', () => {
    const params = toSearchParams({ ...defaults, orientation: 'vertical', zoom: 0.5 });
    expect([...params.entries()]).toEqual([
      ['orientation', 'vertical'],
      ['zoom', '0.5'],
    ]);
  });

  it('encodes booleans, points, and ranges compactly', () => {
    const params = toSearchParams(modified);
    expect(params.get('collapsible')).toBe('0');
    expect(params.get('centerOnClick')).toBe('1');
    expect(params.get('nodeSize')).toBe('200,180');
    expect(params.get('translate')).toBe('120,40');
    expect(params.get('separation')).toBe('1.5,2');
    expect(params.get('scaleExtent')).toBe('0.2,3');
    expect(params.get('depthFactor')).toBe('-300');
  });

  it('leaves a pasted dataset out, because it cannot be linked', () => {
    expect(toSearchParams({ ...defaults, dataset: 'custom' }).has('dataset')).toBe(false);
  });
});

describe('fromSearchParams', () => {
  it('round-trips every prop toSearchParams writes', () => {
    const patch = fromSearchParams(toSearchParams(modified));
    expect({ ...defaults, ...patch }).toEqual(modified);
  });

  it('ignores unknown keys, unknown enum values, and malformed numbers', () => {
    const patch = fromSearchParams(
      new URLSearchParams({
        orientation: 'diagonal',
        pathFunc: 'curvy',
        dataset: 'custom',
        zoom: 'big',
        nodeSize: '100',
        translate: '1,2,3',
        collapsible: 'yes',
        somethingElse: '1',
      })
    );
    expect(patch).toEqual({});
  });

  it('reads an empty query as no changes', () => {
    expect(fromSearchParams(new URLSearchParams())).toEqual({});
  });

  it('accepts true and false as well as 1 and 0 for booleans', () => {
    const patch = fromSearchParams(
      new URLSearchParams({ collapsible: 'false', zoomable: 'true', draggable: '0' })
    );
    expect(patch).toEqual({ collapsible: false, zoomable: true, draggable: false });
  });

  it('rejects values outside the ranges the inspector allows', () => {
    const patch = fromSearchParams(
      new URLSearchParams({
        zoom: '0',
        scaleExtent: '1,0.1',
        nodeSize: '0,0',
        separation: '-1,2',
        initialDepth: '1.5',
        transitionDuration: '-5',
      })
    );
    expect(patch).toEqual({});
    expect(fromSearchParams(new URLSearchParams({ scaleExtent: '0,1' }))).toEqual({});
    expect(fromSearchParams(new URLSearchParams({ initialDepth: '-1' }))).toEqual({});
  });

  it('rejects hex, binary, octal, and separator notations', () => {
    const patch = fromSearchParams(
      new URLSearchParams({
        zoom: '0x1',
        depthFactor: '0b11',
        initialDepth: '0o7',
        nodeSize: '1_0,2',
      })
    );
    expect(patch).toEqual({});
    expect(fromSearchParams(new URLSearchParams({ depthFactor: '-2.5e2' }))).toEqual({
      depthFactor: -250,
    });
  });
});
