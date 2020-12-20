import { SyntheticEvent } from 'react';
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

export type SyntheticEventHandler = (evt: SyntheticEvent) => void;

/**
 * The properties that are passed to the user-defined `renderCustomNodeElement` render function.
 */
export interface CustomNodeElementProps {
  /**
   * The full datum of the node that is being rendered.
   */
  nodeDatum: TreeNodeDatum;
  /**
   * Toggles the expanded/collapsed state of the node.
   *
   * Provided for customized control flow; e.g. if we want to toggle the node when its
   * label is clicked instead of the node itself.
   */
  toggleNode: () => void;
}

export type RenderCustomNodeElementFn = (rd3tNodeProps: CustomNodeElementProps) => JSX.Element;
