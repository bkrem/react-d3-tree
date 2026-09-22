import { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Tree from '../../index.js';
import type { RawNodeDatum, TreeHandle, TreeProps } from '../../index.js';
import type { OnCollapsedChange, OnTransformChange } from './helpers.js';
import {
  getNodeByLabel,
  getSvg,
  getTreeGroup,
  mockContainerSize,
  nodeElements,
  nodeLabels,
  transformCoordinates,
  zoomTransform,
} from './helpers.js';

const treeData = (): RawNodeDatum => ({
  name: 'root',
  children: [
    { name: 'branch-a', children: [{ name: 'leaf-a1' }, { name: 'leaf-a2' }] },
    { name: 'branch-b', children: [{ name: 'leaf-b1' }] },
  ],
});

const mount = (props: Partial<TreeProps> = {}) => {
  const ref = createRef<TreeHandle>();
  const view = render(<Tree ref={ref} data={treeData()} {...props} />);
  const handle = () => {
    if (!ref.current) throw new Error('Tree exposed no handle');
    return ref.current;
  };
  return { ...view, handle };
};

describe('TreeHandle', () => {
  it('toggles a node by id, even when clicks are not collapsible', () => {
    const view = mount({ collapsible: false });

    act(() => view.handle().toggleNode('0.0'));
    expect(nodeLabels(view.container)).toEqual(['root', 'branch-a', 'branch-b', 'leaf-b1']);

    act(() => view.handle().toggleNode('0.0'));
    expect(nodeElements(view.container)).toHaveLength(6);
  });

  it('collapses to the root, expands to a depth, and expands everything', () => {
    const view = mount();

    act(() => view.handle().collapseAll());
    expect(nodeLabels(view.container)).toEqual(['root']);

    act(() => view.handle().expandToDepth(1));
    expect(nodeLabels(view.container)).toEqual(['root', 'branch-a', 'branch-b']);

    act(() => view.handle().expandAll());
    expect(nodeElements(view.container)).toHaveLength(6);
  });

  it('reports wholesale changes with a null change and leaves a controlled tree alone', () => {
    const onCollapsedChange = vi.fn<OnCollapsedChange>();
    const view = mount({ collapsed: [], onCollapsedChange });

    act(() => view.handle().collapseAll());

    expect(onCollapsedChange).toHaveBeenCalledTimes(1);
    // Only nodes with children collapse; the leaves stay out of the set.
    expect([...onCollapsedChange.mock.calls[0][0]].sort()).toEqual(['0', '0.0', '0.1']);
    expect(onCollapsedChange.mock.calls[0][1]).toBeNull();
    expect(nodeElements(view.container)).toHaveLength(6);
  });

  it('sets and reads the transform, reporting it like a user zoom', () => {
    const onTransformChange = vi.fn<OnTransformChange>();
    const view = mount({ onTransformChange });

    view.handle().setTransform({ x: 40, y: 20, k: 0.75 });

    expect(getTreeGroup(view.container).getAttribute('transform')).toBe(
      'translate(40,20) scale(0.75)'
    );
    expect(view.handle().getTransform()).toEqual({ x: 40, y: 20, k: 0.75 });
    expect(onTransformChange).toHaveBeenCalledTimes(1);
    expect(onTransformChange).toHaveBeenCalledWith({ x: 40, y: 20, k: 0.75 });
  });

  it('reads the initial transform before any interaction', () => {
    const view = mount({ zoom: 0.5, translate: { x: 12, y: 34 } });

    expect(view.handle().getTransform()).toEqual({ x: 12, y: 34, k: 0.5 });
  });

  it('centers a node by id at the live scale, in the container size measured on mount', () => {
    const size = { width: 400, height: 300 };
    mockContainerSize(size.width, size.height);
    const view = mount({ orientation: 'vertical', zoom: 0.5, centeringTransitionDuration: 0 });
    const { x, y } = transformCoordinates(getNodeByLabel(view.container, 'branch-b'));

    view.handle().centerNode('0.1');

    const expected = { x: -x * 0.5 + size.width / 2, y: -y * 0.5 + size.height / 2 };
    expect(zoomTransform(getSvg(view.container))).toMatchObject({ ...expected, k: 0.5 });
    expect(getTreeGroup(view.container).getAttribute('transform')).toBe(
      `translate(${expected.x},${expected.y}) scale(0.5)`
    );
    vi.restoreAllMocks();
  });

  it('ignores centerNode for an unknown id', () => {
    const view = mount({ zoom: 0.5, centeringTransitionDuration: 0 });
    const before = { ...zoomTransform(getSvg(view.container)) };

    view.handle().centerNode('no-such-node');

    expect(zoomTransform(getSvg(view.container))).toMatchObject(before);
  });
});
