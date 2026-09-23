import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import Tree from '../../index.js';

const mountedContainers = new Set();

const treeData = () => ({
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

const replacementData = () => ({
  name: 'replacement-root',
  children: [{ name: 'replacement-leaf' }],
});

const renderTree = props => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  mountedContainers.add(container);

  const rerender = nextProps => {
    act(() => {
      render(<Tree {...nextProps} />, container);
    });
  };

  rerender(props);

  return {
    container,
    rerender,
    unmount: () => {
      act(() => {
        unmountComponentAtNode(container);
      });
      container.remove();
      mountedContainers.delete(container);
    },
  };
};

const nodeElements = container => [...container.querySelectorAll('g.rd3t-node, g.rd3t-leaf-node')];
const linkElements = container => [...container.querySelectorAll('path.rd3t-link')];
const nodeLabels = container =>
  [...container.querySelectorAll('.rd3t-label__title')].map(element => element.textContent);
const getNodeByLabel = (container, label) => {
  const title = [...container.querySelectorAll('.rd3t-label__title')].find(
    element => element.textContent === label
  );
  if (!title) throw new Error(`Node label not found: ${label}`);
  return title.closest('g.rd3t-node, g.rd3t-leaf-node');
};
const getTreeGroup = container => container.querySelector('g.rd3t-g');
const getSvg = container => container.querySelector('svg.rd3t-svg');

const dispatch = (element, event) => {
  act(() => {
    element.dispatchEvent(event);
  });
};

const click = (element, init = {}) =>
  dispatch(element, new MouseEvent('click', { bubbles: true, ...init }));

const wheel = (element, init = {}) => {
  const event = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    clientX: 20,
    clientY: 20,
    deltaY: -100,
    ...init,
  });
  Object.defineProperty(event, 'view', { value: window });
  dispatch(element, event);
};

const mouse = (type, init = {}) => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
  Object.defineProperty(event, 'view', { value: window });
  return event;
};

const transformCoordinates = element => {
  const match = element.getAttribute('transform').match(/^translate\(([-\d.]+),([-\d.]+)\)$/);
  if (!match) throw new Error(`Unexpected transform: ${element.getAttribute('transform')}`);
  return { x: Number(match[1]), y: Number(match[2]) };
};

afterEach(() => {
  mountedContainers.forEach(container => {
    act(() => {
      unmountComponentAtNode(container);
    });
    container.remove();
  });
  mountedContainers.clear();
  vi.useRealTimers();
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

    it('keeps the rendered dataset when its dataKey is unchanged', () => {
      const view = renderTree({ data: treeData(), dataKey: 'dataset-a' });

      view.rerender({ data: replacementData(), dataKey: 'dataset-a' });

      expect(nodeLabels(view.container)).toContain('root');
      expect(nodeLabels(view.container)).not.toContain('replacement-root');
    });

    it('replaces the rendered dataset when its dataKey changes', () => {
      const view = renderTree({ data: treeData(), dataKey: 'dataset-a' });

      view.rerender({ data: replacementData(), dataKey: 'dataset-b' });

      expect(nodeLabels(view.container)).toEqual(['replacement-root', 'replacement-leaf']);
    });

    it('reapplies initialDepth when a new dataset is rendered', () => {
      const view = renderTree({ data: treeData(), dataKey: 'dataset-a', initialDepth: 0 });
      click(getNodeByLabel(view.container, 'root').querySelector('circle'));
      expect(nodeElements(view.container).length).toBeGreaterThan(1);

      view.rerender({
        data: replacementData(),
        dataKey: 'dataset-b',
        initialDepth: 0,
      });

      expect(nodeLabels(view.container)).toEqual(['replacement-root']);
      expect(linkElements(view.container)).toHaveLength(0);
    });

    it('does not add internal fields to caller-owned data', () => {
      const data = treeData();
      const before = JSON.parse(JSON.stringify(data));

      const view = renderTree({ data });
      click(getNodeByLabel(view.container, 'root').querySelector('circle'));

      expect(data).toEqual(before);
    });
  });

  describe('collapse and expansion', () => {
    it('removes descendants and restores one collapsed level per toggle', () => {
      const view = renderTree({ data: treeData() });
      const rootCircle = () => getNodeByLabel(view.container, 'root').querySelector('circle');

      expect(nodeElements(view.container)).toHaveLength(6);
      expect(linkElements(view.container)).toHaveLength(5);

      click(rootCircle());
      expect(nodeLabels(view.container)).toEqual(['root']);
      expect(linkElements(view.container)).toHaveLength(0);

      click(rootCircle());
      expect(nodeLabels(view.container)).toEqual(['root', 'branch-a', 'branch-b']);
      expect(linkElements(view.container)).toHaveLength(2);

      click(getNodeByLabel(view.container, 'branch-a').querySelector('circle'));
      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
      ]);
    });

    it('fires onNodeClick without changing visibility when collapsible is false', () => {
      const onNodeClick = vi.fn();
      const view = renderTree({ data: treeData(), collapsible: false, onNodeClick });

      click(getNodeByLabel(view.container, 'root').querySelector('circle'));

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

      click(getNodeByLabel(view.container, 'branch-a').querySelector('circle'));
      expect(nodeLabels(view.container)).toEqual([
        'root',
        'branch-a',
        'branch-b',
        'leaf-a1',
        'leaf-a2',
      ]);

      click(getNodeByLabel(view.container, 'branch-b').querySelector('circle'));
      expect(nodeLabels(view.container)).toEqual(['root', 'branch-a', 'branch-b', 'leaf-b1']);
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

      expect(root.querySelector('.rd3t-label__title').textContent).toBe('root');
      expect(
        [...root.querySelectorAll('.rd3t-label__attributes tspan')].map(node => node.textContent)
      ).toEqual(['active: true', 'count: 0']);
    });

    it('keeps node IDs unique and makes every link reference rendered nodes', () => {
      const view = renderTree({ data: treeData() });
      const nodeIds = nodeElements(view.container).map(node => node.id);

      expect(new Set(nodeIds).size).toBe(nodeIds.length);
      linkElements(view.container).forEach(link => {
        expect(nodeIds).toContain(link.getAttribute('data-source-id'));
        expect(nodeIds).toContain(link.getAttribute('data-target-id'));
      });
    });

    it.each(['diagonal', 'elbow', 'straight', 'step'])(
      'renders the %s path function through the public Tree prop',
      pathFunc => {
        const view = renderTree({ data: replacementData(), pathFunc });

        expect(linkElements(view.container)[0].getAttribute('d')).toMatch(/^M/);
      }
    );

    it('uses custom path and path class functions with public link data', () => {
      const pathFunc = vi.fn(() => 'M1,2L3,4');
      const pathClassFunc = vi.fn(() => 'custom-link');
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
    it('provides custom nodes with public data, hierarchy data, handlers, and toggle control', () => {
      const onNodeClick = vi.fn();
      const onNodeMouseOver = vi.fn();
      const onNodeMouseOut = vi.fn();
      const renderCustomNodeElement = props => (
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
      const root = view.container.querySelector('[data-custom-node="root"]');

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

    it('adds children through a custom leaf node without mutating the input', () => {
      const data = { name: 'root' };
      const before = JSON.parse(JSON.stringify(data));
      const renderCustomNodeElement = props => (
        <g
          data-custom-node={props.nodeDatum.name}
          onClick={() => props.addChildren([{ name: 'added-child' }])}
        >
          <text>{props.nodeDatum.name}</text>
        </g>
      );
      const view = renderTree({ data, renderCustomNodeElement });

      click(view.container.querySelector('[data-custom-node="root"]'));

      expect(view.container.querySelector('[data-custom-node="added-child"]')).not.toBeNull();
      expect(data).toEqual(before);
    });

    it('passes cloned node and link data with the native event', () => {
      const renderedNodes = new Map();
      const onNodeClick = vi.fn();
      const onLinkClick = vi.fn();
      const renderCustomNodeElement = props => {
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

      click(
        view.container.querySelector(
          '[data-custom-node="root"], [data-custom-node="replacement-root"]'
        )
      );
      click(linkElements(view.container)[0]);

      const [clickedNode, nodeEvent] = onNodeClick.mock.calls[0];
      const [source, target, linkEvent] = onLinkClick.mock.calls[0];
      expect(clickedNode.data.name).toBe('replacement-root');
      expect(clickedNode).not.toBe(renderedNodes.get('replacement-root'));
      expect(clickedNode.data).not.toBe(renderedNodes.get('replacement-root').data);
      expect(nodeEvent.type).toBe('click');
      expect(nodeEvent.nativeEvent).toBeInstanceOf(
        view.container.ownerDocument.defaultView.MouseEvent
      );
      expect([source.data.name, target.data.name]).toEqual([
        'replacement-root',
        'replacement-leaf',
      ]);
      expect(source).not.toBe(renderedNodes.get('replacement-root'));
      expect(target).not.toBe(renderedNodes.get('replacement-leaf'));
      expect(linkEvent.type).toBe('click');
      expect(linkEvent.nativeEvent).toBeInstanceOf(
        view.container.ownerDocument.defaultView.MouseEvent
      );

      clickedNode.data.name = 'changed-by-consumer';
      expect(view.container.querySelector('[data-custom-node="replacement-root"]')).not.toBeNull();
    });

    it('passes exact link endpoints to native hover callbacks', () => {
      const onLinkMouseOver = vi.fn();
      const onLinkMouseOut = vi.fn();
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

    it('reports the initial geometry through onUpdate after mount', () => {
      const onUpdate = vi.fn();

      renderTree({
        data: replacementData(),
        zoom: 0.7,
        translate: { x: 12, y: 34 },
        onUpdate,
      });

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith({
        node: null,
        zoom: 0.7,
        translate: { x: 12, y: 34 },
      });
    });

    it('reports one semantic onUpdate for one toggle after mount', () => {
      const onUpdate = vi.fn();
      const view = renderTree({ data: treeData(), onUpdate });
      onUpdate.mockClear();

      click(getNodeByLabel(view.container, 'root').querySelector('circle'));

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith({
        node: expect.objectContaining({ name: 'root' }),
        zoom: 1,
        translate: { x: 0, y: 0 },
      });
    });
  });

  describe('zoom and pan controls', () => {
    it('zooms through a native wheel event and respects scaleExtent', () => {
      const onUpdate = vi.fn();
      const view = renderTree({
        data: replacementData(),
        scaleExtent: { min: 0.5, max: 1.2 },
        onUpdate,
      });
      onUpdate.mockClear();

      wheel(getSvg(view.container), { deltaY: -10000 });

      expect(getTreeGroup(view.container).getAttribute('transform')).toContain('scale(1.2)');
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate.mock.calls[0][0].zoom).toBe(1.2);
    });

    it('does not zoom when zoomable is false', () => {
      const onUpdate = vi.fn();
      const view = renderTree({ data: replacementData(), zoomable: false, onUpdate });
      const before = getTreeGroup(view.container).getAttribute('transform');
      onUpdate.mockClear();

      wheel(getSvg(view.container));

      expect(getTreeGroup(view.container).getAttribute('transform')).toBe(before);
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('blocks wheel events from interactive node content unless Shift is held', () => {
      const onUpdate = vi.fn();
      const renderCustomNodeElement = props => (
        <foreignObject width={80} height={30}>
          <button data-node-control={props.nodeDatum.name}>Control</button>
        </foreignObject>
      );
      const view = renderTree({
        data: replacementData(),
        hasInteractiveNodes: true,
        renderCustomNodeElement,
        scaleExtent: { min: 0.5, max: 2 },
        onUpdate,
      });
      const control = view.container.querySelector('[data-node-control="replacement-root"]');
      const before = getTreeGroup(view.container).getAttribute('transform');
      onUpdate.mockClear();

      wheel(control);
      expect(getTreeGroup(view.container).getAttribute('transform')).toBe(before);
      expect(onUpdate).not.toHaveBeenCalled();

      wheel(control, { shiftKey: true });
      expect(getTreeGroup(view.container).getAttribute('transform')).not.toBe(before);
      expect(onUpdate).toHaveBeenCalledTimes(1);
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
      const onUpdate = vi.fn();
      const view = renderTree({
        data: replacementData(),
        scaleExtent: { min: 0.5, max: 2 },
        onUpdate,
      });
      const detachedSvg = getSvg(view.container);
      onUpdate.mockClear();

      view.unmount();
      wheel(detachedSvg);

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('ends an active mouse gesture when the tree unmounts', () => {
      const onUpdate = vi.fn();
      const view = renderTree({ data: replacementData(), onUpdate });
      const svg = getSvg(view.container);
      onUpdate.mockClear();

      dispatch(
        svg,
        mouse('mousedown', {
          clientX: 10,
          clientY: 10,
        })
      );
      view.unmount();
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

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it.each([
      [true, true],
      [false, false],
    ])('applies draggable=%s to native mouse dragging', (draggable, shouldMove) => {
      const onUpdate = vi.fn();
      const view = renderTree({ data: replacementData(), draggable, onUpdate });
      const svg = getSvg(view.container);
      const before = getTreeGroup(view.container).getAttribute('transform');
      onUpdate.mockClear();

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
      expect(onUpdate.mock.calls.length > 0).toBe(shouldMove);
    });
  });
});
