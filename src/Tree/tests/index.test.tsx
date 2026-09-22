import React from 'react';
import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CustomNodeElementProps, RawNodeDatum, TreeNodeEventCallback } from '../../index.js';
import type { OnUpdate } from './helpers.js';
import { mockData, mockData2, mockData4, mockTree_D1N2_D2N2 } from './mockData.js';
import {
  act,
  click,
  dispatch,
  getNodeByLabel,
  getSvg,
  getTreeGroup,
  linkElements,
  nodeElements,
  nodeLabels,
  renderTree,
  transformCoordinates,
  wheel,
  zoomTransform,
} from './helpers.js';

const circleOf = (container: ParentNode, label: string) =>
  getNodeByLabel(container, label).querySelector('circle');

describe('<Tree />', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a node for every datum and a link for every parent-child relation', () => {
    const small = renderTree({ data: mockData });
    expect(nodeElements(small.container)).toHaveLength(5);
    expect(linkElements(small.container)).toHaveLength(4);

    const larger = renderTree({ data: mockData4 });
    expect(nodeElements(larger.container)).toHaveLength(6);
    expect(linkElements(larger.container)).toHaveLength(5);
  });

  it('marks a node with an empty `children` array as a leaf', () => {
    const view = renderTree({ data: { name: 'root', children: [] } });

    expect(getNodeByLabel(view.container, 'root').classList.contains('rd3t-leaf-node')).toBe(true);
  });

  it('re-renders when the array form of `data` gets a new reference', () => {
    const view = renderTree({ data: mockData2 });
    expect(nodeLabels(view.container)).toEqual(['Top Level', 'Level 2: A']);

    view.rerender({
      data: [{ ...mockData2[0], children: [...mockData2[0].children, { name: 'Level 2: B' }] }],
    });

    expect(nodeLabels(view.container)).toEqual(['Top Level', 'Level 2: A', 'Level 2: B']);
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
        onUpdate: notAFunction,
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

  describe('onUpdate', () => {
    it('reports the zoom transform with no node on wheel', () => {
      const onUpdate = vi.fn<OnUpdate>();
      const view = renderTree({ data: mockData, onUpdate, scaleExtent: { min: 0.1, max: 10 } });
      onUpdate.mockClear();

      wheel(getSvg(view.container));

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith({
        node: null,
        zoom: expect.any(Number),
        translate: { x: expect.any(Number), y: expect.any(Number) },
      });
    });

    it('reports the toggled node with the current zoom and translate', () => {
      const onUpdate = vi.fn<OnUpdate>();
      const view = renderTree({ data: mockData, zoom: 0.7, translate: { x: 10, y: 5 }, onUpdate });
      onUpdate.mockClear();

      click(circleOf(view.container, 'Top Level'));

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith({
        node: expect.objectContaining({ name: 'Top Level' }),
        zoom: 0.7,
        translate: { x: 10, y: 5 },
      });
    });
  });

  describe('addChildren', () => {
    const newChildren: RawNodeDatum[] = [
      { name: 'added A' },
      { name: 'added B', children: [{ name: 'added B1' }] },
    ];

    // Renders every node as a circle that records its name and depth, and captures the
    // `addChildren` handler of the node named `target`.
    const captureAddChildren = (target: string) => {
      let addChildren: CustomNodeElementProps['addChildren'];
      const renderCustomNodeElement = (props: CustomNodeElementProps) => {
        if (props.nodeDatum.name === target) {
          addChildren = props.addChildren;
        }
        return (
          <circle
            r={10}
            data-name={props.nodeDatum.name}
            data-depth={props.hierarchyPointNode.depth}
          />
        );
      };
      return {
        renderCustomNodeElement,
        addChildren: (children: RawNodeDatum[]) => {
          act(() => {
            addChildren(children);
          });
        },
      };
    };

    it('appends the children and their descendants below the target node', () => {
      const capture = captureAddChildren('Top Level');
      const view = renderTree({
        data: mockData,
        renderCustomNodeElement: capture.renderCustomNodeElement,
      });
      const depthOf = (name: string) =>
        view.container.querySelector(`[data-name="${name}"]`).getAttribute('data-depth');
      expect(nodeElements(view.container)).toHaveLength(5);

      capture.addChildren(newChildren);

      expect(nodeElements(view.container)).toHaveLength(8);
      expect(linkElements(view.container)).toHaveLength(7);
      expect(depthOf('added A')).toBe('1');
      expect(depthOf('added B')).toBe('1');
      expect(depthOf('added B1')).toBe('2');
    });

    it('does nothing when the node it was captured from has been removed', () => {
      // The last node of `mockData` has no counterpart in `mockData2`, so its element unmounts.
      const capture = captureAddChildren('3: Daughter of A');
      const view = renderTree({
        data: mockData,
        renderCustomNodeElement: capture.renderCustomNodeElement,
      });

      view.rerender({ data: mockData2, renderCustomNodeElement: capture.renderCustomNodeElement });
      expect(nodeElements(view.container)).toHaveLength(2);

      capture.addChildren(newChildren);

      expect(nodeElements(view.container)).toHaveLength(2);
    });
  });

  describe('centerNode', () => {
    const dimensions = { width: 400, height: 300 };

    it.each(['horizontal', 'vertical'] as const)(
      'centers the clicked node in a %s tree',
      orientation => {
        const zoom = 0.5;
        const view = renderTree({
          data: mockData,
          dimensions,
          orientation,
          zoom,
          centeringTransitionDuration: 0,
        });

        click(circleOf(view.container, '2: A'));

        // The node's rendered transform is its layout position in screen axes.
        const { x, y } = transformCoordinates(getNodeByLabel(view.container, '2: A'));
        expect(zoomTransform(getSvg(view.container))).toMatchObject({
          x: -x * zoom + dimensions.width / 2,
          y: -y * zoom + dimensions.height / 2,
          k: zoom,
        });
      }
    );

    it('does nothing without `dimensions`', () => {
      const view = renderTree({ data: mockData, zoom: 0.5 });
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

  describe('enableLegacyTransitions', () => {
    it('renders the tree group with its transform in both modes', () => {
      const translate = { x: 5, y: 6 };

      const withFlag = renderTree({ data: mockData, enableLegacyTransitions: true, translate });
      expect(getTreeGroup(withFlag.container).getAttribute('transform')).toBe(
        'translate(5,6) scale(1)'
      );

      const withoutFlag = renderTree({ data: mockData, translate });
      expect(getTreeGroup(withoutFlag.container).getAttribute('transform')).toBe(
        'translate(5,6) scale(1)'
      );
    });

    it('keeps zooming after the flag changes, which swaps the tree group element', () => {
      const scaleExtent = { min: 0.5, max: 2 };
      const view = renderTree({ data: mockData, scaleExtent });

      view.rerender({ data: mockData, scaleExtent, enableLegacyTransitions: true });
      const before = getTreeGroup(view.container).getAttribute('transform');
      wheel(getSvg(view.container));

      expect(getTreeGroup(view.container).getAttribute('transform')).not.toBe(before);
    });

    it('ignores toggles until `transitionDuration` has elapsed', () => {
      vi.useFakeTimers();
      const onUpdate = vi.fn<OnUpdate>();
      const view = renderTree({
        data: mockData,
        enableLegacyTransitions: true,
        transitionDuration: 500,
        onUpdate,
      });
      const toggles = () => onUpdate.mock.calls.filter(([update]) => update.node !== null).length;

      click(circleOf(view.container, 'Top Level'));
      click(circleOf(view.container, 'Top Level'));
      expect(toggles()).toBe(1);

      act(() => {
        vi.advanceTimersByTime(510);
      });
      click(circleOf(view.container, 'Top Level'));

      expect(toggles()).toBe(2);
    });

    it('removes collapsed descendants once their exit transition ends', async () => {
      const view = renderTree({
        data: mockData2,
        enableLegacyTransitions: true,
        transitionDuration: 50,
      });

      click(circleOf(view.container, 'Top Level'));

      // The children stay in the DOM while they fade out.
      expect(nodeLabels(view.container)).toEqual(['Top Level', 'Level 2: A']);
      await waitFor(() => {
        expect(nodeLabels(view.container)).toEqual(['Top Level']);
      });
      expect(linkElements(view.container)).toHaveLength(0);
    });
  });
});
