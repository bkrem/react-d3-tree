import { describe, expect, it } from 'vitest';

import type { Orientation, PathFunctionOption, RawNodeDatum } from '../../index.js';
import { linkElements, renderTree } from './helpers.js';

// A root with one child: the root sits at the origin and the child one `nodeSize` (140) away
// along the depth axis, so every path starts at 0,0 and ends 140 units out.
const data: RawNodeDatum = { name: 'root', children: [{ name: 'leaf' }] };

const pathOf = (pathFunc: PathFunctionOption, orientation: Orientation) =>
  linkElements(renderTree({ data, pathFunc, orientation }).container)[0].getAttribute('d');

describe('link paths', () => {
  it.each([
    ['diagonal', 'vertical', 'M0,0C0,70,0,70,0,140'],
    ['diagonal', 'horizontal', 'M0,0C70,0,70,0,140,0'],
    ['elbow', 'vertical', 'M0,0V140H0'],
    ['elbow', 'horizontal', 'M0,0V0H140'],
    ['straight', 'vertical', 'M0,0L0,140'],
    ['straight', 'horizontal', 'M0,0L140,0'],
    ['step', 'vertical', 'M0,0 V70 H0 V140'],
    ['step', 'horizontal', 'M0,0 H70 V0 H140'],
  ] as const)('draws the %s path in a %s tree as "%s"', (pathFunc, orientation, d) => {
    expect(pathOf(pathFunc, orientation)).toBe(d);
  });

  it('defaults to the diagonal path', () => {
    const view = renderTree({ data, orientation: 'vertical' });

    expect(linkElements(view.container)[0].getAttribute('d')).toBe('M0,0C0,70,0,70,0,140');
  });

  // Fractional coordinates: two leaves spaced a third apart and a depth of 46.666…, so every
  // number in the path carries the full float precision. Pins the number formatting.
  describe('with fractional coordinates', () => {
    const fractional: RawNodeDatum = {
      name: 'root',
      children: [{ name: 'left' }, { name: 'right' }],
    };
    const layout = {
      data: fractional,
      nodeSize: { x: 33.333333333333336, y: 33.333333333333336 },
      depthFactor: 46.666666666666664,
    };
    const firstPath = (pathFunc: PathFunctionOption, orientation: Orientation) =>
      linkElements(renderTree({ ...layout, pathFunc, orientation }).container)[0].getAttribute('d');

    it.each([
      [
        'diagonal',
        'vertical',
        'M0,0C0,23.333333333333332,-16.666666666666668,23.333333333333332,-16.666666666666668,46.666666666666664',
      ],
      [
        'diagonal',
        'horizontal',
        'M0,0C23.333333333333332,0,23.333333333333332,-16.666666666666668,46.666666666666664,-16.666666666666668',
      ],
      ['elbow', 'vertical', 'M0,0V46.666666666666664H-16.666666666666668'],
      ['elbow', 'horizontal', 'M0,0V-16.666666666666668H46.666666666666664'],
      ['straight', 'vertical', 'M0,0L-16.666666666666668,46.666666666666664'],
      ['straight', 'horizontal', 'M0,0L46.666666666666664,-16.666666666666668'],
      ['step', 'vertical', 'M0,0 V23.333333333333332 H-16.666666666666668 V46.666666666666664'],
      ['step', 'horizontal', 'M0,0 H23.333333333333332 V-16.666666666666668 H46.666666666666664'],
    ] as const)('draws the %s path in a %s tree as "%s"', (pathFunc, orientation, d) => {
      expect(firstPath(pathFunc, orientation)).toBe(d);
    });
  });
});
