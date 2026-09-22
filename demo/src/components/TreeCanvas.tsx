import { Component, useEffect, useRef, type ReactNode } from 'react';
import Tree, { type TreeProps } from 'react-d3-tree';
import type { Dataset } from '../data/datasets.js';
import type { RenderNode } from '../nodes/renderers.jsx';
import type { PlaygroundState, Point } from '../state/playground.js';

export interface Size {
  width: number;
  height: number;
}

interface BoundaryProps {
  onReset: () => void;
  children: ReactNode;
}

/** Keeps a throwing `Tree` from taking the inspector down with it. */
class TreeBoundary extends Component<BoundaryProps, { error: string | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  render() {
    if (this.state.error === null) return this.props.children;
    return (
      <div className="canvas__error" role="alert">
        <p>
          The tree stopped rendering: <code>{this.state.error}</code>
        </p>
        <button
          type="button"
          onClick={() => {
            this.setState({ error: null });
            this.props.onReset();
          }}
        >
          Reset the playground
        </button>
      </div>
    );
  }
}

export interface LiveTransform {
  zoom: number;
  translate: Point;
}

interface TreeCanvasProps {
  state: PlaygroundState;
  dataset: Dataset;
  size: Size | null;
  translate: Point;
  renderNode: RenderNode | undefined;
  live: LiveTransform | null;
  onSize: (size: Size) => void;
  onUpdate: (live: LiveTransform) => void;
  onReset: () => void;
}

export function TreeCanvas({
  state,
  dataset,
  size,
  translate,
  renderNode,
  live,
  onSize,
  onUpdate,
  onReset,
}: TreeCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      onSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onSize]);

  const treeProps: TreeProps = {
    data: dataset.data,
    orientation: state.orientation,
    translate,
    dimensions: state.centerOnClick && size ? size : undefined,
    centeringTransitionDuration: state.centeringTransitionDuration,
    pathFunc: state.pathFunc,
    depthFactor: state.depthFactor ?? undefined,
    collapsible: state.collapsible,
    initialDepth: state.initialDepth ?? undefined,
    zoomable: state.zoomable,
    draggable: state.draggable,
    zoom: state.zoom,
    scaleExtent: state.scaleExtent,
    nodeSize: state.nodeSize,
    separation: state.separation,
    shouldCollapseNeighborNodes: state.shouldCollapseNeighborNodes,
    enableLegacyTransitions: state.enableLegacyTransitions,
    transitionDuration: state.transitionDuration,
    hasInteractiveNodes: state.hasInteractiveNodes,
    renderCustomNodeElement: renderNode,
    svgClassName: 'playground__svg',
    onUpdate: ({ zoom, translate: t }) => onUpdate({ zoom, translate: t }),
  };

  const shown = live ?? { zoom: state.zoom, translate };

  return (
    <main className="canvas" ref={ref}>
      {size && (
        <TreeBoundary onReset={onReset}>
          <Tree {...treeProps} />
        </TreeBoundary>
      )}
      <div className="status" aria-live="off">
        <span>
          <b>{dataset.nodeCount.toLocaleString()}</b> nodes
        </span>
        <span>
          zoom <b>{shown.zoom.toFixed(2)}</b>
        </span>
        <span>
          translate <b>{Math.round(shown.translate.x)}</b>, <b>{Math.round(shown.translate.y)}</b>
        </span>
      </div>
    </main>
  );
}
