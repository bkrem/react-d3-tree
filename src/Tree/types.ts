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
 * Receives the tree's own layout node, not a copy: read it, don't change it. After the next
 * layout its coordinates are stale.
 */
export type TreeNodeEventCallback = (
  node: HierarchyPointNode<TreeNodeDatum>,
  event: SyntheticEvent
) => void;

/** Receives the tree's own layout nodes for both ends of the link, not copies. */
export type TreeLinkEventCallback = (
  sourceNode: HierarchyPointNode<TreeNodeDatum>,
  targetNode: HierarchyPointNode<TreeNodeDatum>,
  event: SyntheticEvent
) => void;

/** One node's collapse or expansion, as reported by `onCollapsedChange`. */
export type CollapsedChange = { id: string; collapsed: boolean };

/** The zoom transform: a translation in pixels and a scale factor. */
export type TreeTransform = { x: number; y: number; k: number };

/**
 * The methods a `ref` on `Tree` exposes.
 *
 * ```tsx
 * const tree = useRef<TreeHandle>(null);
 * <Tree ref={tree} data={data} />
 * tree.current?.centerNode('0.1');
 * ```
 */
export interface TreeHandle {
  /**
   * Centers the node with `id` in the container, using the container size the tree measured.
   * Animates over `options.duration` milliseconds, or `centeringTransitionDuration` by default;
   * a duration of 0 applies the transform at once.
   */
  centerNode(id: string, options?: { duration?: number }): void;
  /** Collapses or expands the node with `id`. Works even when `collapsible` is false. */
  toggleNode(id: string): void;
  /** Expands every node. */
  expandAll(): void;
  /** Collapses every node, so only the root is visible. */
  collapseAll(): void;
  /** Collapses every node at `depth` or deeper and expands the rest. */
  expandToDepth(depth: number): void;
  /**
   * Sets the zoom transform. Animates over `options.duration` milliseconds; without a duration
   * the transform applies at once. The change reports through the same callbacks as a user
   * zoom.
   */
  setTransform(transform: TreeTransform, options?: { duration?: number }): void;
  /** The current zoom transform. */
  getTransform(): TreeTransform;
}

/**
 * Props accepted by the `Tree` component.
 *
 * {@link Tree.defaultProps | Default Props}
 */
export interface TreeProps {
  /**
   * The root node object, in which child nodes (also of type `RawNodeDatum`)
   * are recursively defined in the `children` key.
   *
   * Every node's `<g>` carries its id in a `data-id` attribute, and every link's `<path>`
   * carries the ids of its endpoints in `data-source-id` and `data-target-id`. A node without
   * an `id` gets its path in the tree.
   */
  data: RawNodeDatum;

  /**
   * Custom render function that will be used for every node in the tree.
   *
   * The function is passed `CustomNodeElementProps` as its first argument.
   * `react-d3-tree` expects the function to return a `ReactElement`.
   *
   * See the `RenderCustomNodeElementFn` type for more details.
   *
   * {@link Tree.defaultProps.renderCustomNodeElement | Default value}
   */
  renderCustomNodeElement?: RenderCustomNodeElementFn;

  /**
   * Called when a node is clicked.
   *
   * {@link Tree.defaultProps.onNodeClick | Default value}
   */
  onNodeClick?: TreeNodeEventCallback;

  /**
   * Called when mouse enters the space belonging to a node.
   *
   * {@link Tree.defaultProps.onNodeMouseOver | Default value}
   */
  onNodeMouseOver?: TreeNodeEventCallback;

  /**
   * Called when mouse leaves the space belonging to a node.
   *
   * {@link Tree.defaultProps.onNodeMouseOut | Default value}
   */
  onNodeMouseOut?: TreeNodeEventCallback;

  /**
   * Called when a link is clicked.
   *
   * {@link Tree.defaultProps.onLinkClick | Default value}
   */
  onLinkClick?: TreeLinkEventCallback;

  /**
   * Called when mouse enters the space belonging to a link.
   *
   * {@link Tree.defaultProps.onLinkMouseOver | Default value}
   */
  onLinkMouseOver?: TreeLinkEventCallback;

  /**
   * Called when mouse leaves the space belonging to a link.
   *
   * {@link Tree.defaultProps.onLinkMouseOut | Default value}
   */
  onLinkMouseOut?: TreeLinkEventCallback;

  /**
   * Called with the new zoom transform on every zoom or pan tick and after every programmatic
   * transform (`centerNode`, `setTransform`, centering on click). Nothing fires on mount;
   * `getTransform` on the ref handle reads the current transform.
   */
  onTransformChange?: (transform: TreeTransform) => void;

  /**
   * Determines along which axis the tree is oriented.
   *
   * `horizontal` - Tree expands along x-axis (left-to-right).
   *
   * `vertical` - Tree expands along y-axis (top-to-bottom).
   *
   * Additionally, passing a negative value to {@link TreeProps.depthFactor | depthFactor} will
   * invert the tree's direction (i.e. right-to-left, bottom-to-top).
   *
   * {@link Tree.defaultProps.orientation | Default value}
   */
  orientation?: Orientation;

  /**
   * Translates the graph along the x/y axis by the specified amount of pixels.
   *
   * By default, the graph will render in the top-left corner of the SVG canvas.
   *
   * {@link Tree.defaultProps.translate | Default value}
   */
  translate?: Point;

  /**
   * Centers a node in the container when it is clicked. The tree measures its container
   * itself, so nothing else is needed. Off by default. `centerNode` on the ref handle centers a
   * node at any other time.
   */
  centerOnClick?: boolean;

  /**
   * The duration (in milliseconds) of the animation that centers a node. 0 applies the change
   * at once.
   *
   * @default 800
   */
  centeringTransitionDuration?: number;

  /**
   * The draw function (or `d`) used to render `path`/`link` elements. Accepts a predefined
   * `PathFunctionOption` or a user-defined `PathFunction`.
   *
   * See the `PathFunction` type for more information.
   *
   * For details on draw functions, see: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
   *
   * {@link Tree.defaultProps.pathFunc | Default value}
   */
  pathFunc?: PathFunctionOption | PathFunction;

  /**
   * Allows for additional className(s) to be passed to links.
   *
   * Each link calls `pathClassFunc` with its own `TreeLinkDatum` and the tree's current `orientation`.
   * Expects a `className` string to be returned.
   *
   * See the `PathClassFunction` type for more information.
   *
   * {@link Tree.defaultProps.pathClassFunc | Default value}
   */
  pathClassFunc?: PathClassFunction;

  /**
   * Determines the spacing between parent & child nodes.
   *
   * **Tip: Negative values invert the tree's direction.**
   *
   * `node.y = node.depth * depthFactor`
   *
   * Example: `depthFactor: 0` renders all nodes on the same height (since node.y === 0 for all).
   *
   * {@link Tree.defaultProps.depthFactor | Default value}
   */
  depthFactor?: number;

  /**
   * Determines whether the tree's nodes can collapse/expand.
   *
   * {@link Tree.defaultProps.collapsible | Default value}
   */
  collapsible?: boolean;

  /**
   * The depth at and below which nodes start collapsed. Without it, the tree renders to full
   * depth. The rule applies when the tree first sees a node: at mount, and for nodes that a
   * `data` update introduces. Ignored when `collapsed` is set.
   */
  initialDepth?: number;

  /**
   * The ids of the collapsed nodes, when the caller owns the collapse state. The tree renders
   * exactly this set and reports every requested change through `onCollapsedChange` without
   * changing anything itself. Only nodes with children collapse: a leaf's id in the set has no
   * effect, and the tree never reports one.
   *
   * Without it, the tree owns the state: it seeds the state from `initialDepth`, keeps it
   * across `data` updates for the ids that survive them, and applies the `initialDepth` rule to
   * ids that are new. To reset it for a new dataset, remount the tree with a `key`.
   */
  collapsed?: Iterable<string>;

  /**
   * Called with the next collapsed set and the change that asked for it whenever a click asks
   * for a toggle (or, with `shouldCollapseNeighborNodes`, for the neighbours to collapse as
   * well). `change` is `null` for a wholesale change. In uncontrolled mode the tree applies the
   * change itself as well.
   */
  onCollapsedChange?: (collapsed: Set<string>, change: CollapsedChange | null) => void;

  /**
   * Toggles ability to zoom in/out on the Tree by scaling it according to `scaleExtent`.
   *
   * {@link Tree.defaultProps.zoomable | Default value}
   */
  zoomable?: boolean;

  /**
   * Toggles ability to drag the Tree.
   *
   * {@link Tree.defaultProps.draggable | Default value}
   */
  draggable?: boolean;

  /**
   * A floating point number to set the initial zoom level. It is constrained by `scaleExtent`.
   *
   * {@link Tree.defaultProps.zoom | Default value}
   */
  zoom?: number;

  /**
   * Sets the minimum/maximum extent to which the tree can be scaled if `zoomable` is true.
   *
   * {@link Tree.defaultProps.scaleExtent | Default value}
   */
  scaleExtent?: {
    min?: number;
    max?: number;
  };

  /**
   * The amount of space each node element occupies.
   *
   * {@link Tree.defaultProps.nodeSize | Default value}
   */
  nodeSize?: {
    x: number;
    y: number;
  };

  /**
   * Sets separation between neighboring nodes, differentiating between siblings (same parent node)
   * and non-siblings.
   *
   * {@link Tree.defaultProps.separation | Default value}
   */
  separation?: {
    siblings?: number;
    nonSiblings?: number;
  };

  /**
   * If a node is currently being expanded, all other nodes at the same depth will be collapsed.
   *
   * {@link Tree.defaultProps.shouldCollapseNeighborNodes | Default value}
   */
  shouldCollapseNeighborNodes?: boolean;

  /**
   * Allows for additional className(s) to be passed to the `svg` element wrapping the tree.
   *
   * {@link Tree.defaultProps.svgClassName | Default value}
   */
  svgClassName?: string;

  /**
   * Allows for additional className(s) to be passed to the root node.
   *
   * {@link Tree.defaultProps.rootNodeClassName | Default value}
   */
  rootNodeClassName?: string;

  /**
   * Allows for additional className(s) to be passed to all branch nodes (nodes with children).
   *
   * {@link Tree.defaultProps.branchNodeClassName | Default value}
   */
  branchNodeClassName?: string;

  /**
   * Allows for additional className(s) to be passed to all leaf nodes (nodes without children).
   *
   * {@link Tree.defaultProps.leafNodeClassName | Default value}
   */
  leafNodeClassName?: string;

  /**
   * Disables drag/pan/zoom D3 events when hovering over a node.
   * Useful for cases where D3 events interfere when interacting with inputs or other interactive elements on a node.
   *
   * **Tip:** Holding the `Shift` key while hovering over a node re-enables the D3 events.
   *
   * {@link Tree.defaultProps.hasInteractiveNodes | Default value}
   */
  hasInteractiveNodes?: boolean;
}
