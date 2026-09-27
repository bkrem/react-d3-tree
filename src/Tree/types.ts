import { HierarchyPointNode } from 'd3-hierarchy';
import { SyntheticEvent } from 'react';
import {
  Orientation,
  PathClassFunction,
  PathFunction,
  PathFunctionOption,
  Point,
  RawNodeDatum,
  RenderCustomNodeElementFn,
  TreeNodeDatum,
} from '../types/common.js';

/**
 * Handler for node events. Receives the node and the event.
 */
export type TreeNodeEventCallback = (
  node: HierarchyPointNode<TreeNodeDatum>,
  event: SyntheticEvent
) => any;

/**
 * Handler for link events. Receives the link's source node, target node, and the event.
 */
export type TreeLinkEventCallback = (
  sourceNode: HierarchyPointNode<TreeNodeDatum>,
  targetNode: HierarchyPointNode<TreeNodeDatum>,
  event: SyntheticEvent
) => any;

/**
 * Props accepted by the `Tree` component. `data` is the only required prop.
 */
export interface TreeProps {
  /**
   * The root node. Each node lists its child nodes in `children`. If you pass an array, `Tree`
   * renders only its first element.
   *
   * `Tree` gives each node element a unique `id` attribute, and each link `data-source-id` and
   * `data-target-id` attributes.
   */
  data: RawNodeDatum[] | RawNodeDatum;

  /**
   * Renders each node in place of the default node. `Tree` calls it with
   * `CustomNodeElementProps` and renders the returned SVG element.
   */
  renderCustomNodeElement?: RenderCustomNodeElementFn;

  /**
   * Called with the node and the event when a node is clicked. The default node calls it on a
   * click on its circle.
   */
  onNodeClick?: TreeNodeEventCallback;

  /**
   * Called with the node and the event when the pointer moves onto a node.
   */
  onNodeMouseOver?: TreeNodeEventCallback;

  /**
   * Called with the node and the event when the pointer leaves a node.
   */
  onNodeMouseOut?: TreeNodeEventCallback;

  /**
   * Called with the link's source node, target node, and the event when a link is clicked.
   */
  onLinkClick?: TreeLinkEventCallback;

  /**
   * Called with the link's source node, target node, and the event when the pointer moves onto
   * a link.
   */
  onLinkMouseOver?: TreeLinkEventCallback;

  /**
   * Called with the link's source node, target node, and the event when the pointer leaves a
   * link.
   */
  onLinkMouseOut?: TreeLinkEventCallback;

  /**
   * Called after each zoom or pan, and after each update of the tree, such as a node toggle.
   * `node` is the toggled node, or `null` if no node was toggled.
   */
  onUpdate?: (target: { node: TreeNodeDatum | null; zoom: number; translate: Point }) => any;

  /**
   * The direction in which the tree grows: `horizontal` grows left to right, `vertical` grows
   * top to bottom. To reverse the direction, pass a negative {@link TreeProps.depthFactor}.
   *
   * @defaultValue `'horizontal'`
   */
  orientation?: Orientation;

  /**
   * Moves the tree along the x and y axes, in pixels. At `{ x: 0, y: 0 }`, the root node sits
   * in the top-left corner of the SVG.
   *
   * @defaultValue `{ x: 0, y: 0 }`
   */
  translate?: Point;

  /**
   * The width and height of the tree's container, for example from
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect | `getBoundingClientRect()`}.
   * If set, a clicked node moves to the center of the view.
   */
  dimensions?: {
    width: number;
    height: number;
  };

  /**
   * The duration, in milliseconds, of the move that centers a clicked node. Needs
   * {@link TreeProps.dimensions}.
   *
   * @defaultValue `800`
   */
  centeringTransitionDuration?: number;

  /**
   * How links are drawn: one of the `PathFunctionOption` values, or a `PathFunction` that returns
   * the link's SVG path. For the path syntax, see
   * {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d | the `d` attribute}.
   *
   * @defaultValue `'diagonal'`
   */
  pathFunc?: PathFunctionOption | PathFunction;

  /**
   * Returns extra class names for a link. `Tree` calls it for each link with the link's
   * `TreeLinkDatum` and the tree's `orientation`.
   */
  pathClassFunc?: PathClassFunction;

  /**
   * The distance, in pixels, between depth levels: each node sits at `node.depth * depthFactor`
   * along the depth axis. A negative value reverses the tree's direction; `0` puts every node on
   * the same level. If unset, {@link TreeProps.nodeSize} sets the distance.
   */
  depthFactor?: number;

  /**
   * Whether nodes expand and collapse when clicked.
   *
   * @defaultValue `true`
   */
  collapsible?: boolean;

  /**
   * Collapses every node at this depth or deeper on the first render. The root node has depth
   * `0`. If unset, every node starts expanded.
   */
  initialDepth?: number;

  /**
   * Whether the user can zoom the tree, within {@link TreeProps.scaleExtent}.
   *
   * @defaultValue `true`
   */
  zoomable?: boolean;

  /**
   * Whether the user can drag the tree to pan it.
   *
   * @defaultValue `true`
   */
  draggable?: boolean;

  /**
   * The starting zoom level, limited to {@link TreeProps.scaleExtent}.
   *
   * @defaultValue `1`
   */
  zoom?: number;

  /**
   * The smallest and largest zoom levels when {@link TreeProps.zoomable} is `true`.
   *
   * @defaultValue `{ min: 0.1, max: 1 }`
   */
  scaleExtent?: {
    min?: number;
    max?: number;
  };

  /**
   * The space, in pixels, that each node takes up: `x` horizontally, `y` vertically.
   *
   * @defaultValue `{ x: 140, y: 140 }`
   */
  nodeSize?: {
    x: number;
    y: number;
  };

  /**
   * The space between neighboring nodes, as a multiple of {@link TreeProps.nodeSize}: `siblings`
   * for nodes with the same parent, `nonSiblings` for nodes with different parents.
   *
   * @defaultValue `{ siblings: 1, nonSiblings: 2 }`
   */
  separation?: {
    siblings?: number;
    nonSiblings?: number;
  };

  /**
   * Whether expanding a node collapses the other nodes at the same depth.
   *
   * @defaultValue `false`
   */
  shouldCollapseNeighborNodes?: boolean;

  /**
   * Extra class names for the tree's `svg` element.
   *
   * @defaultValue `''`
   */
  svgClassName?: string;

  /**
   * Extra class names for the root node.
   *
   * @defaultValue `''`
   */
  rootNodeClassName?: string;

  /**
   * Extra class names for nodes with children.
   *
   * @defaultValue `''`
   */
  branchNodeClassName?: string;

  /**
   * Extra class names for nodes without children.
   *
   * @defaultValue `''`
   */
  leafNodeClassName?: string;

  /**
   * Animates nodes as they expand and collapse, using `react-transition-group`. Can slow down
   * large trees.
   *
   * @defaultValue `false`
   */
  enableLegacyTransitions?: boolean;

  /**
   * The duration, in milliseconds, of the expand and collapse animation. Needs
   * {@link TreeProps.enableLegacyTransitions}.
   *
   * @defaultValue `500`
   */
  transitionDuration?: number;

  /**
   * Limits dragging and zooming to the tree's background, so that inputs and other controls
   * inside nodes work. To drag or zoom from anywhere, hold Shift.
   *
   * @defaultValue `false`
   */
  hasInteractiveNodes?: boolean;

  /**
   * Identifies the tree that `data` describes. If `data` changes and `dataKey` stays the same,
   * `Tree` treats the change as an update to the same tree and keeps its state, such as which
   * nodes are collapsed. If `dataKey` changes or is unset, new `data` resets the tree.
   */
  dataKey?: string;
}
