import { describe, expect, it } from 'vitest';
import { builtInDatasets, countNodes, parseDatasetJson, type ParseResult } from './datasets.js';

const parsed = (result: ParseResult) => {
  if (!result.ok) throw new Error(`expected a dataset, got: ${result.error}`);
  return result.dataset;
};

describe('countNodes', () => {
  it('counts the root and every descendant', () => {
    expect(countNodes({ name: 'a' })).toBe(1);
    expect(
      countNodes({ name: 'a', children: [{ name: 'b' }, { name: 'c', children: [{ name: 'd' }] }] })
    ).toBe(4);
  });

  it('matches the built-in datasets', () => {
    expect(builtInDatasets.map(d => [d.id, d.nodeCount])).toEqual([
      ['org-chart', 11],
      ['flare', 252],
      ['react-repo', 863],
    ]);
  });
});

describe('parseDatasetJson', () => {
  it('accepts a root object', () => {
    const dataset = parsed(
      parseDatasetJson('{ "name": "root", "children": [{ "name": "leaf" }] }')
    );
    expect(dataset.id).toBe('custom');
    expect(dataset.nodeCount).toBe(2);
    expect(dataset.data.name).toBe('root');
  });

  it('accepts an array holding one root', () => {
    const dataset = parsed(
      parseDatasetJson('[{ "name": "root", "attributes": { "n": 1, "ok": true } }]')
    );
    expect(dataset.data.attributes).toEqual({ n: 1, ok: true });
  });

  it('rejects invalid JSON with the parser message', () => {
    expect(parseDatasetJson('{ name: root }')).toMatchObject({
      ok: false,
      error: expect.stringMatching(/^Not valid JSON: /),
    });
  });

  it('names the first node that breaks the shape', () => {
    expect(parseDatasetJson('{ "children": [] }')).toEqual({
      ok: false,
      error: 'root.name must be a string',
    });
    expect(
      parseDatasetJson('{ "name": "r", "children": [{ "name": "a" }, { "name": 2 }] }')
    ).toEqual({
      ok: false,
      error: 'root.children[1].name must be a string',
    });
    expect(parseDatasetJson('{ "name": "r", "attributes": { "list": [1] } }')).toEqual({
      ok: false,
      error: 'root.attributes.list must be a string, number, or boolean',
    });
    expect(parseDatasetJson('{ "name": "r", "children": {} }')).toEqual({
      ok: false,
      error: 'root.children must be an array',
    });
  });

  it('rejects arrays that do not hold exactly one root', () => {
    expect(parseDatasetJson('[]')).toEqual({
      ok: false,
      error: 'An array must hold exactly one root node, found 0',
    });
    expect(parseDatasetJson('[{ "name": "a" }, { "name": "b" }]')).toMatchObject({ ok: false });
  });
});
