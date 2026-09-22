import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactElement } from 'react';
import { tree as d3tree, hierarchy, HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import type { D3ZoomEvent, ZoomBehavior } from 'd3-zoom';
// Registers `selection.transition()`, which animated transforms use.
import 'd3-transition';
import clone from 'clone';

import Node from '../Node/index.js';
import Link from '../Link/index.js';
import { TreeNodeDatum, Point, RawNodeDatum } from '../types/common.js';
import {
  CollapsedChange,
  TreeHandle,
  TreeLinkEventCallback,
  TreeNodeEventCallback,
  TreeProps,
  TreeTransform,
} from './types.js';
import globalCss from '../globalCss.js';
import { warnOnce } from '../warn.js';

const DEFAULT_TRANSLATE: Point = { x: 0, y: 0 };
const DEFAULT_SCALE_EXTENT = { min: 0.1, max: 1 };
const DEFAULT_NODE_SIZE = { x: 140, y: 140 };
const DEFAULT_SEPARATION = { siblings: 1, nonSiblings: 2 };

type Geometry = { translate: Point; scale: number };

/** `data` with every id filled in, plus lookups by id. Built once per `data` reference. */
type InternalTree = {
  root: TreeNodeDatum;
  nodeById: Map<string, TreeNodeDatum>;
  depthById: Map<string, number>;
};

type LayoutOptions = {
  orientation: 'horizontal' | 'vertical';
  nodeSize: { x: number; y: number };
  separation: { siblings: number; nonSiblings: number };
  depthFactor: number | undefined;
};

type Layout = {
  nodes: HierarchyPointNode<TreeNodeDatum>[];
  links: { source: HierarchyPointNode<TreeNodeDatum>; target: HierarchyPointNode<TreeNodeDatum> }[];
};

/**
 * Copies `data` node by node, giving every node an id. A node without one gets its path: the
 * root is `"0"`, its children `"0.0"`, `"0.1"`, and so on. The caller's objects are left as
 * they are; `attributes` are shared by reference.
 */
function buildInternalTree(data: RawNodeDatum): InternalTree {
  const nodeById = new Map<string, TreeNodeDatum>();
  const depthById = new Map<string, number>();
  const visit = (node: RawNodeDatum, path: string, depth: number): TreeNodeDatum => {
    const id = node.id ?? path;
    if (nodeById.has(id)) {
      warnOnce(`two nodes share the id "${id}"; collapse state and keys need unique ids.`);
    }
    const { children, ...rest } = node;
    const copy: TreeNodeDatum = { ...rest, id };
    if (children && children.length > 0) {
      copy.children = children.map((child, index) => visit(child, `${id}.${index}`, depth + 1));
    } else if (children) {
      copy.children = [];
    }
    nodeById.set(id, copy);
    depthById.set(id, depth);
    return copy;
  };
  return { root: visit(data, '0', 0), nodeById, depthById };
}

/** The ids at `depth` or deeper: what `initialDepth` collapses. */
function idsFromDepth(tree: InternalTree, depth: number): string[] {
  const ids: string[] = [];
  for (const [id, nodeDepth] of tree.depthById) {
    if (nodeDepth >= depth) ids.push(id);
  }
  return ids;
}

/** Adds `node` and everything below it to `into`. */
function collapseSubtree(node: TreeNodeDatum, into: Set<string>) {
  into.add(node.id);
  node.children?.forEach(child => collapseSubtree(child, into));
}

/**
 * The initial transform: `zoom` clamped to `scaleExtent`, because the first render writes it
 * as an attribute instead of going through d3's zoom, which would clamp it itself.
 */
function calculateGeometry(zoom: number, min: number, max: number, translate: Point): Geometry {
  let scale = zoom;
  if (zoom > max) {
    scale = max;
  } else if (zoom < min) {
    scale = min;
  }
  return { translate, scale };
}

/** Lays out the tree from `root`, hiding the children of collapsed nodes. */
function generateTree(root: TreeNodeDatum, collapsed: Set<string>, options: LayoutOptions): Layout {
  const { orientation, nodeSize, separation, depthFactor } = options;
  const tree = d3tree<TreeNodeDatum>()
    .nodeSize(orientation === 'horizontal' ? [nodeSize.y, nodeSize.x] : [nodeSize.x, nodeSize.y])
    .separation((a, b) =>
      a.parent?.data.id === b.parent?.data.id ? separation.siblings : separation.nonSiblings
    );

  const rootNode = tree(hierarchy(root, d => (collapsed.has(d.id) ? null : d.children)));
  const nodes = rootNode.descendants();
  const links = rootNode.links();

  if (depthFactor !== undefined) {
    nodes.forEach(node => {
      node.y = node.depth * depthFactor;
    });
  }

  return { nodes, links };
}

const Tree = forwardRef<TreeHandle, TreeProps>(function Tree(props, ref): ReactElement {
  const {
    data,
    orientation = 'horizontal',
    translate = DEFAULT_TRANSLATE,
    pathFunc = 'diagonal',
    pathClassFunc,
    depthFactor,
    collapsible = true,
    initialDepth,
    collapsed,
    onCollapsedChange,
    zoomable = true,
    draggable = true,
    zoom = 1,
    scaleExtent = DEFAULT_SCALE_EXTENT,
    nodeSize = DEFAULT_NODE_SIZE,
    separation = DEFAULT_SEPARATION,
    shouldCollapseNeighborNodes = false,
    svgClassName = '',
    rootNodeClassName = '',
    branchNodeClassName = '',
    leafNodeClassName = '',
    renderCustomNodeElement,
    hasInteractiveNodes = false,
    centerOnClick = false,
    centeringTransitionDuration = 800,
    onNodeClick,
    onNodeMouseOver,
    onNodeMouseOut,
    onLinkClick,
    onLinkMouseOver,
    onLinkMouseOut,
    onUpdate,
  } = props;
  // Primitives from the object props, so effects and memos depend on values, not identities:
  // a fresh `{ x: 0, y: 0 }` literal on every render must not rebind zoom. A partial
  // `scaleExtent` or `separation` takes the default for the missing key.
  const { x: translateX, y: translateY } = translate;
  const { min: scaleMin = DEFAULT_SCALE_EXTENT.min, max: scaleMax = DEFAULT_SCALE_EXTENT.max } =
    scaleExtent;
  const { x: nodeSizeX, y: nodeSizeY } = nodeSize;
  const {
    siblings: siblingSeparation = DEFAULT_SEPARATION.siblings,
    nonSiblings: nonSiblingSeparation = DEFAULT_SEPARATION.nonSiblings,
  } = separation;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  // The zoom behaviour bound to the svg; programmatic transforms go through it so they report
  // like user zooms.
  const behaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  // The container size, measured on mount and on every resize. A ref, because nothing
  // re-renders on resize; centering reads it at call time.
  const sizeRef = useRef({ width: 0, height: 0 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const measure = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current = { width: rect.width, height: rect.height };
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const tree = useMemo(() => buildInternalTree(data), [data]);

  // Collapse state: the caller's set when `collapsed` is given, otherwise the tree's own.
  const controlledCollapsed = useMemo(
    () => (collapsed === undefined ? undefined : new Set(collapsed)),
    [collapsed]
  );
  const [ownCollapsed, setOwnCollapsed] = useState(
    () => new Set(initialDepth === undefined ? [] : idsFromDepth(tree, initialDepth))
  );
  // A `data` update keeps the state of the ids that survive it, applies the `initialDepth` rule
  // to ids that are new, and drops ids that left.
  const [seenTree, setSeenTree] = useState(tree);
  if (tree !== seenTree) {
    setSeenTree(tree);
    setOwnCollapsed(previous => {
      const next = new Set<string>();
      for (const [id, depth] of tree.depthById) {
        const keep = seenTree.depthById.has(id)
          ? previous.has(id)
          : initialDepth !== undefined && depth >= initialDepth;
        if (keep) next.add(id);
      }
      return next;
    });
  }
  const effectiveCollapsed = controlledCollapsed ?? ownCollapsed;

  const geometry = useMemo(
    () => calculateGeometry(zoom, scaleMin, scaleMax, { x: translateX, y: translateY }),
    [zoom, scaleMin, scaleMax, translateX, translateY]
  );
  // The live transform: d3 owns the `g` attribute after mount, so React never re-renders it.
  const transformRef = useRef<Geometry>(geometry);

  const layout = useMemo(
    () =>
      generateTree(tree.root, effectiveCollapsed, {
        orientation,
        nodeSize: { x: nodeSizeX, y: nodeSizeY },
        separation: { siblings: siblingSeparation, nonSiblings: nonSiblingSeparation },
        depthFactor,
      }),
    [
      tree,
      effectiveCollapsed,
      orientation,
      nodeSizeX,
      nodeSizeY,
      siblingSeparation,
      nonSiblingSeparation,
      depthFactor,
    ]
  );

  // The latest props and state, for the callbacks and d3 handlers that outlive the render they
  // were created in. React flushes this effect before it dispatches the next event.
  const latestValues = {
    tree,
    layout,
    collapsed: effectiveCollapsed,
    controlled: controlledCollapsed !== undefined,
    collapsible,
    shouldCollapseNeighborNodes,
    draggable,
    hasInteractiveNodes,
    centerOnClick,
    orientation,
    centeringTransitionDuration,
    onCollapsedChange,
    onNodeClick,
    onNodeMouseOver,
    onNodeMouseOut,
    onLinkClick,
    onLinkMouseOver,
    onLinkMouseOut,
    onUpdate,
  };
  const latest = useRef(latestValues);
  useEffect(() => {
    latest.current = latestValues;
  });

  // Binds d3's zoom to the svg. The initial transform goes through a listener-less behaviour
  // first, so setting it emits no zoom event and `onUpdate` sees no call.
  useEffect(() => {
    const svgElement = svgRef.current;
    const gElement = gRef.current;
    if (!svgElement || !gElement) return undefined;
    const svg = select(svgElement);
    const g = select(gElement);
    transformRef.current = geometry;

    svg.call(
      d3zoom<SVGSVGElement, unknown>().transform,
      zoomIdentity.translate(translateX, translateY).scale(zoom)
    );
    const behavior = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent(zoomable ? [scaleMin, scaleMax] : [zoom, zoom])
      .filter((event: any) => {
        if (latest.current.hasInteractiveNodes) {
          return event.target === svgRef.current || event.target === gRef.current || event.shiftKey;
        }
        return true;
      })
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        // A programmatic transform has no source event.
        const sourceType: string | undefined = event.sourceEvent?.type;
        if (
          !latest.current.draggable &&
          sourceType !== undefined &&
          ['mousemove', 'touchmove', 'dblclick'].includes(sourceType)
        ) {
          return;
        }
        g.attr('transform', event.transform.toString());
        const next = {
          translate: { x: event.transform.x, y: event.transform.y },
          scale: event.transform.k,
        };
        transformRef.current = next;
        const { onUpdate: report } = latest.current;
        if (typeof report === 'function') {
          // d3 emits "zoom" for pans as well, so this covers dragging too.
          report({ node: null, zoom: next.scale, translate: next.translate });
        }
      });
    svg.call(behavior);
    behaviorRef.current = behavior;

    return () => {
      svg.on('.zoom', null);
      behaviorRef.current = null;
    };
  }, [geometry, zoomable, draggable, zoom, scaleMin, scaleMax, translateX, translateY]);

  // Reports each change of the tree or its collapse state through `onUpdate`: once after mount
  // with no node, then with the toggled node after a toggle (or no node for new data).
  const lastToggledRef = useRef<TreeNodeDatum | null>(null);
  const reportedRef = useRef<{ tree: InternalTree; collapsed: Set<string> } | null>(null);
  useEffect(() => {
    const reported = reportedRef.current;
    if (reported && reported.tree === tree && reported.collapsed === effectiveCollapsed) return;
    reportedRef.current = { tree, collapsed: effectiveCollapsed };
    const node = lastToggledRef.current;
    lastToggledRef.current = null;
    const { onUpdate: report } = latest.current;
    if (typeof report === 'function') {
      report({
        node: node ? clone(node) : null,
        zoom: transformRef.current.scale,
        translate: transformRef.current.translate,
      });
    }
  }, [tree, effectiveCollapsed]);

  // Applies a collapse change: the tree's own state changes only in uncontrolled mode, and the
  // caller hears about every change in both modes.
  const commitCollapsed = useCallback((next: Set<string>, change: CollapsedChange | null) => {
    const { controlled, onCollapsedChange: report } = latest.current;
    if (!controlled) setOwnCollapsed(next);
    if (typeof report === 'function') report(next, change);
  }, []);

  const toggleNode = useCallback(
    (nodeId: string) => {
      const {
        tree: currentTree,
        collapsed: current,
        shouldCollapseNeighborNodes: collapseNeighbors,
      } = latest.current;
      const node = currentTree.nodeById.get(nodeId);
      if (!node) return;

      const next = new Set(current);
      let change: CollapsedChange;
      if (current.has(nodeId)) {
        next.delete(nodeId);
        if (collapseNeighbors) {
          const depth = currentTree.depthById.get(nodeId);
          for (const [otherId, otherDepth] of currentTree.depthById) {
            const neighbor = currentTree.nodeById.get(otherId);
            if (otherDepth === depth && otherId !== nodeId && neighbor) {
              collapseSubtree(neighbor, next);
            }
          }
        }
        change = { id: nodeId, collapsed: false };
      } else {
        // Collapsing hides the whole subtree; re-expanding later shows one level at a time.
        collapseSubtree(node, next);
        change = { id: nodeId, collapsed: true };
      }
      lastToggledRef.current = node;
      commitCollapsed(next, change);
    },
    [commitCollapsed]
  );

  // Sets the zoom transform through the bound behaviour, at once or over `duration` ms.
  const applyTransform = useCallback((transform: TreeTransform, duration: number) => {
    const svgElement = svgRef.current;
    const behavior = behaviorRef.current;
    if (!svgElement || !behavior) return;
    const target = zoomIdentity.translate(transform.x, transform.y).scale(transform.k);
    const svg = select(svgElement);
    if (duration > 0) {
      behavior.transform(svg.transition().duration(duration), target);
    } else {
      behavior.transform(svg, target);
    }
  }, []);

  /**
   * Centers the node with `nodeId` in the container.
   * Adapted from Rob Schmuecker's centerNode: http://bl.ocks.org/robschmuecker/7880033
   */
  const centerNode = useCallback(
    (nodeId: string, options?: { duration?: number }) => {
      const {
        layout: currentLayout,
        orientation: axis,
        centeringTransitionDuration: defaultDuration,
      } = latest.current;
      const node = currentLayout.nodes.find(candidate => candidate.data.id === nodeId);
      if (!node) return;
      const size = sizeRef.current;
      const scale = transformRef.current.scale;
      // A horizontal tree swaps the layout axes on screen.
      const [screenX, screenY] = axis === 'horizontal' ? [node.y, node.x] : [node.x, node.y];
      applyTransform(
        {
          x: -screenX * scale + size.width / 2,
          y: -screenY * scale + size.height / 2,
          k: scale,
        },
        options?.duration ?? defaultDuration
      );
    },
    [applyTransform]
  );

  // With `centerOnClick`, a click on a node centers it once the layout that follows the click is
  // in place. The ref holds the node; the counter makes the effect run even when the layout
  // doesn't change.
  const centerRequestRef = useRef<string | null>(null);
  const [centerRequestCount, setCenterRequestCount] = useState(0);
  const requestCenter = useCallback((nodeId: string) => {
    if (!latest.current.centerOnClick) return;
    centerRequestRef.current = nodeId;
    setCenterRequestCount(count => count + 1);
  }, []);
  useEffect(() => {
    const nodeId = centerRequestRef.current;
    if (nodeId === null) return;
    centerRequestRef.current = null;
    centerNode(nodeId);
  }, [layout, centerRequestCount, centerNode]);

  useImperativeHandle(
    ref,
    () => ({
      centerNode,
      toggleNode,
      expandAll: () => commitCollapsed(new Set(), null),
      collapseAll: () => commitCollapsed(new Set(idsFromDepth(latest.current.tree, 0)), null),
      expandToDepth: depth =>
        commitCollapsed(new Set(idsFromDepth(latest.current.tree, depth)), null),
      setTransform: (transform, options) => applyTransform(transform, options?.duration ?? 0),
      getTransform: () => ({
        x: transformRef.current.translate.x,
        y: transformRef.current.translate.y,
        k: transformRef.current.scale,
      }),
    }),
    [centerNode, toggleNode, commitCollapsed, applyTransform]
  );

  const handleNodeToggle = useCallback(
    (nodeId: string) => {
      requestCenter(nodeId);
      if (!latest.current.collapsible) return;
      toggleNode(nodeId);
    },
    [requestCenter, toggleNode]
  );

  const handleOnNodeClickCb = useCallback<TreeNodeEventCallback>(
    (hierarchyPointNode, evt) => {
      requestCenter(hierarchyPointNode.data.id);
      const { onNodeClick: handler } = latest.current;
      if (typeof handler === 'function') {
        evt.persist();
        handler(clone(hierarchyPointNode), evt);
      }
    },
    [requestCenter]
  );

  const handleOnNodeMouseOverCb = useCallback<TreeNodeEventCallback>((hierarchyPointNode, evt) => {
    const { onNodeMouseOver: handler } = latest.current;
    if (typeof handler === 'function') {
      evt.persist();
      handler(clone(hierarchyPointNode), evt);
    }
  }, []);

  const handleOnNodeMouseOutCb = useCallback<TreeNodeEventCallback>((hierarchyPointNode, evt) => {
    const { onNodeMouseOut: handler } = latest.current;
    if (typeof handler === 'function') {
      evt.persist();
      handler(clone(hierarchyPointNode), evt);
    }
  }, []);

  const handleOnLinkClickCb = useCallback<TreeLinkEventCallback>((source, target, evt) => {
    const { onLinkClick: handler } = latest.current;
    if (typeof handler === 'function') {
      evt.persist();
      handler(clone(source), clone(target), evt);
    }
  }, []);

  const handleOnLinkMouseOverCb = useCallback<TreeLinkEventCallback>((source, target, evt) => {
    const { onLinkMouseOver: handler } = latest.current;
    if (typeof handler === 'function') {
      evt.persist();
      handler(clone(source), clone(target), evt);
    }
  }, []);

  const handleOnLinkMouseOutCb = useCallback<TreeLinkEventCallback>((source, target, evt) => {
    const { onLinkMouseOut: handler } = latest.current;
    if (typeof handler === 'function') {
      evt.persist();
      handler(clone(source), clone(target), evt);
    }
  }, []);

  const getNodeClassName = (
    parent: HierarchyPointNode<TreeNodeDatum> | null,
    nodeDatum: TreeNodeDatum
  ) => {
    if (parent) {
      return nodeDatum.children ? branchNodeClassName : leafNodeClassName;
    }
    return rootNodeClassName;
  };

  return (
    <div ref={containerRef} className="rd3t-tree-container rd3t-grabbable">
      <style>{globalCss}</style>
      <svg
        ref={svgRef}
        className={['rd3t-svg', svgClassName].filter(Boolean).join(' ')}
        width="100%"
        height="100%"
      >
        <g
          ref={gRef}
          className="rd3t-g"
          transform={`translate(${geometry.translate.x},${geometry.translate.y}) scale(${geometry.scale})`}
        >
          {layout.links.map(linkData => (
            <Link
              key={linkData.target.data.id}
              orientation={orientation}
              pathFunc={pathFunc}
              pathClassFunc={pathClassFunc}
              linkData={linkData}
              onClick={handleOnLinkClickCb}
              onMouseOver={handleOnLinkMouseOverCb}
              onMouseOut={handleOnLinkMouseOutCb}
            />
          ))}

          {layout.nodes.map(hierarchyPointNode => {
            const { data: nodeDatum, x, y, parent } = hierarchyPointNode;
            return (
              <Node
                key={nodeDatum.id}
                data={nodeDatum}
                position={{ x, y }}
                hierarchyPointNode={hierarchyPointNode}
                nodeClassName={getNodeClassName(parent, nodeDatum)}
                renderCustomNodeElement={renderCustomNodeElement}
                orientation={orientation}
                onNodeToggle={handleNodeToggle}
                onNodeClick={handleOnNodeClickCb}
                onNodeMouseOver={handleOnNodeMouseOverCb}
                onNodeMouseOut={handleOnNodeMouseOutCb}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
});

export default Tree;
