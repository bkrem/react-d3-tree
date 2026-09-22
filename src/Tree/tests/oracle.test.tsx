import { describe, expect, it } from 'vitest';

import type { TreeProps } from '../../index.js';
import { mockData, mockData4, orgChart } from './mockData.js';
import { renderedMarkup, renderTree } from './helpers.js';

// Every case snapshots the mounted DOM (after effects ran), with the random ids masked. A
// snapshot changes only when the rendered markup changes; the commit that updates one says why.
const cases: [string, TreeProps][] = [
  ['default props', { data: mockData }],
  ['vertical orientation', { data: mockData, orientation: 'vertical' }],
  ['org chart, horizontal', { data: orgChart }],
  ['org chart, vertical', { data: orgChart, orientation: 'vertical' }],
  ['initialDepth 0', { data: mockData4, initialDepth: 0 }],
  ['initialDepth 1', { data: mockData4, initialDepth: 1 }],
  ['depthFactor 300', { data: mockData, depthFactor: 300 }],
  [
    'negative depthFactor, vertical',
    { data: mockData, orientation: 'vertical', depthFactor: -200 },
  ],
  ['separation', { data: mockData4, separation: { siblings: 2, nonSiblings: 3 } }],
  ['nodeSize', { data: mockData, nodeSize: { x: 100, y: 300 } }],
  ['elbow path', { data: mockData, pathFunc: 'elbow' }],
  ['straight path', { data: mockData, pathFunc: 'straight' }],
  ['step path, vertical', { data: mockData, pathFunc: 'step', orientation: 'vertical' }],
  [
    'class name props',
    {
      data: mockData,
      svgClassName: 'svg-x',
      rootNodeClassName: 'root-x',
      branchNodeClassName: 'branch-x',
      leafNodeClassName: 'leaf-x',
    },
  ],
  ['zoom and translate', { data: mockData, zoom: 0.5, translate: { x: 100, y: 50 } }],
];

describe('render oracle', () => {
  it.each(cases)('%s', (_name, props) => {
    expect(renderedMarkup(renderTree(props).container)).toMatchSnapshot();
  });
});
