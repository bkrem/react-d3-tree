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
}

export interface TreeNodeDatum extends RawNodeDatum {
  children?: TreeNodeDatum[];
  __rd3t: {
    id: string;
    depth: number;
    collapsed: boolean;
  };
}

export interface TreeLinkDatum {
  source: HierarchyPointNode<TreeNodeDatum>;
  target: HierarchyPointNode<TreeNodeDatum>;
}

export type PathFunctionOption = 'diagonal' | 'elbow' | 'straight' | 'step';
export type PathFunction = (link: TreeLinkDatum, orientation: Orientation) => string;
export type PathClassFunction = PathFunction;

export type SyntheticEventHandler = (evt: React.SyntheticEvent) => void;

export interface CustomNodeElementProps {
  data: TreeNodeDatum;
  toggleNode: () => void;
}

/**
 * Function to render a custom node element. Should return a `ReactElement`.
 */
export type RenderCustomNodeElementFn = (rd3tProps: CustomNodeElementProps) => JSX.Element;
