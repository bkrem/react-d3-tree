import { HierarchyPointNode } from 'd3-hierarchy';

export type Orientation = 'horizontal' | 'vertical';

export interface Point {
  x: number;
  y: number;
}

export interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string>;
  children?: RawNodeDatum[];
  _collapsed?: boolean;
}

// TODO: encapsulate internal properties in own key, e.g. `data.internals._depth`
export interface TreeNodeDatum extends RawNodeDatum {
  id: string;
  children?: TreeNodeDatum[];
  // TODO: deprecate this field if possible
  _children?: TreeNodeDatum[];
  _depth: number;
}

export interface TreeLinkDatum {
  source: HierarchyPointNode<TreeNodeDatum>;
  target: HierarchyPointNode<TreeNodeDatum>;
}

export type PathFunctionOption = 'diagonal' | 'elbow' | 'straight' | 'step';
export type PathFunction = (link: TreeLinkDatum, orientation: Orientation) => string;
export type PathClassFunction = PathFunction;

/**
 * Function to render a custom node element. Should return a `ReactElement`.
 */
export type RenderCustomNodeElementFn = (nodeDatum: TreeNodeDatum) => JSX.Element;
