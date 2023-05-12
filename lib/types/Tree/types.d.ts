import { HierarchyPointNode } from 'd3-hierarchy';
import { SyntheticEvent } from 'react';
import { Orientation, PathClassFunction, PathFunction, PathFunctionOption, Point, RawNodeDatum, RenderCustomNodeElementFn, TreeNodeDatum } from '../types/common.js';
export type TreeNodeEventCallback = (node: HierarchyPointNode<TreeNodeDatum>, event: SyntheticEvent) => any;
export type TreeLinkEventCallback = (sourceNode: HierarchyPointNode<TreeNodeDatum>, targetNode: HierarchyPointNode<TreeNodeDatum>, event: SyntheticEvent) => any;
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
     * `react-d3-tree` will automatically attach a unique `id` attribute to each node in the DOM,
     * as well as `data-source-id` & `data-target-id` attributes to each link connecting two nodes.
     */
    data: RawNodeDatum[] | RawNodeDatum;
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
     * Called when the inner D3 component updates. That is - on every zoom or translate event,
     * or when tree branches are toggled.
     *
     * {@link Tree.defaultProps.onUpdate | Default value}
     */
    onUpdate?: (target: {
        node: TreeNodeDatum | null;
        zoom: number;
        translate: Point;
    }) => any;
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
     * Enables the centering of nodes on click by providing the dimensions of the tree container,
     * e.g. via {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect | `getBoundingClientRect()`}.
     *
     * If dimensions are given: node will center on click. If not, node will not center on click.
     */
    dimensions?: {
        width: number;
        height: number;
    };
    /**
     * Sets the time (in milliseconds) for the transition to center a node once clicked.
     *
     * {@link Tree.defaultProps.centeringTransitionDuration | Default value}
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
     * Sets the maximum node depth to which the tree is expanded on its initial render.
     *
     * By default, the tree renders to full depth.
     *
     * {@link Tree.defaultProps.initialDepth | Default value}
     */
    initialDepth?: number;
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
     * Enables/disables legacy transitions using `react-transition-group`.
     *
     * **Note:** This flag is considered legacy and **usage is discouraged for large trees**,
     * as responsiveness may suffer.
     *
     * `enableLegacyTransitions` will be deprecated once a suitable
     * replacement for transitions has been found.
     *
     * {@link Tree.defaultProps.enableLegacyTransitions | Default value}
     */
    enableLegacyTransitions?: boolean;
    /**
     * Sets the animation duration (in milliseconds) of each expansion/collapse of a tree node.
     * Requires `enableLegacyTransition` to be `true`.
     *
     * {@link Tree.defaultProps.transitionDuration | Default value}
     */
    transitionDuration?: number;
    /**
     * Disables drag/pan/zoom D3 events when hovering over a node.
     * Useful for cases where D3 events interfere when interacting with inputs or other interactive elements on a node.
     *
     * **Tip:** Holding the `Shift` key while hovering over a node re-enables the D3 events.
     *
     * {@link Tree.defaultProps.hasInteractiveNodes | Default value}
     */
    hasInteractiveNodes?: boolean;
    /**
     * Indicates the tree being represented by the data. If the dataKey changes, then we should re-render the tree.
     * If the data changes but the dataKey keeps being the same, then it's a change (like adding children to a node) for the same tree,
     * so we shouldn't re-render the tree.
     *
     * {@link Tree.defaultProps.dataKey | Default value}
     */
    dataKey?: string;
}
