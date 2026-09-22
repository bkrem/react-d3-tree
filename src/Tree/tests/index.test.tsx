import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CustomNodeElementProps, RawNodeDatum, TreeNodeEventCallback } from '../../index.js';
import type { OnTransformChange } from './helpers.js';
import { mockData, mockData2, mockData4, mockTree_D1N2_D2N2 } from './mockData.js';
import {
  circleOf,
  click,
  dispatch,
  getNodeByLabel,
  getSvg,
  getTreeGroup,
  linkElements,
  mockContainerSize,
  nodeElements,
  nodeLabels,
  queryOrThrow,
  renderTree,
  transformCoordinates,
  wheel,
  zoomTransform,
} from './helpers.js';

describe('<Tree />', () => {
  it('renders a node for every datum and a link for every parent-child relation', () => {
    const small = renderTree({ data: mockData });
    expect(nodeElements(small.container)).toHaveLength(5);
    expect(linkElements(small.container)).toHaveLength(4);

    const larger = renderTree({ data: mockData4 });
    expect(nodeElements(larger.container)).toHaveLength(6);
    expect(linkElements(larger.container)).toHaveLength(5);
  });

  it('treats a node with an empty `children` array as a leaf', () => {
    const view = renderTree({
      data: { name: 'root', children: [{ name: 'child', children: [] }] },
      leafNodeClassName: 'leaf-x',
      branchNodeClassName: 'branch-x',
    });
    const child = getNodeByLabel(view.container, 'child');

    expect(child.classList.contains('rd3t-leaf-node')).toBe(true);
    expect(child.classList.contains('leaf-x')).toBe(true);
    expect(child.classList.contains('branch-x')).toBe(false);
  });

  describe('initialDepth', () => {
    it('expands the tree to full depth by default', () => {
      const view = renderTree({ data: mockTree_D1N2_D2N2 });
      expect(nodeElements(view.container)).toHaveLength(5);
    });

    it('expands the tree to `initialDepth`', () => {
      const view = renderTree({ data: mockTree_D1N2_D2N2, initialDepth: 1 });
      expect(nodeElements(view.container)).toHaveLength(3);
    });

    it('renders only the root when `initialDepth` is 0', () => {
      const view = renderTree({ data: mockTree_D1N2_D2N2, initialDepth: 0 });
      expect(nodeElements(view.container)).toHaveLength(1);
    });

    it('expands one level per toggle after starting at `initialDepth`', () => {
      const view = renderTree({ data: mockTree_D1N2_D2N2, initialDepth: 0 });

      click(circleOf(view.container, 'Top Level'));

      expect(nodeElements(view.container)).toHaveLength(3);
    });
  });

  describe('zoom and translate props', () => {
    it('applies `zoom` and `translate` to the tree group', () => {
      const view = renderTree({ data: mockData, zoom: 0.3, translate: { x: 123, y: 321 } });

      expect(getTreeGroup(view.container).getAttribute('transform')).toBe(
        'translate(123,321) scale(0.3)'
      );
    });

    it('defaults to scale 1 at the origin', () => {
      const view = renderTree({ data: mockData });

      expect(getTreeGroup(view.container).getAttribute('transform')).toBe(
        'translate(0,0) scale(1)'
      );
    });

    it('clamps the initial `zoom` to `scaleExtent`', () => {
      const scaleExtent = { min: 0.2, max: 0.8 };

      const above = renderTree({ data: mockData, scaleExtent, zoom: 0.9 });
      expect(getTreeGroup(above.container).getAttribute('transform')).toBe(
        'translate(0,0) scale(0.8)'
      );

      const below = renderTree({ data: mockData, scaleExtent, zoom: 0.1 });
      expect(getTreeGroup(below.container).getAttribute('transform')).toBe(
        'translate(0,0) scale(0.2)'
      );
    });

    it('takes the default for a missing `scaleExtent` key', () => {
      const view = renderTree({ data: mockData, scaleExtent: { max: 0.8 }, zoom: 0.05 });

      expect(getTreeGroup(view.container).getAttribute('transform')).toBe(
        'translate(0,0) scale(0.1)'
      );
    });

    it('clamps zooming out at `scaleExtent.min`', () => {
      const view = renderTree({ data: mockData2, scaleExtent: { min: 0.5, max: 1 } });

      wheel(getSvg(view.container), { deltaY: 10000 });

      expect(getTreeGroup(view.container).getAttribute('transform')).toContain('scale(0.5)');
    });

    it('applies a changed `scaleExtent` to later zooming', () => {
      const view = renderTree({ data: mockData2, scaleExtent: { min: 0.1, max: 1 } });

      view.rerender({ data: mockData2, scaleExtent: { min: 0.1, max: 3 } });
      wheel(getSvg(view.container), { deltaY: -10000 });

      expect(getTreeGroup(view.container).getAttribute('transform')).toContain('scale(3)');
    });
  });

  describe('event handler props', () => {
    it('calls the default node hover handlers with the hierarchy node and the event', () => {
      const onNodeMouseOver = vi.fn<TreeNodeEventCallback>();
      const onNodeMouseOut = vi.fn<TreeNodeEventCallback>();
      const view = renderTree({ data: mockData, onNodeMouseOver, onNodeMouseOut });
      const circle = circleOf(view.container, 'Top Level');

      dispatch(circle, new MouseEvent('mouseover', { bubbles: true }));
      dispatch(circle, new MouseEvent('mouseout', { bubbles: true }));

      for (const callback of [onNodeMouseOver, onNodeMouseOut]) {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].data.name).toBe('Top Level');
        expect(callback.mock.calls[0][1].type).toMatch(/^mouse/);
      }
    });

    it('ignores handler props that are not functions', () => {
      const notAFunction = true as unknown as () => void;
      const view = renderTree({
        data: mockData2,
        onNodeClick: notAFunction,
        onNodeMouseOver: notAFunction,
        onNodeMouseOut: notAFunction,
        onLinkClick: notAFunction,
        onLinkMouseOver: notAFunction,
        onLinkMouseOut: notAFunction,
        onTransformChange: notAFunction,
        onCollapsedChange: notAFunction,
      });
      const circle = circleOf(view.container, 'Level 2: A');
      const link = linkElements(view.container)[0];

      dispatch(circle, new MouseEvent('mouseover', { bubbles: true }));
      dispatch(circle, new MouseEvent('mouseout', { bubbles: true }));
      click(circle);
      dispatch(link, new MouseEvent('mouseover', { bubbles: true }));
      dispatch(link, new MouseEvent('mouseout', { bubbles: true }));
      click(link);
      wheel(getSvg(view.container));

      expect(nodeLabels(view.container)).toEqual(['Top Level', 'Level 2: A']);
    });
  });

  describe('onTransformChange', () => {
    it('reports the transform on wheel', () => {
      const onTransformChange = vi.fn<OnTransformChange>();
      const view = renderTree({
        data: mockData,
        onTransformChange,
        scaleExtent: { min: 0.1, max: 10 },
      });

      wheel(getSvg(view.container));

      expect(onTransformChange).toHaveBeenCalledTimes(1);
      expect(onTransformChange).toHaveBeenCalledWith({
        x: expect.any(Number),
        y: expect.any(Number),
        k: expect.any(Number),
      });
    });
  });

  describe('children added through a data update', () => {
    const renderCustomNodeElement = (props: CustomNodeElementProps) => (
      <circle r={10} data-name={props.nodeDatum.name} data-depth={props.hierarchyPointNode.depth} />
    );
    const withAddedChildren = (): RawNodeDatum => {
      const data: RawNodeDatum = JSON.parse(JSON.stringify(mockData));
      data.children!.push(
        { name: 'added A' },
        { name: 'added B', children: [{ name: 'added B1' }] }
      );
      return data;
    };

    it('renders the new nodes at their depth below an expanded parent', () => {
      const view = renderTree({ data: mockData, renderCustomNodeElement });
      const depthOf = (name: string) =>
        queryOrThrow(view.container, `[data-name="${name}"]`).getAttribute('data-depth');
      expect(nodeElements(view.container)).toHaveLength(5);

      view.rerender({ data: withAddedChildren(), renderCustomNodeElement });

      expect(nodeElements(view.container)).toHaveLength(8);
      expect(linkElements(view.container)).toHaveLength(7);
      expect(depthOf('added A')).toBe('1');
      expect(depthOf('added B')).toBe('1');
      expect(depthOf('added B1')).toBe('2');
    });

    it('keeps them hidden below a collapsed parent until it expands', () => {
      const view = renderTree({ data: mockData });
      click(circleOf(view.container, 'Top Level'));
      expect(nodeLabels(view.container)).toEqual(['Top Level']);

      view.rerender({ data: withAddedChildren() });
      expect(nodeLabels(view.container)).toEqual(['Top Level']);

      // Expanding the root shows one level: the new nodes and the old ones, which stay collapsed.
      click(circleOf(view.container, 'Top Level'));
      expect(nodeLabels(view.container)).toEqual([
        'Top Level',
        '2: A',
        '2: B',
        'added A',
        'added B',
        'added B1',
      ]);
    });
  });

  describe('centerOnClick', () => {
    const size = { width: 400, height: 300 };

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each(['horizontal', 'vertical'] as const)(
      'centers the clicked node in a %s tree',
      orientation => {
        mockContainerSize(size.width, size.height);
        const zoom = 0.5;
        const view = renderTree({
          data: mockData,
          centerOnClick: true,
          orientation,
          zoom,
          centeringTransitionDuration: 0,
        });

        click(circleOf(view.container, '2: A'));

        // The node's rendered transform is its layout position in screen axes.
        const { x, y } = transformCoordinates(getNodeByLabel(view.container, '2: A'));
        expect(zoomTransform(getSvg(view.container))).toMatchObject({
          x: -x * zoom + size.width / 2,
          y: -y * zoom + size.height / 2,
          k: zoom,
        });
      }
    );

    it('centers on click even when the tree is not collapsible', () => {
      mockContainerSize(size.width, size.height);
      const view = renderTree({
        data: mockData,
        centerOnClick: true,
        collapsible: false,
        zoom: 1,
        centeringTransitionDuration: 0,
      });
      const { x, y } = transformCoordinates(getNodeByLabel(view.container, '2: B'));

      click(circleOf(view.container, '2: B'));

      expect(zoomTransform(getSvg(view.container))).toMatchObject({
        x: -x + size.width / 2,
        y: -y + size.height / 2,
        k: 1,
      });
    });

    it('does nothing without `centerOnClick`', () => {
      mockContainerSize(size.width, size.height);
      const view = renderTree({ data: mockData, zoom: 0.5, centeringTransitionDuration: 0 });
      const before = { ...zoomTransform(getSvg(view.container)) };

      click(circleOf(view.container, '2: A'));

      expect(zoomTransform(getSvg(view.container))).toMatchObject(before);
    });
  });

  describe('shouldCollapseNeighborNodes', () => {
    it('leaves expanded neighbours alone by default', () => {
      const view = renderTree({ data: mockData4, initialDepth: 1 });

      click(circleOf(view.container, 'Level 2: A'));
      click(circleOf(view.container, 'Level 2: B'));

      expect(nodeElements(view.container)).toHaveLength(6);
    });
  });
});
