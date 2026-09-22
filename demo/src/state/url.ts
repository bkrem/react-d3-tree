import {
  defaults,
  isModified,
  type DatasetId,
  type NodeRendererId,
  type Patch,
  type PlaygroundState,
  type Point,
  type StateKey,
} from './playground.js';

// The query string carries only props that differ from the defaults, so a shared link is short and
// a link with no query string opens the defaults. A pasted dataset is too large for a URL and is
// left out; a link made with one opens on the org chart.

const datasetIds: DatasetId[] = ['org-chart', 'flare', 'react-repo'];
const orientations = ['horizontal', 'vertical'] as const;
const pathFuncs = ['diagonal', 'elbow', 'straight', 'step'] as const;
const nodeRenderers: NodeRendererId[] = ['default', 'pure-svg', 'foreign-object', 'inputs'];

const booleanKeys = [
  'collapsible',
  'zoomable',
  'draggable',
  'centerOnClick',
  'shouldCollapseNeighborNodes',
  'hasInteractiveNodes',
  'enableLegacyTransitions',
] as const satisfies readonly StateKey[];

const numberKeys = [
  'depthFactor',
  'initialDepth',
  'zoom',
  'transitionDuration',
  'centeringTransitionDuration',
] as const satisfies readonly StateKey[];

type BooleanKey = (typeof booleanKeys)[number];
type NumberKey = (typeof numberKeys)[number];

const finite = (s: string | null): number | null => {
  if (s === null || s.trim() === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const pair = (s: string | null): [number, number] | null => {
  if (s === null) return null;
  const parts = s.split(',');
  if (parts.length !== 2) return null;
  const a = finite(parts[0]);
  const b = finite(parts[1]);
  return a === null || b === null ? null : [a, b];
};

const oneOf = <T extends string>(allowed: readonly T[], s: string | null): T | null =>
  s !== null && (allowed as readonly string[]).includes(s) ? (s as T) : null;

function encode(state: PlaygroundState, key: StateKey): string | null {
  const value = state[key];
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number' || typeof value === 'string') return String(value);
  if (key === 'nodeSize' || key === 'translate') {
    const p = value as Point;
    return `${p.x},${p.y}`;
  }
  if (key === 'separation') {
    const s = value as PlaygroundState['separation'];
    return `${s.siblings},${s.nonSiblings}`;
  }
  if (key === 'scaleExtent') {
    const s = value as PlaygroundState['scaleExtent'];
    return `${s.min},${s.max}`;
  }
  return null;
}

/** Query parameters for every prop that differs from the defaults. */
export function toSearchParams(state: PlaygroundState): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(defaults) as StateKey[]) {
    if (!isModified(state, key)) continue;
    if (key === 'dataset' && state.dataset === 'custom') continue;
    const encoded = encode(state, key);
    if (encoded !== null) params.set(key, encoded);
  }
  return params;
}

/** The props a query string sets. Unknown keys and malformed values are ignored. */
export function fromSearchParams(params: URLSearchParams): Patch {
  const patch: Patch = {};

  const dataset = oneOf(datasetIds, params.get('dataset'));
  if (dataset) patch.dataset = dataset;
  const orientation = oneOf(orientations, params.get('orientation'));
  if (orientation) patch.orientation = orientation;
  const pathFunc = oneOf(pathFuncs, params.get('pathFunc'));
  if (pathFunc) patch.pathFunc = pathFunc;
  const nodeRenderer = oneOf(nodeRenderers, params.get('nodeRenderer'));
  if (nodeRenderer) patch.nodeRenderer = nodeRenderer;

  for (const key of booleanKeys) {
    const v = params.get(key);
    if (v === '1' || v === '0') patch[key as BooleanKey] = v === '1';
  }
  for (const key of numberKeys) {
    const n = finite(params.get(key));
    if (n !== null) patch[key as NumberKey] = n;
  }

  const nodeSize = pair(params.get('nodeSize'));
  if (nodeSize) patch.nodeSize = { x: nodeSize[0], y: nodeSize[1] };
  const translate = pair(params.get('translate'));
  if (translate) patch.translate = { x: translate[0], y: translate[1] };
  const separation = pair(params.get('separation'));
  if (separation) patch.separation = { siblings: separation[0], nonSiblings: separation[1] };
  const scaleExtent = pair(params.get('scaleExtent'));
  if (scaleExtent) patch.scaleExtent = { min: scaleExtent[0], max: scaleExtent[1] };

  return patch;
}

/** Rewrites the address bar without adding a history entry. */
export function writeUrl(state: PlaygroundState): void {
  const query = toSearchParams(state).toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', url);
}
