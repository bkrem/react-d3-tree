import { act, fireEvent, render } from '@testing-library/react';

import Tree from '../../index.js';
import type { TreeProps } from '../../index.js';

export type OnUpdate = NonNullable<TreeProps['onUpdate']>;

export type TreeView = {
  container: HTMLElement;
  rerender: (nextProps: TreeProps) => void;
  unmount: () => void;
};

export const renderTree = (props: TreeProps): TreeView => {
  const view = render(<Tree {...props} />);
  return {
    container: view.container,
    rerender: nextProps => view.rerender(<Tree {...nextProps} />),
    unmount: view.unmount,
  };
};

export const nodeElements = (container: ParentNode) =>
  Array.from(container.querySelectorAll('g.rd3t-node, g.rd3t-leaf-node'));

export const linkElements = (container: ParentNode) =>
  Array.from(container.querySelectorAll('path.rd3t-link'));

export const nodeLabels = (container: ParentNode) =>
  Array.from(container.querySelectorAll('.rd3t-label__title')).map(element => element.textContent);

export const getNodeByLabel = (container: ParentNode, label: string) => {
  const title = Array.from(container.querySelectorAll('.rd3t-label__title')).find(
    element => element.textContent === label
  );
  if (!title) throw new Error(`Node label not found: ${label}`);
  return title.closest('g.rd3t-node, g.rd3t-leaf-node');
};

export const getTreeGroup = (container: ParentNode) => container.querySelector('g.rd3t-g');

export const getSvg = (container: ParentNode) => container.querySelector('svg.rd3t-svg');

export const dispatch = (target: Element | Window, event: Event) => {
  fireEvent(target, event);
};

export const click = (element: Element, init: MouseEventInit = {}) =>
  dispatch(element, new MouseEvent('click', { bubbles: true, ...init }));

export const wheel = (element: Element, init: WheelEventInit = {}) => {
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

export const mouse = (type: string, init: MouseEventInit = {}) => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
  Object.defineProperty(event, 'view', { value: window });
  return event;
};

export const transformCoordinates = (element: Element) => {
  const match = element.getAttribute('transform').match(/^translate\(([-\d.]+),([-\d.]+)\)$/);
  if (!match) throw new Error(`Unexpected transform: ${element.getAttribute('transform')}`);
  return { x: Number(match[1]), y: Number(match[2]) };
};

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

// The mounted markup with the random ids masked, one tag per line so snapshot diffs read well.
export const renderedMarkup = (container: HTMLElement) =>
  container.innerHTML.replace(UUID, 'ID').replace(/></g, '>\n<');

export type ZoomTransform = { x: number; y: number; k: number };

// d3-zoom keeps the current transform on the element it is bound to.
export const zoomTransform = (svg: Element) =>
  (svg as unknown as { __zoom?: ZoomTransform }).__zoom;

export { act };
