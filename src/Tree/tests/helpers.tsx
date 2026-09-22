import { act, fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import Tree from '../../index.js';
import type { TreeProps } from '../../index.js';

export type OnUpdate = NonNullable<TreeProps['onUpdate']>;
export type OnCollapsedChange = NonNullable<TreeProps['onCollapsedChange']>;

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

// The query helpers throw instead of returning null: a missing element is a test failure, and
// the callers stay free of null checks.
export const queryOrThrow = (container: ParentNode, selector: string): Element => {
  const element = container.querySelector(selector);
  if (!element) throw new Error(`No element matches ${selector}`);
  return element;
};

export const nodeElements = (container: ParentNode) =>
  Array.from(container.querySelectorAll('g.rd3t-node, g.rd3t-leaf-node'));

export const linkElements = (container: ParentNode) =>
  Array.from(container.querySelectorAll('path.rd3t-link'));

export const nodeLabels = (container: ParentNode) =>
  Array.from(container.querySelectorAll('.rd3t-label__title')).map(element => element.textContent);

export const getNodeByLabel = (container: ParentNode, label: string): Element => {
  const title = Array.from(container.querySelectorAll('.rd3t-label__title')).find(
    element => element.textContent === label
  );
  const node = title?.closest('g.rd3t-node, g.rd3t-leaf-node');
  if (!node) throw new Error(`Node label not found: ${label}`);
  return node;
};

export const circleOf = (container: ParentNode, label: string) =>
  queryOrThrow(getNodeByLabel(container, label), 'circle');

export const getTreeGroup = (container: ParentNode) => queryOrThrow(container, 'g.rd3t-g');

export const getSvg = (container: ParentNode) => queryOrThrow(container, 'svg.rd3t-svg');

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
  const transform = element.getAttribute('transform');
  const match = transform?.match(/^translate\(([-\d.]+),([-\d.]+)\)$/);
  if (!match) throw new Error(`Unexpected transform: ${transform}`);
  return { x: Number(match[1]), y: Number(match[2]) };
};

// Markup with one tag per line, so snapshot diffs read well.
export const formatMarkup = (html: string) => html.replace(/></g, '>\n<');

export const renderedMarkup = (container: HTMLElement) => formatMarkup(container.innerHTML);

// jsdom reports every element as 0 by 0. The tree measures its container through
// `getBoundingClientRect` on mount, so install this before rendering; restore it afterwards.
export const mockContainerSize = (width: number, height: number) =>
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    toJSON: () => ({}),
  });

export type ZoomTransform = { x: number; y: number; k: number };

// d3-zoom keeps the current transform on the element it is bound to.
export const zoomTransform = (svg: Element) =>
  (svg as unknown as { __zoom?: ZoomTransform }).__zoom;

export { act };
