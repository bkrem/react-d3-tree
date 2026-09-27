import { SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';

/**
 * The direction in which the tree grows: `horizontal` grows left to right, `vertical` grows top to
 * bottom.
 */
export type Orientation = 'horizontal' | 'vertical';

/**
 * A position or offset along the x and y axes.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A node in the `data` you pass to `Tree`.
 */
export interface RawNodeDatum {
  /**
   * The node's name. The default node shows it as the main label.
   */
  name: string;
  /**
   * Extra details about the node. The default node lists each key-value pair below the name.
   */
  attributes?: Record<string, string | number | boolean>;
  /**
   * The node's child nodes.
   */
  children?: RawNodeDatum[];
}

/**
 * A node as `Tree` stores it: the `RawNodeDatum` you passed, plus the internal `__rd3t` state.
 */
export interface TreeNodeDatum extends RawNodeDatum {
  children?: TreeNodeDatum[];
  /**
   * The node's generated ID, its depth in the tree (the root node has depth `0`), and whether it's
   * collapsed.
   */
  __rd3t: {
    id: string;
    depth: number;
    collapsed: boolean;
  };
}

/**
 * A link between two nodes. `source` is the parent node and `target` is the child node.
 */
export interface TreeLinkDatum {
  source: HierarchyPointNode<TreeNodeDatum>;
  target: HierarchyPointNode<TreeNodeDatum>;
}

/**
 * The built-in link shapes for the `pathFunc` prop.
 */
export type PathFunctionOption = 'diagonal' | 'elbow' | 'straight' | 'step';

/**
 * Returns the SVG path (the `d` attribute) that draws a link.
 *
 * In a horizontal tree, `x` and `y` swap: a node's `y` is its horizontal position.
 */
export type PathFunction = (link: TreeLinkDatum, orientation: Orientation) => string;

/**
 * Returns extra class names for a link.
 */
export type PathClassFunction = PathFunction;

export type SyntheticEventHandler = (evt: SyntheticEvent) => void;
export type AddChildrenFunction = (children: RawNodeDatum[]) => void;

/**
 * The props that `Tree` passes to the `renderCustomNodeElement` function.
 */
export interface CustomNodeElementProps {
  /**
   * The node's data.
   */
  nodeDatum: TreeNodeDatum;
  /**
   * The D3 `HierarchyPointNode` for the node, which holds `nodeDatum` along with the node's
   * position, parent, and children.
   */
  hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>;
  /**
   * Expands or collapses the node. Call it from the element that should toggle the node, for
   * example a label.
   */
  toggleNode: () => void;
  /**
   * Calls the `onNodeClick` prop and, if `dimensions` is set, centers the node.
   */
  onNodeClick: SyntheticEventHandler;
  /**
   * Calls the `onNodeMouseOver` prop.
   */
  onNodeMouseOver: SyntheticEventHandler;
  /**
   * Calls the `onNodeMouseOut` prop.
   */
  onNodeMouseOut: SyntheticEventHandler;
  /**
   * Appends the given nodes to this node's children.
   */
  addChildren: AddChildrenFunction;
}

/**
 * Renders a node. Receives `CustomNodeElementProps` and returns an SVG element.
 */
export type RenderCustomNodeElementFn = (rd3tNodeProps: CustomNodeElementProps) => JSX.Element;
