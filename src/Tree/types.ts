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
 *
 * The node is the tree's own layout node, not a copy: read it, don't change it. Its coordinates
 * are stale after the next layout, so copy what you keep.
 */
export type TreeNodeEventCallback = (
  node: HierarchyPointNode<TreeNodeDatum>,
  event: SyntheticEvent
) => void;

/**
 * Handler for link events. Receives the link's source node, target node, and the event.
 *
 * Both nodes are the tree's own layout nodes, not copies.
 */
export type TreeLinkEventCallback = (
  sourceNode: HierarchyPointNode<TreeNodeDatum>,
  targetNode: HierarchyPointNode<TreeNodeDatum>,
  event: SyntheticEvent
) => void;

/**
 * One node's collapse or expansion, as `onCollapsedChange` reports it.
 */
export type CollapsedChange = { id: string; collapsed: boolean };

/**
 * The zoom transform: `x` and `y` translate the tree in pixels, and `k` is the zoom level.
 */
export type TreeTransform = { x: number; y: number; k: number };

/**
 * The methods that a `ref` on `Tree` exposes.
 *
 * ```tsx
 * const tree = useRef<TreeHandle>(null);
 * <Tree ref={tree} data={data} />
 * tree.current?.centerNode('0.1');
 * ```
 */
export interface TreeHandle {
  /**
   * Moves the node with `id` to the center of the tree's container. The move takes
   * `options.duration` milliseconds, or {@link TreeProps.centeringTransitionDuration} if unset;
   * `0` moves it at once.
   */
  centerNode(id: string, options?: { duration?: number }): void;
  /**
   * Expands or collapses the node with `id`, even if {@link TreeProps.collapsible} is `false`.
   */
  toggleNode(id: string): void;
  /**
   * Expands every node.
   */
  expandAll(): void;
  /**
   * Collapses every node, so that only the root node shows.
   */
  collapseAll(): void;
  /**
   * Collapses every node at `depth` or deeper and expands the rest. The root node has depth `0`.
   */
  expandToDepth(depth: number): void;
  /**
   * Sets the zoom transform. The change takes `options.duration` milliseconds, or applies at
   * once if unset. {@link TreeProps.onTransformChange} reports it like a user zoom.
   */
  setTransform(transform: TreeTransform, options?: { duration?: number }): void;
  /**
   * Returns the current zoom transform.
   */
  getTransform(): TreeTransform;
}

/**
 * Props accepted by the `Tree` component. `data` is the only required prop.
 */
export interface TreeProps {
  /**
   * The root node. Each node lists its child nodes in `children`.
   *
   * `Tree` gives each node element a `data-id` attribute that holds the node's id, and each link
   * `data-source-id` and `data-target-id` attributes. A node without an `id` gets its path in the
   * tree.
   */
  data: RawNodeDatum;

  /**
   * Renders each node in place of the default node. `Tree` calls it with
   * `CustomNodeElementProps` and renders the returned SVG element. The default node is a circle
   * with the node's name and attributes as labels.
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
   * Called with the new zoom transform on each zoom or pan, and after each transform set through
   * the ref handle or by centering a clicked node. It isn't called on the first render or when
   * the `translate` and `zoom` props change; to read the transform at any time, call
   * `getTransform` on the ref handle.
   */
  onTransformChange?: (transform: TreeTransform) => void;

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
   * Whether a clicked node moves to the center of the view. `Tree` measures its container, so no
   * size is needed. To center a node at any other time, call `centerNode` on the ref handle.
   *
   * @defaultValue `false`
   */
  centerOnClick?: boolean;

  /**
   * The duration, in milliseconds, of the move that centers a node, on click or through
   * `centerNode`. `0` moves it at once.
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
   * Whether nodes expand and collapse when clicked. `toggleNode` on the ref handle works either
   * way.
   *
   * @defaultValue `true`
   */
  collapsible?: boolean;

  /**
   * Collapses every node at this depth or deeper. The root node has depth `0`. If unset, every
   * node starts expanded.
   *
   * The rule applies when `Tree` first sees a node: on the first render, and for nodes that a
   * `data` update adds. `Tree` ignores it while {@link TreeProps.collapsed} is set.
   */
  initialDepth?: number;

  /**
   * The ids of the collapsed nodes, if you manage the collapse state yourself. `Tree` renders
   * exactly this set and reports each requested change through
   * {@link TreeProps.onCollapsedChange} without changing anything itself. Only nodes with
   * children collapse: a leaf node's id in the set has no effect, and `Tree` never reports one.
   *
   * If unset, `Tree` manages the state: it starts from {@link TreeProps.initialDepth}, keeps
   * the state across `data` updates for the nodes that remain, and applies `initialDepth` to
   * nodes that are new. To reset the state for new `data`, remount `Tree` with a new `key`.
   */
  collapsed?: Iterable<string>;

  /**
   * Called with the next set of collapsed ids and the change that caused it, each time nodes
   * expand or collapse, from a click or through the ref handle. With
   * {@link TreeProps.shouldCollapseNeighborNodes}, the set also holds the neighbors that
   * collapse. `change` is `null` for `expandAll`, `collapseAll`, and `expandToDepth`, which
   * change many nodes at once. If {@link TreeProps.collapsed} is unset, `Tree` also applies the
   * change itself.
   */
  onCollapsedChange?: (collapsed: Set<string>, change: CollapsedChange | null) => void;

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
   * The smallest and largest zoom levels when {@link TreeProps.zoomable} is `true`. A missing key
   * takes its default.
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
   * for nodes with the same parent, `nonSiblings` for nodes with different parents. A missing
   * key takes its default.
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
   * Extra class names for the tree's `svg` element, which always has the `rd3t-svg` class.
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
   * Extra class names for nodes without children. An empty `children` array counts as no
   * children.
   *
   * @defaultValue `''`
   */
  leafNodeClassName?: string;

  /**
   * Limits dragging and zooming to the tree's background, so that inputs and other controls
   * inside nodes work. To drag or zoom from anywhere, hold Shift.
   *
   * @defaultValue `false`
   */
  hasInteractiveNodes?: boolean;
}
