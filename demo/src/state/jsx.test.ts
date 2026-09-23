import { describe, expect, it } from 'vitest';
import { toJsx, type JsxContext } from './jsx.js';
import { defaults } from './playground.js';

const ctx: JsxContext = {
  dataIdentifier: 'orgChart',
  rendererIdentifier: null,
  translate: { x: 224, y: 345 },
  dimensions: null,
};

describe('toJsx', () => {
  it('lists data and the effective translate for the defaults', () => {
    expect(toJsx(defaults, ctx)).toBe(
      ['<Tree', '  data={orgChart}', '  translate={{ x: 224, y: 345 }}', '/>'].join('\n')
    );
  });

  it('adds only modified props, in the order the TreeProps docs use', () => {
    const jsx = toJsx(
      {
        ...defaults,
        orientation: 'vertical',
        pathFunc: 'elbow',
        collapsible: false,
        nodeSize: { x: 200, y: 200 },
        separation: { siblings: 2, nonSiblings: 2 },
        initialDepth: 1,
        hasInteractiveNodes: true,
      },
      { ...ctx, rendererIdentifier: 'renderInteractiveNode' }
    );
    expect(jsx.split('\n')).toEqual([
      '<Tree',
      '  data={orgChart}',
      '  renderCustomNodeElement={renderInteractiveNode}',
      '  orientation="vertical"',
      '  translate={{ x: 224, y: 345 }}',
      '  pathFunc="elbow"',
      '  collapsible={false}',
      '  initialDepth={1}',
      '  nodeSize={{ x: 200, y: 200 }}',
      '  separation={{ siblings: 2, nonSiblings: 2 }}',
      '  hasInteractiveNodes={true}',
      '/>',
    ]);
  });

  it('spells out dimensions only when centring on click is on', () => {
    const dimensions = { width: 1120, height: 690 };
    expect(toJsx(defaults, { ...ctx, dimensions })).not.toContain('dimensions');
    expect(toJsx({ ...defaults, centerOnClick: true }, { ...ctx, dimensions })).toContain(
      'dimensions={{ width: 1120, height: 690 }}'
    );
  });

  it('lists the zoom settings the canvas applies, not the typed values', () => {
    expect(toJsx({ ...defaults, zoom: 0 }, ctx)).toContain('zoom={0.1}');
    // 5 clamps to the default max of 1, so the snippet omits it.
    expect(toJsx({ ...defaults, zoom: 5 }, ctx)).not.toContain('zoom=');
    const extent = toJsx({ ...defaults, scaleExtent: { min: 2, max: 1 } }, ctx);
    expect(extent).toContain('scaleExtent={{ min: 2, max: 2 }}');
    expect(extent).toContain('zoom={2}');
  });

  it('writes depthFactor and the zoom settings when set', () => {
    const jsx = toJsx(
      { ...defaults, depthFactor: -250, zoom: 0.5, scaleExtent: { min: 0.1, max: 4 } },
      ctx
    );
    expect(jsx).toContain('depthFactor={-250}');
    expect(jsx).toContain('zoom={0.5}');
    expect(jsx).toContain('scaleExtent={{ min: 0.1, max: 4 }}');
  });
});
