import { ReactElement, SyntheticEvent } from 'react';
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
   * The node's stable identity: collapse state, React keys, and the DOM `data-id` attribute use
   * it. If unset, the node gets its path in the tree: `"0"` for the root, `"0.2"` for its third
   * child. A path stays stable as long as the structure does, so set ids when nodes move.
   */
  id?: string;
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
 * A node as `Tree` hands it to renderers and callbacks: the `RawNodeDatum` you passed, with `id`
 * filled in.
 */
export interface TreeNodeDatum extends RawNodeDatum {
  /**
   * The node's `id` from `data`, or its path in the tree.
   */
  id: string;
  children?: TreeNodeDatum[];
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

/**
 * The props that `Tree` passes to the `renderCustomNodeElement` function.
 */
export interface CustomNodeElementProps {
  /**
   * The node's `id` from `data`, or its path in the tree.
   */
  id: string;
  /**
   * The node's depth in the tree. The root node has depth `0`.
   */
  depth: number;
  /**
   * Whether the node is the root node.
   */
  isRoot: boolean;
  /**
   * Whether the node has no children. An empty `children` array counts as no children.
   */
  isLeaf: boolean;
  /**
   * Whether the node's children are hidden.
   */
  isCollapsed: boolean;
  /**
   * The node's data. It's the tree's own object: read it, don't change it.
   */
  nodeDatum: TreeNodeDatum;
  /**
   * The D3 `HierarchyPointNode` for the node, which holds `nodeDatum` along with the node's
   * position, parent, and children. Read it, don't change it.
   */
  hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>;
  /**
   * Expands or collapses the node, unless `collapsible` is `false`. Call it from the element that
   * should toggle the node, for example a label. If `centerOnClick` is set, it also centers the
   * node.
   */
  toggleNode: () => void;
  /**
   * Calls the `onNodeClick` prop and, if `centerOnClick` is set, centers the node.
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
}

/**
 * Renders a node. Receives `CustomNodeElementProps` and returns an SVG element.
 */
export type RenderCustomNodeElementFn = (rd3tNodeProps: CustomNodeElementProps) => ReactElement;
