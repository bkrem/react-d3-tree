import type { ReactElement } from 'react';
import type { CustomNodeElementProps, Orientation } from 'react-d3-tree';
import type { NodeRendererId, Point } from '../state/playground.js';

export interface RendererContext {
  orientation: Orientation;
  nodeSize: Point;
}

export type RenderNode = (props: CustomNodeElementProps) => ReactElement;

export interface NodeRenderer {
  id: NodeRendererId;
  label: string;
  /** Identifier the JSX snippet uses, or `null` for the library default. */
  identifier: string | null;
  /** Builds the render function for the current context, or `null` for the library default. */
  make: ((ctx: RendererContext) => RenderNode) | null;
}

// Labels sit to the right of the node when the tree grows downwards, and below it when the tree
// grows to the right, so they stay clear of the links.
const textLayout = {
  vertical: {
    title: { textAnchor: 'start', x: 40 },
    attributes: {},
    attribute: { x: 40, dy: '1.2em' },
  },
  horizontal: {
    title: { textAnchor: 'start', y: 40 },
    attributes: { x: 0, y: 40 },
    attribute: { x: 0, dy: '1.2em' },
  },
} as const;

function PureSvgNode({
  nodeDatum,
  toggleNode,
  onNodeClick,
  orientation,
}: CustomNodeElementProps & { orientation: Orientation }) {
  const layout = textLayout[orientation];
  return (
    <>
      <circle r={20} onClick={toggleNode} />
      <g className="rd3t-label">
        <text className="rd3t-label__title" {...layout.title} onClick={onNodeClick}>
          {nodeDatum.name}
        </text>
        <text className="rd3t-label__attributes" {...layout.attributes}>
          {nodeDatum.attributes &&
            Object.entries(nodeDatum.attributes).map(([key, value]) => (
              <tspan key={key} {...layout.attribute}>
                {key}: {String(value)}
              </tspan>
            ))}
        </text>
      </g>
    </>
  );
}

function NodeCard({
  nodeDatum,
  toggleNode,
  nodeSize,
  withInput = false,
}: CustomNodeElementProps & { nodeSize: Point; withInput?: boolean }) {
  const attributes = nodeDatum.attributes ? Object.entries(nodeDatum.attributes) : [];
  // The card hangs below the circle and stays inside the node's own slot.
  const top = 26;
  const height = Math.max(48, nodeSize.y - top - 8);
  return (
    <>
      <circle r={20} onClick={toggleNode} />
      <foreignObject width={nodeSize.x} height={height} x={-nodeSize.x / 2} y={top}>
        <div className="node-card">
          <h3 className="node-card__name">{nodeDatum.name}</h3>
          {attributes.length > 0 && (
            <dl className="node-card__attrs">
              {attributes.map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}
          {withInput && (
            <select
              className="node-card__select"
              aria-label={`Example input for ${nodeDatum.name}`}
            >
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
            </select>
          )}
          {nodeDatum.children && (
            <button type="button" className="node-card__toggle" onClick={toggleNode}>
              {nodeDatum.__rd3t.collapsed ? 'Expand' : 'Collapse'}
            </button>
          )}
        </div>
      </foreignObject>
    </>
  );
}

export const nodeRenderers: NodeRenderer[] = [
  {
    id: 'default',
    label: 'Library default',
    identifier: null,
    make: null,
  },
  {
    id: 'pure-svg',
    label: 'Pure SVG, labels follow orientation',
    identifier: 'renderPureSvgNode',
    make: ctx => props => <PureSvgNode {...props} orientation={ctx.orientation} />,
  },
  {
    id: 'foreign-object',
    label: 'HTML card in a foreignObject',
    identifier: 'renderForeignObjectNode',
    make: ctx => props => <NodeCard {...props} nodeSize={ctx.nodeSize} />,
  },
  {
    id: 'inputs',
    label: 'HTML card with an input',
    identifier: 'renderInteractiveNode',
    make: ctx => props => <NodeCard {...props} nodeSize={ctx.nodeSize} withInput />,
  },
];
