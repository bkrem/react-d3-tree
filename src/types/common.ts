import { ReactElement, SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';

export type Orientation = 'horizontal' | 'vertical';

export interface Point {
  x: number;
  y: number;
}

export interface RawNodeDatum {
  /**
   * The node's stable identity: collapse state, React keys, and the DOM `data-id` attribute use
   * it. Defaults to the node's path in the tree (`"0"` for the root, `"0.2"` for its third
   * child), which stays stable as long as the structure does. Supply ids when nodes move.
   */
  id?: string;
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
}

/** A node as the tree hands it to renderers and callbacks: `RawNodeDatum` with its id filled in. */
export interface TreeNodeDatum extends RawNodeDatum {
  id: string;
  children?: TreeNodeDatum[];
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
  /** The node's id: the one in `data`, or its path in the tree. */
  id: string;
  /** The node's depth; the root is at 0. */
  depth: number;
  isRoot: boolean;
  /** True when the node has no children, including an empty `children` array. */
  isLeaf: boolean;
  /** True when the node's children are hidden. */
  isCollapsed: boolean;
  /**
   * The full datum of the node that is being rendered. The tree's own object: read it, don't
   * change it.
   */
  nodeDatum: TreeNodeDatum;
  /**
   * The D3 `HierarchyPointNode` representation of the node, which wraps `nodeDatum`
   * with its layout position and its links to parent and children. Read-only.
   */
  hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>;
  /**
   * Toggles the expanded/collapsed state of the node.
   *
   * Provided for customized control flow; e.g. if we want to toggle the node when its
   * label is clicked instead of the node itself.
   */
  toggleNode: () => void;
  /**
   * The `onNodeClick` handler defined for `Tree` (if any).
   */
  onNodeClick: SyntheticEventHandler;
  /**
   * The `onNodeMouseOver` handler defined for `Tree` (if any).
   */
  onNodeMouseOver: SyntheticEventHandler;
  /**
   * The `onNodeMouseOut` handler defined for `Tree` (if any).
   */
  onNodeMouseOut: SyntheticEventHandler;
}

export type RenderCustomNodeElementFn = (rd3tNodeProps: CustomNodeElementProps) => ReactElement;
