import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Tree from '../../index.js';
import type {
  CustomNodeElementProps,
  PathClassFunction,
  PathFunction,
  RawNodeDatum,
  TreeLinkEventCallback,
  TreeNodeEventCallback,
} from '../../index.js';
import type { OnCollapsedChange, OnTransformChange } from './helpers.js';
import {
  circleOf,
  click,
  dispatch,
  getNodeByLabel,
  getSvg,
  getTreeGroup,
  linkElements,
  mouse,
  nodeElements,
  nodeLabels,
  queryOrThrow,
  renderTree,
  transformCoordinates,
  wheel,
} from './helpers.js';

const treeData = (): RawNodeDatum => ({
  name: 'root',
  attributes: { active: true, count: 0 },
  children: [
    {
      name: 'branch-a',
      children: [{ name: 'leaf-a1' }, { name: 'leaf-a2' }],
    },
    {
      name: 'branch-b',
      children: [{ name: 'leaf-b1' }],
    },
  ],
});

const replacementData = (): RawNodeDatum => ({
  name: 'replacement-root',
  children: [{ name: 'replacement-leaf' }],
});

describe('Tree public behavior', () => {
  describe('data lifecycle', () => {
    it('replaces visible nodes and links when data changes', () => {
      const view = renderTree({ data: treeData() });

      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
        'leaf-b1',
      ]);

      view.rerender({ data: replacementData() });

      expect(nodeLabels(view.container)).toEqual(['replacement-root', 'replacement-leaf']);
      expect(linkElements(view.container)).toHaveLength(1);
    });

    it('keeps collapse state across a data update for the ids that survive it', () => {
      const view = renderTree({ data: treeData(), initialDepth: 1 });
      click(circleOf(view.container, 'branch-a'));
      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
      ]);

      const updated = treeData();
      updated.children![1].children!.push({ name: 'leaf-b2' });
      view.rerender({ data: updated, initialDepth: 1 });

      // branch-a stays expanded, branch-b stays collapsed with its new leaf hidden.
      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
      ]);
    });

    it('applies initialDepth to nodes that a data update introduces', () => {
      const view = renderTree({ data: treeData(), initialDepth: 1 });

      const updated = treeData();
      updated.children!.push({ name: 'branch-c', children: [{ name: 'leaf-c1' }] });
      view.rerender({ data: updated, initialDepth: 1 });

      expect(nodeLabels(view.container)).toEqual(['root', 'branch-a', 'branch-b', 'branch-c']);
    });

    it('resets collapse state when the tree remounts with a new key', () => {
      const view = render(<Tree key="a" data={treeData()} initialDepth={0} />);
      click(circleOf(view.container, 'root'));
      expect(nodeElements(view.container).length).toBeGreaterThan(1);

      view.rerender(<Tree key="b" data={replacementData()} initialDepth={0} />);

      expect(nodeLabels(view.container)).toEqual(['replacement-root']);
      expect(linkElements(view.container)).toHaveLength(0);
    });

    it('does not add internal fields to caller-owned data', () => {
      const data = treeData();
      const before = JSON.parse(JSON.stringify(data));

      const view = renderTree({ data });
      click(circleOf(view.container, 'root'));

      expect(data).toEqual(before);
    });
  });

  describe('collapse and expansion', () => {
    it('removes descendants and restores one collapsed level per toggle', () => {
      const view = renderTree({ data: treeData() });

      expect(nodeElements(view.container)).toHaveLength(6);
      expect(linkElements(view.container)).toHaveLength(5);

      click(circleOf(view.container, 'root'));
      expect(nodeLabels(view.container)).toEqual(['root']);
      expect(linkElements(view.container)).toHaveLength(0);

      click(circleOf(view.container, 'root'));
      expect(nodeLabels(view.container)).toEqual(['root', 'branch-a', 'branch-b']);
      expect(linkElements(view.container)).toHaveLength(2);

      click(circleOf(view.container, 'branch-a'));
      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
      ]);
    });

    it('fires onNodeClick without changing visibility when collapsible is false', () => {
      const onNodeClick = vi.fn<TreeNodeEventCallback>();
      const view = renderTree({ data: treeData(), collapsible: false, onNodeClick });

      click(circleOf(view.container, 'root'));

      expect(nodeElements(view.container)).toHaveLength(6);
      expect(linkElements(view.container)).toHaveLength(5);
      expect(onNodeClick).toHaveBeenCalledTimes(1);
      expect(onNodeClick.mock.calls[0][0].data.name).toBe('root');
    });

    it('collapses an expanded neighbor when another node at the same depth expands', () => {
      const view = renderTree({
        data: treeData(),
        initialDepth: 1,
        shouldCollapseNeighborNodes: true,
      });

      click(circleOf(view.container, 'branch-a'));
      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
      ]);

      click(circleOf(view.container, 'branch-b'));
      expect(nodeLabels(view.container)).toEqual(['root', 'branch-a', 'branch-b', 'leaf-b1']);
    });
  });

  describe('collapse state', () => {
    it('reports every toggle through onCollapsedChange in uncontrolled mode', () => {
      const onCollapsedChange = vi.fn<OnCollapsedChange>();
      const view = renderTree({ data: treeData(), onCollapsedChange });

      click(circleOf(view.container, 'branch-a'));
      click(circleOf(view.container, 'branch-a'));

      expect(onCollapsedChange).toHaveBeenCalledTimes(2);
      expect([...onCollapsedChange.mock.calls[0][0]]).toEqual(['0.0']);
      expect(onCollapsedChange.mock.calls[0][1]).toEqual({ id: '0.0', collapsed: true });
      expect([...onCollapsedChange.mock.calls[1][0]]).toEqual([]);
      expect(onCollapsedChange.mock.calls[1][1]).toEqual({ id: '0.0', collapsed: false });
    });

    it('never collapses a leaf, so a leaf click reports nothing', () => {
      const onCollapsedChange = vi.fn<OnCollapsedChange>();
      const view = renderTree({ data: treeData(), onCollapsedChange });

      click(circleOf(view.container, 'leaf-a1'));

      expect(onCollapsedChange).not.toHaveBeenCalled();
      expect(nodeElements(view.container)).toHaveLength(6);
    });

    it('renders exactly the controlled set and leaves changing it to the caller', () => {
      const onCollapsedChange = vi.fn<OnCollapsedChange>();
      const data = treeData();
      const view = renderTree({ data, collapsed: ['0.1'], onCollapsedChange });
      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
      ]);

      click(circleOf(view.container, 'branch-a'));

      // The request is reported, the tree is unchanged.
      expect(onCollapsedChange).toHaveBeenCalledTimes(1);
      expect([...onCollapsedChange.mock.calls[0][0]]).toEqual(['0.1', '0.0']);
      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
      ]);

      view.rerender({ data, collapsed: onCollapsedChange.mock.calls[0][0], onCollapsedChange });
      expect(nodeLabels(view.container)).toEqual(['root', 'branch-a', 'branch-b']);

      view.rerender({ data, collapsed: [], onCollapsedChange });
      expect(nodeElements(view.container)).toHaveLength(6);
    });

    it('ignores initialDepth while the caller owns the collapse state', () => {
      const view = renderTree({ data: treeData(), initialDepth: 0, collapsed: [] });

      expect(nodeElements(view.container)).toHaveLength(6);
    });
  });

  describe('layout and styling', () => {
    it('renders public class props on the corresponding SVG elements', () => {
      const view = renderTree({
        data: treeData(),
        svgClassName: 'custom-svg',
        rootNodeClassName: 'custom-root',
        branchNodeClassName: 'custom-branch',
        leafNodeClassName: 'custom-leaf',
      });

      expect(getSvg(view.container).classList.contains('custom-svg')).toBe(true);
      expect(getNodeByLabel(view.container, 'root').classList.contains('custom-root')).toBe(true);
      expect(getNodeByLabel(view.container, 'branch-a').classList.contains('custom-branch')).toBe(
        true
      );
      expect(getNodeByLabel(view.container, 'leaf-a1').classList.contains('custom-leaf')).toBe(
        true
      );
    });

    it('updates rendered node and link geometry when orientation changes', () => {
      const data = treeData();
      const view = renderTree({ data, orientation: 'horizontal' });
      const horizontalNodeTransform = getNodeByLabel(view.container, 'branch-a').getAttribute(
        'transform'
      );
      const horizontalPath = linkElements(view.container)[0].getAttribute('d');

      view.rerender({ data, orientation: 'vertical' });

      expect(getNodeByLabel(view.container, 'branch-a').getAttribute('transform')).not.toBe(
        horizontalNodeTransform
      );
      expect(linkElements(view.container)[0].getAttribute('d')).not.toBe(horizontalPath);
    });

    it('uses nodeSize for the visible parent-child distance', () => {
      const data = treeData();
      const view = renderTree({ data, orientation: 'vertical', nodeSize: { x: 100, y: 80 } });
      const first = transformCoordinates(getNodeByLabel(view.container, 'branch-a'));

      view.rerender({ data, orientation: 'vertical', nodeSize: { x: 100, y: 240 } });
      const second = transformCoordinates(getNodeByLabel(view.container, 'branch-a'));

      expect(first.y).toBe(80);
      expect(second.y).toBe(240);
    });

    it('uses sibling separation for visible sibling positions', () => {
      const data = treeData();
      const view = renderTree({
        data,
        orientation: 'vertical',
        nodeSize: { x: 100, y: 100 },
        separation: { siblings: 1, nonSiblings: 1 },
      });
      const compactA = transformCoordinates(getNodeByLabel(view.container, 'branch-a'));
      const compactB = transformCoordinates(getNodeByLabel(view.container, 'branch-b'));

      view.rerender({
        data,
        orientation: 'vertical',
        nodeSize: { x: 100, y: 100 },
        separation: { siblings: 3, nonSiblings: 1 },
      });
      const wideA = transformCoordinates(getNodeByLabel(view.container, 'branch-a'));
      const wideB = transformCoordinates(getNodeByLabel(view.container, 'branch-b'));

      expect(Math.abs(wideB.x - wideA.x)).toBeGreaterThan(Math.abs(compactB.x - compactA.x));
    });

    it.each([
      [120, 120],
      [-120, -120],
      [0, 0],
    ])('renders depthFactor %s as the child depth coordinate', (depthFactor, expectedY) => {
      const view = renderTree({ data: replacementData(), orientation: 'vertical', depthFactor });

      expect(transformCoordinates(getNodeByLabel(view.container, 'replacement-leaf')).y).toBe(
        expectedY
      );
    });

    it('renders default labels and attribute values', () => {
      const view = renderTree({ data: treeData() });
      const root = getNodeByLabel(view.container, 'root');

      expect(queryOrThrow(root, '.rd3t-label__title').textContent).toBe('root');
      expect(
        Array.from(root.querySelectorAll('.rd3t-label__attributes tspan')).map(
          node => node.textContent
        )
      ).toEqual(['active: true', 'count: 0']);
    });

    it('keeps node IDs unique and makes every link reference rendered nodes', () => {
      const view = renderTree({ data: treeData() });
      const nodeIds = nodeElements(view.container).map(node => node.getAttribute('data-id'));

      expect(new Set(nodeIds).size).toBe(nodeIds.length);
      linkElements(view.container).forEach(link => {
        expect(nodeIds).toContain(link.getAttribute('data-source-id'));
        expect(nodeIds).toContain(link.getAttribute('data-target-id'));
      });
    });

    it('uses the path of a node as its id and a supplied id as is', () => {
      const view = renderTree({
        data: {
          name: 'root',
          children: [
            { name: 'first' },
            { id: 'custom', name: 'second', children: [{ name: 'x' }] },
          ],
        },
      });

      expect(nodeElements(view.container).map(node => node.getAttribute('data-id'))).toEqual([
        '0',
        '0.0',
        'custom',
        'custom.0',
      ]);
    });

    it('warns once in development when two nodes share an id', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const data: RawNodeDatum = {
        name: 'root',
        children: [
          { id: 'dup', name: 'a' },
          { id: 'dup', name: 'b' },
        ],
      };

      renderTree({ data });
      renderTree({ data });

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('"dup"');
      warn.mockRestore();
    });

    it.each(['diagonal', 'elbow', 'straight', 'step'] as const)(
      'renders the %s path function through the public Tree prop',
      pathFunc => {
        const view = renderTree({ data: replacementData(), pathFunc });

        expect(linkElements(view.container)[0].getAttribute('d')).toMatch(/^M/);
      }
    );

    it('uses custom path and path class functions with public link data', () => {
      const pathFunc = vi.fn<PathFunction>(() => 'M1,2L3,4');
      const pathClassFunc = vi.fn<PathClassFunction>(() => 'custom-link');
      const view = renderTree({
        data: replacementData(),
        orientation: 'vertical',
        pathFunc,
        pathClassFunc,
      });
      const link = linkElements(view.container)[0];

      expect(link.getAttribute('d')).toBe('M1,2L3,4');
      expect(link.classList.contains('custom-link')).toBe(true);
      expect(pathFunc.mock.calls[0][0].source.data.name).toBe('replacement-root');
      expect(pathFunc.mock.calls[0][0].target.data.name).toBe('replacement-leaf');
      expect(pathFunc.mock.calls[0][1]).toBe('vertical');
      expect(pathClassFunc.mock.calls[0][0].source.data.name).toBe('replacement-root');
      expect(pathClassFunc.mock.calls[0][1]).toBe('vertical');
    });
  });

  describe('custom nodes and callbacks', () => {
    it('describes each node to its custom renderer', () => {
      const renderCustomNodeElement = (props: CustomNodeElementProps) => (
        <circle
          r={10}
          data-custom-node={props.nodeDatum.name}
          data-id={props.id}
          data-depth={props.depth}
          data-root={props.isRoot}
          data-leaf={props.isLeaf}
          data-collapsed={props.isCollapsed}
          onClick={props.toggleNode}
        />
      );
      const view = renderTree({ data: treeData(), initialDepth: 1, renderCustomNodeElement });
      const describe = (name: string) => {
        const element = queryOrThrow(view.container, `[data-custom-node="${name}"]`);
        return ['id', 'depth', 'root', 'leaf', 'collapsed'].map(attribute =>
          element.getAttribute(`data-${attribute}`)
        );
      };

      expect(describe('root')).toEqual(['0', '0', 'true', 'false', 'false']);
      expect(describe('branch-a')).toEqual(['0.0', '1', 'false', 'false', 'true']);

      click(queryOrThrow(view.container, '[data-custom-node="branch-a"]'));
      expect(describe('branch-a')).toEqual(['0.0', '1', 'false', 'false', 'false']);
      expect(describe('leaf-a1')).toEqual(['0.0.0', '2', 'false', 'true', 'false']);
    });

    it('provides custom nodes with public data, hierarchy data, handlers, and toggle control', () => {
      const onNodeClick = vi.fn<TreeNodeEventCallback>();
      const onNodeMouseOver = vi.fn<TreeNodeEventCallback>();
      const onNodeMouseOut = vi.fn<TreeNodeEventCallback>();
      const renderCustomNodeElement = (props: CustomNodeElementProps) => (
        <g
          data-custom-node={props.nodeDatum.name}
          data-depth={props.hierarchyPointNode.depth}
          onClick={event => {
            props.toggleNode();
            props.onNodeClick(event);
          }}
          onMouseOver={props.onNodeMouseOver}
          onMouseOut={props.onNodeMouseOut}
        >
          <circle r={10} />
        </g>
      );
      const view = renderTree({
        data: treeData(),
        renderCustomNodeElement,
        onNodeClick,
        onNodeMouseOver,
        onNodeMouseOut,
      });
      const root = queryOrThrow(view.container, '[data-custom-node="root"]');

      expect(root.getAttribute('data-depth')).toBe('0');
      dispatch(root, new MouseEvent('mouseover', { bubbles: true }));
      dispatch(root, new MouseEvent('mouseout', { bubbles: true }));
      click(root);

      expect(nodeLabels(view.container)).toEqual([]);
      expect(nodeElements(view.container)).toHaveLength(1);
      expect(onNodeClick.mock.calls[0][0].data.name).toBe('root');
      expect(onNodeMouseOver.mock.calls[0][0].data.name).toBe('root');
      expect(onNodeMouseOut.mock.calls[0][0].data.name).toBe('root');
    });

    it('shows children added to a leaf through a data update', () => {
      const view = renderTree({ data: { name: 'root' } });
      expect(nodeLabels(view.container)).toEqual(['root']);

      view.rerender({ data: { name: 'root', children: [{ name: 'added-child' }] } });

      expect(nodeLabels(view.container)).toEqual(['root', 'added-child']);
      expect(linkElements(view.container)).toHaveLength(1);
    });

    it('passes the live layout nodes and the native event to click callbacks', () => {
      const renderedNodes = new Map<string, CustomNodeElementProps['hierarchyPointNode']>();
      const onNodeClick = vi.fn<TreeNodeEventCallback>();
      const onLinkClick = vi.fn<TreeLinkEventCallback>();
      const renderCustomNodeElement = (props: CustomNodeElementProps) => {
        renderedNodes.set(props.nodeDatum.name, props.hierarchyPointNode);
        return (
          <circle data-custom-node={props.nodeDatum.name} r={10} onClick={props.onNodeClick} />
        );
      };
      const view = renderTree({
        data: replacementData(),
        renderCustomNodeElement,
        onNodeClick,
        onLinkClick,
      });

      click(queryOrThrow(view.container, '[data-custom-node="replacement-root"]'));
      click(linkElements(view.container)[0]);

      const [clickedNode, nodeEvent] = onNodeClick.mock.calls[0];
      const [source, target, linkEvent] = onLinkClick.mock.calls[0];
      expect(clickedNode).toBe(renderedNodes.get('replacement-root'));
      expect(nodeEvent.type).toBe('click');
      expect(nodeEvent.nativeEvent).toBeInstanceOf(MouseEvent);
      expect(source).toBe(renderedNodes.get('replacement-root'));
      expect(target).toBe(renderedNodes.get('replacement-leaf'));
      expect(linkEvent.type).toBe('click');
      expect(linkEvent.nativeEvent).toBeInstanceOf(MouseEvent);
    });

    it('passes exact link endpoints to native hover callbacks', () => {
      const onLinkMouseOver = vi.fn<TreeLinkEventCallback>();
      const onLinkMouseOut = vi.fn<TreeLinkEventCallback>();
      const view = renderTree({ data: replacementData(), onLinkMouseOver, onLinkMouseOut });
      const link = linkElements(view.container)[0];

      dispatch(link, new MouseEvent('mouseover', { bubbles: true }));
      dispatch(link, new MouseEvent('mouseout', { bubbles: true }));

      for (const callback of [onLinkMouseOver, onLinkMouseOut]) {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].data.name).toBe('replacement-root');
        expect(callback.mock.calls[0][1].data.name).toBe('replacement-leaf');
        expect(callback.mock.calls[0][2].type).toMatch(/^mouse/);
      }
    });
  });

  describe('zoom and pan controls', () => {
    it('fires no transform change on mount', () => {
      const onTransformChange = vi.fn<OnTransformChange>();

      renderTree({
        data: replacementData(),
        zoom: 0.7,
        translate: { x: 12, y: 34 },
        onTransformChange,
      });

      expect(onTransformChange).not.toHaveBeenCalled();
    });

    it('zooms through a native wheel event and respects scaleExtent', () => {
      const onTransformChange = vi.fn<OnTransformChange>();
      const view = renderTree({
        data: replacementData(),
        scaleExtent: { min: 0.5, max: 1.2 },
        onTransformChange,
      });

      wheel(getSvg(view.container), { deltaY: -10000 });

      expect(getTreeGroup(view.container).getAttribute('transform')).toContain('scale(1.2)');
      expect(onTransformChange).toHaveBeenCalledTimes(1);
      expect(onTransformChange.mock.calls[0][0].k).toBe(1.2);
    });

    it('does not zoom when zoomable is false', () => {
      const onTransformChange = vi.fn<OnTransformChange>();
      const view = renderTree({ data: replacementData(), zoomable: false, onTransformChange });
      const before = getTreeGroup(view.container).getAttribute('transform');

      wheel(getSvg(view.container));

      expect(getTreeGroup(view.container).getAttribute('transform')).toBe(before);
      expect(onTransformChange).not.toHaveBeenCalled();
    });

    it('blocks wheel events from interactive node content unless Shift is held', () => {
      const onTransformChange = vi.fn<OnTransformChange>();
      const renderCustomNodeElement = (props: CustomNodeElementProps) => (
        <foreignObject width={80} height={30}>
          <button data-node-control={props.nodeDatum.name}>Control</button>
        </foreignObject>
      );
      const view = renderTree({
        data: replacementData(),
        hasInteractiveNodes: true,
        renderCustomNodeElement,
        scaleExtent: { min: 0.5, max: 2 },
        onTransformChange,
      });
      const control = queryOrThrow(view.container, '[data-node-control="replacement-root"]');
      const before = getTreeGroup(view.container).getAttribute('transform');

      wheel(control);
      expect(getTreeGroup(view.container).getAttribute('transform')).toBe(before);
      expect(onTransformChange).not.toHaveBeenCalled();

      wheel(control, { shiftKey: true });
      expect(getTreeGroup(view.container).getAttribute('transform')).not.toBe(before);
      expect(onTransformChange).toHaveBeenCalledTimes(1);
    });

    it('updates the visible transform when zoom and translate props change', () => {
      const data = replacementData();
      const view = renderTree({ data, zoom: 1, translate: { x: 0, y: 0 } });

      view.rerender({ data, zoom: 0.6, translate: { x: 25, y: 35 } });

      expect(getTreeGroup(view.container).getAttribute('transform')).toBe(
        'translate(25,35) scale(0.6)'
      );
    });

    it('keeps zoom interactions isolated between tree instances', () => {
      const first = renderTree({
        data: replacementData(),
        scaleExtent: { min: 0.5, max: 2 },
      });
      const second = renderTree({
        data: replacementData(),
        scaleExtent: { min: 0.5, max: 2 },
      });
      const secondBefore = getTreeGroup(second.container).getAttribute('transform');

      wheel(getSvg(first.container));

      expect(getTreeGroup(first.container).getAttribute('transform')).not.toBe(secondBefore);
      expect(getTreeGroup(second.container).getAttribute('transform')).toBe(secondBefore);
    });

    it('removes native zoom listeners when the tree unmounts', () => {
      const onTransformChange = vi.fn<OnTransformChange>();
      const view = renderTree({
        data: replacementData(),
        scaleExtent: { min: 0.5, max: 2 },
        onTransformChange,
      });
      const detachedSvg = getSvg(view.container);

      view.unmount();
      wheel(detachedSvg);

      expect(onTransformChange).not.toHaveBeenCalled();
    });

    it('ends an active mouse gesture when the tree unmounts', () => {
      const onTransformChange = vi.fn<OnTransformChange>();
      const view = renderTree({ data: replacementData(), onTransformChange });
      const svg = getSvg(view.container);

      dispatch(svg, mouse('mousedown', { clientX: 10, clientY: 10 }));
      view.unmount();
      dispatch(window, mouse('mousemove', { clientX: 50, clientY: 60 }));
      dispatch(window, mouse('mouseup', { clientX: 50, clientY: 60 }));

      expect(onTransformChange).not.toHaveBeenCalled();
    });

    it.each([
      [true, true],
      [false, false],
    ])('applies draggable=%s to native mouse dragging', (draggable, shouldMove) => {
      const onTransformChange = vi.fn<OnTransformChange>();
      const view = renderTree({ data: replacementData(), draggable, onTransformChange });
      const svg = getSvg(view.container);
      const before = getTreeGroup(view.container).getAttribute('transform');

      dispatch(
        svg,
        mouse('mousedown', {
          clientX: 10,
          clientY: 10,
        })
      );
      dispatch(
        window,
        mouse('mousemove', {
          clientX: 50,
          clientY: 60,
        })
      );
      dispatch(
        window,
        mouse('mouseup', {
          clientX: 50,
          clientY: 60,
        })
      );

      expect(getTreeGroup(view.container).getAttribute('transform') !== before).toBe(shouldMove);
      expect(onTransformChange.mock.calls.length > 0).toBe(shouldMove);
    });
  });
});
