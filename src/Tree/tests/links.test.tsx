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
});
