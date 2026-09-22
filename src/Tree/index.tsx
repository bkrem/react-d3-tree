import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tree as d3tree, hierarchy, HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import type { D3ZoomEvent } from 'd3-zoom';
// Registers `selection.transition()`, which `centerNode` uses.
import 'd3-transition';
import clone from 'clone';

import Node from '../Node/index.js';
import Link from '../Link/index.js';
import { TreeNodeDatum, Point, RawNodeDatum } from '../types/common.js';
import { TreeLinkEventCallback, TreeNodeEventCallback, TreeProps } from './types.js';
import globalCss from '../globalCss.js';
import generateId from '../generateId.js';

const DEFAULT_TRANSLATE: Point = { x: 0, y: 0 };
const DEFAULT_SCALE_EXTENT = { min: 0.1, max: 1 };
const DEFAULT_NODE_SIZE = { x: 140, y: 140 };
const DEFAULT_SEPARATION = { siblings: 1, nonSiblings: 2 };

type Geometry = { translate: Point; scale: number };

// The internal copy of `data`, stamped with `__rd3t`, plus what it was derived from.
type InternalData = {
  source: TreeProps['data'];
  dataKey: string | undefined;
  data: TreeNodeDatum[];
};

type LayoutOptions = {
  orientation: TreeProps['orientation'];
  nodeSize: TreeProps['nodeSize'];
  separation: TreeProps['separation'];
  depthFactor: TreeProps['depthFactor'];
};

/**
 * Wraps a single root in an array and stamps every node with the internal id, depth, and
 * collapsed state the tree needs. Mutates and returns `data`; callers pass a clone.
 * With `initialDepth`, nodes at that depth and below start collapsed.
 */
function assignInternalProperties(
  data: RawNodeDatum | RawNodeDatum[],
  currentDepth = 0,
  initialDepth?: number
): TreeNodeDatum[] {
  const nodes = Array.isArray(data) ? data : [data];
  return nodes.map(n => {
    const nodeDatum = n as TreeNodeDatum;
    nodeDatum.__rd3t = {
      id: generateId(),
      depth: currentDepth,
      collapsed: initialDepth !== undefined && currentDepth >= initialDepth,
    };
    if (nodeDatum.children && nodeDatum.children.length > 0) {
      nodeDatum.children = assignInternalProperties(
        nodeDatum.children,
        currentDepth + 1,
        initialDepth
      );
    }
    return nodeDatum;
  });
}

function buildInternalData(data: TreeProps['data'], initialDepth?: number): TreeNodeDatum[] {
  return assignInternalProperties(clone(data), 0, initialDepth);
}

/** Walks the nested `nodeSet` until a node matching `nodeId` is found. */
function findNodeById(nodeId: string, nodeSet: TreeNodeDatum[]): TreeNodeDatum | undefined {
  for (const node of nodeSet) {
    if (node.__rd3t.id === nodeId) return node;
    if (node.children && node.children.length > 0) {
      const hit = findNodeById(nodeId, node.children);
      if (hit) return hit;
    }
  }
  return undefined;
}

/** Collects every node in the nested `nodeSet` at `depth`. */
function findNodesAtDepth(depth: number, nodeSet: TreeNodeDatum[]): TreeNodeDatum[] {
  const hits: TreeNodeDatum[] = [];
  for (const node of nodeSet) {
    if (node.__rd3t.depth === depth) hits.push(node);
    if (node.children && node.children.length > 0) {
      hits.push(...findNodesAtDepth(depth, node.children));
    }
  }
  return hits;
}

/** Collapses `nodeDatum` and every node below it. */
function collapseNode(nodeDatum: TreeNodeDatum) {
  nodeDatum.__rd3t.collapsed = true;
  if (nodeDatum.children && nodeDatum.children.length > 0) {
    nodeDatum.children.forEach(collapseNode);
  }
}

function expandNode(nodeDatum: TreeNodeDatum) {
  nodeDatum.__rd3t.collapsed = false;
}

/** Collapses every node at the same depth as `targetNode`, except `targetNode` itself. */
function collapseNeighborNodes(targetNode: TreeNodeDatum, nodeSet: TreeNodeDatum[]) {
  findNodesAtDepth(targetNode.__rd3t.depth, nodeSet)
    .filter(node => node.__rd3t.id !== targetNode.__rd3t.id)
    .forEach(collapseNode);
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

/** Lays out the tree from the root of `data`, honouring collapsed nodes and `depthFactor`. */
function generateTree(data: TreeNodeDatum[], options: LayoutOptions) {
  const { orientation, nodeSize, separation, depthFactor } = options;
  const tree = d3tree<TreeNodeDatum>()
    .nodeSize(orientation === 'horizontal' ? [nodeSize.y, nodeSize.x] : [nodeSize.x, nodeSize.y])
    .separation((a, b) =>
      a.parent.data.__rd3t.id === b.parent.data.__rd3t.id
        ? separation.siblings
        : separation.nonSiblings
    );

  const rootNode = tree(hierarchy(data[0], d => (d.__rd3t.collapsed ? null : d.children)));
  const nodes = rootNode.descendants();
  const links = rootNode.links();

  if (depthFactor !== undefined) {
    nodes.forEach(node => {
      node.y = node.depth * depthFactor;
    });
  }

  return { nodes, links };
}

function Tree(props: TreeProps) {
  const {
    data,
    orientation = 'horizontal',
    translate = DEFAULT_TRANSLATE,
    pathFunc = 'diagonal',
    pathClassFunc,
    depthFactor,
    collapsible = true,
    initialDepth,
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
    dimensions,
    centeringTransitionDuration = 800,
    dataKey,
    onNodeClick,
    onNodeMouseOver,
    onNodeMouseOut,
    onLinkClick,
    onLinkMouseOver,
    onLinkMouseOut,
    onUpdate,
  } = props;
  // Primitives from the object props, so effects and memos depend on values, not identities:
  // a fresh `{ x: 0, y: 0 }` literal on every render must not rebind zoom.
  const { x: translateX, y: translateY } = translate;
  const { min: scaleMin, max: scaleMax } = scaleExtent;
  const { x: nodeSizeX, y: nodeSizeY } = nodeSize;
  const { siblings: siblingSeparation, nonSiblings: nonSiblingSeparation } = separation;

  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  // The latest props, for the callbacks and d3 handlers that outlive the render they were
  // created in. React flushes this effect before it dispatches the next event.
  const latestProps = {
    collapsible,
    shouldCollapseNeighborNodes,
    draggable,
    hasInteractiveNodes,
    dimensions,
    orientation,
    zoom,
    centeringTransitionDuration,
    onNodeClick,
    onNodeMouseOver,
    onNodeMouseOut,
    onLinkClick,
    onLinkMouseOver,
    onLinkMouseOut,
    onUpdate,
  };
  const latest = useRef(latestProps);
  useEffect(() => {
    latest.current = latestProps;
  });

  // The internal tree is state because toggles and `addChildren` change it. A new `data`
  // reference replaces it, unless `dataKey` is set and unchanged.
  const [internal, setInternal] = useState<InternalData>(() => ({
    source: data,
    dataKey,
    data: buildInternalData(data, initialDepth),
  }));
  let current = internal;
  if (data !== internal.source && (!dataKey || dataKey !== internal.dataKey)) {
    current = { source: data, dataKey, data: buildInternalData(data, initialDepth) };
    setInternal(current);
  }

  const geometry = useMemo(
    () => calculateGeometry(zoom, scaleMin, scaleMax, { x: translateX, y: translateY }),
    [zoom, scaleMin, scaleMax, translateX, translateY]
  );
  // The live transform: d3 owns the `g` attribute after mount, so React never re-renders it.
  const transformRef = useRef<Geometry>(geometry);

  const layout = useMemo(
    () =>
      generateTree(current.data, {
        orientation,
        nodeSize: { x: nodeSizeX, y: nodeSizeY },
        separation: { siblings: siblingSeparation, nonSiblings: nonSiblingSeparation },
        depthFactor,
      }),
    [
      current.data,
      orientation,
      nodeSizeX,
      nodeSizeY,
      siblingSeparation,
      nonSiblingSeparation,
      depthFactor,
    ]
  );

  // Binds d3's zoom to the svg. The initial transform goes through a listener-less behaviour
  // first, so setting it emits no zoom event and `onUpdate` sees no call.
  useEffect(() => {
    const svg = select(svgRef.current);
    const g = select(gRef.current);
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
        if (
          !latest.current.draggable &&
          ['mousemove', 'touchmove', 'dblclick'].includes(event.sourceEvent.type)
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

    return () => {
      svg.on('.zoom', null);
    };
  }, [geometry, zoomable, draggable, zoom, scaleMin, scaleMax, translateX, translateY]);

  // Reports each change of the internal tree through `onUpdate`: once after mount with no node,
  // then once per toggle with the toggled node (or no node for `addChildren` and new data).
  const lastToggledRef = useRef<TreeNodeDatum | null>(null);
  const reportedRef = useRef<TreeNodeDatum[] | null>(null);
  useEffect(() => {
    if (reportedRef.current === current.data) return;
    reportedRef.current = current.data;
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
  }, [current.data]);

  const handleNodeToggle = useCallback((nodeId: string) => {
    if (!latest.current.collapsible) return;
    setInternal(prev => {
      const nextData = clone(prev.data);
      const target = findNodeById(nodeId, nextData);
      if (!target) return prev;

      if (target.__rd3t.collapsed) {
        expandNode(target);
        if (latest.current.shouldCollapseNeighborNodes) collapseNeighborNodes(target, nextData);
      } else {
        collapseNode(target);
      }
      lastToggledRef.current = target;
      return { ...prev, data: nextData };
    });
  }, []);

  const handleAddChildrenToNode = useCallback((nodeId: string, childrenData: RawNodeDatum[]) => {
    setInternal(prev => {
      const nextData = clone(prev.data);
      const target = findNodeById(nodeId, nextData);
      if (!target) return prev;

      const depth = target.__rd3t.depth;
      const formattedChildren = clone(childrenData).map(node =>
        assignInternalProperties([node], depth + 1)
      );
      target.children = target.children || [];
      target.children.push(...formattedChildren.flat());
      return { ...prev, data: nextData };
    });
  }, []);

  const handleOnNodeClickCb = useCallback<TreeNodeEventCallback>((hierarchyPointNode, evt) => {
    const { onNodeClick: handler } = latest.current;
    if (typeof handler === 'function') {
      evt.persist();
      handler(clone(hierarchyPointNode), evt);
    }
  }, []);

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

  /**
   * Centers `hierarchyPointNode` in the container when `dimensions` is set.
   * Adapted from Rob Schmuecker's centerNode: http://bl.ocks.org/robschmuecker/7880033
   */
  const centerNode = useCallback((hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>) => {
    const {
      dimensions: size,
      orientation: axis,
      zoom: level,
      centeringTransitionDuration: duration,
    } = latest.current;
    if (!size) return;
    const g = select(gRef.current);
    const svg = select(svgRef.current);
    const scale = transformRef.current.scale;

    let x: number;
    let y: number;
    // A horizontal tree swaps the layout axes on screen.
    if (axis === 'horizontal') {
      y = -hierarchyPointNode.x * scale + size.height / 2;
      x = -hierarchyPointNode.y * scale + size.width / 2;
    } else {
      x = -hierarchyPointNode.x * scale + size.width / 2;
      y = -hierarchyPointNode.y * scale + size.height / 2;
    }
    g.transition().duration(duration).attr('transform', `translate(${x},${y})scale(${scale})`);
    // Moves d3's viewport to the new center so the next drag or zoom starts from it.
    svg.call(d3zoom<SVGSVGElement, unknown>().transform, zoomIdentity.translate(x, y).scale(level));
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

  // Node re-renders when this object changes identity, which is every render.
  const subscriptions = { ...nodeSize, ...separation, depthFactor, initialDepth };

  return (
    <div className="rd3t-tree-container rd3t-grabbable">
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
          {layout.links.map((linkData, i) => (
            <Link
              key={`link-${i}`}
              orientation={orientation}
              pathFunc={pathFunc}
              pathClassFunc={pathClassFunc}
              linkData={linkData}
              onClick={handleOnLinkClickCb}
              onMouseOver={handleOnLinkMouseOverCb}
              onMouseOut={handleOnLinkMouseOutCb}
            />
          ))}

          {layout.nodes.map((hierarchyPointNode, i) => {
            const { data: nodeDatum, x, y, parent } = hierarchyPointNode;
            return (
              <Node
                key={`node-${i}`}
                data={nodeDatum}
                position={{ x, y }}
                hierarchyPointNode={hierarchyPointNode}
                parent={parent}
                nodeClassName={getNodeClassName(parent, nodeDatum)}
                renderCustomNodeElement={renderCustomNodeElement}
                nodeSize={nodeSize}
                orientation={orientation}
                onNodeToggle={handleNodeToggle}
                onNodeClick={handleOnNodeClickCb}
                onNodeMouseOver={handleOnNodeMouseOverCb}
                onNodeMouseOut={handleOnNodeMouseOutCb}
                handleAddChildrenToNode={handleAddChildrenToNode}
                subscriptions={subscriptions}
                centerNode={centerNode}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default Tree;
