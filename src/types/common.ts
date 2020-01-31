import { HierarchyPointNode } from 'd3';

export type FIXME = any;

export type Orientation = 'horizontal' | 'vertical';

export type PositionCoordinates = { x: number; y: number };

export type RawNodeDatum = {
  name: string;
  attributes?: Record<string, string>;
  nodeElement?: NodeElement;
  children?: RawNodeDatum[];
  _collapsed?: boolean;
};

// TODO: encapsulate internal properties in own key, e.g. `data.internals._depth`
export type TreeNodeDatum = RawNodeDatum & {
  id: string;
  children?: TreeNodeDatum[];
  // TODO: deprecate this field if possible
  _children?: TreeNodeDatum[];
  _depth: number;
};

export type TreeLink = {
  source: HierarchyPointNode<TreeNodeDatum>;
  target: HierarchyPointNode<TreeNodeDatum>;
};

export type PathFunctionOption = 'diagonal' | 'elbow' | 'straight' | 'step';
export type PathFunction = (linkData: TreeLink, orientation: Orientation) => string;

export type NodeElement = {
  tag: string;
  baseProps: Record<string, FIXME>;
  branchNodeProps?: Record<string, FIXME>;
  leafNodeProps?: Record<string, FIXME>;
};
