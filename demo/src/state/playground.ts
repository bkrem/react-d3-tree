import type { Orientation, PathFunctionOption } from 'react-d3-tree';

export type DatasetId = 'org-chart' | 'flare' | 'react-repo' | 'custom';
export type NodeRendererId = 'default' | 'pure-svg' | 'foreign-object' | 'inputs';

export interface Point {
  x: number;
  y: number;
}

/** Everything the inspector edits. `null` means "not set", so the library or the canvas decides. */
export interface PlaygroundState {
  dataset: DatasetId;
  orientation: Orientation;
  pathFunc: PathFunctionOption;
  nodeSize: Point;
  separation: { siblings: number; nonSiblings: number };
  /** `null`: the library computes the depth spacing from `nodeSize`. */
  depthFactor: number | null;
  /** `null`: the canvas positions the root to fit its container. */
  translate: Point | null;
  /** `null`: the tree renders to full depth. */
  initialDepth: number | null;
  collapsible: boolean;
  zoomable: boolean;
  draggable: boolean;
  centerOnClick: boolean;
  shouldCollapseNeighborNodes: boolean;
  hasInteractiveNodes: boolean;
  zoom: number;
  scaleExtent: { min: number; max: number };
  centeringTransitionDuration: number;
  nodeRenderer: NodeRendererId;
}

export type Patch = Partial<PlaygroundState>;

/**
 * The library's documented defaults, so the inspector starts where a consumer with no props
 * starts. `Tree` is a function component with no `defaultProps` to read them from; keep these in
 * step with the `@default` tags in its `TreeProps` docs.
 */
export const defaults: PlaygroundState = {
  dataset: 'org-chart',
  orientation: 'horizontal',
  pathFunc: 'diagonal',
  nodeSize: { x: 140, y: 140 },
  separation: { siblings: 1, nonSiblings: 2 },
  depthFactor: null,
  translate: null,
  initialDepth: null,
  collapsible: true,
  zoomable: true,
  draggable: true,
  centerOnClick: false,
  shouldCollapseNeighborNodes: false,
  hasInteractiveNodes: false,
  zoom: 1,
  scaleExtent: { min: 0.1, max: 1 },
  centeringTransitionDuration: 800,
  nodeRenderer: 'default',
};

export type StateKey = keyof PlaygroundState;

export const groups = {
  data: ['dataset'],
  layout: [
    'orientation',
    'pathFunc',
    'nodeSize',
    'separation',
    'depthFactor',
    'translate',
    'initialDepth',
  ],
  behaviour: [
    'collapsible',
    'zoomable',
    'draggable',
    'centerOnClick',
    'shouldCollapseNeighborNodes',
    'hasInteractiveNodes',
  ],
  zoom: ['zoom', 'scaleExtent'],
  animation: ['centeringTransitionDuration'],
  rendering: ['nodeRenderer'],
} satisfies Record<string, StateKey[]>;

export type GroupId = keyof typeof groups;

/** Structural equality for the small values the state holds: primitives, `null`, flat objects. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every(k => sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  );
}

export function isModified(state: PlaygroundState, key: StateKey): boolean {
  return !sameValue(state[key], defaults[key]);
}

export function modifiedKeys(state: PlaygroundState): StateKey[] {
  return (Object.keys(defaults) as StateKey[]).filter(key => isModified(state, key));
}

export function resetGroup(state: PlaygroundState, group: GroupId): PlaygroundState {
  const patch: Record<string, unknown> = {};
  for (const key of groups[group]) {
    patch[key] = defaults[key];
  }
  // hasInteractiveNodes follows the inputs renderer; a Behaviour reset keeps it on while that
  // renderer is selected, and a Rendering reset turns it off through applyPatch.
  if (group === 'behaviour' && state.nodeRenderer === 'inputs') {
    patch.hasInteractiveNodes = true;
  }
  return applyPatch(state, patch as Patch);
}

/** Applies a patch. Rules that keep the state consistent live here, not in the controls. */
export function applyPatch(state: PlaygroundState, patch: Patch): PlaygroundState {
  const next = { ...state, ...patch };
  // Inputs inside a node need the D3 zoom and drag handlers out of the way, so choosing that
  // renderer turns hasInteractiveNodes on and leaving it turns it back off, unless the same patch
  // sets the flag itself.
  if (patch.hasInteractiveNodes === undefined && patch.nodeRenderer !== undefined) {
    if (patch.nodeRenderer === 'inputs' && state.nodeRenderer !== 'inputs') {
      next.hasInteractiveNodes = true;
    } else if (patch.nodeRenderer !== 'inputs' && state.nodeRenderer === 'inputs') {
      next.hasInteractiveNodes = defaults.hasInteractiveNodes;
    }
  }
  return next;
}

/**
 * The scale extent the tree gets. A field being typed can hold `0` or a min above the max for a
 * moment; the library would render a blank canvas or flip between the two values, so the props
 * get a safe version while the state keeps what was typed.
 */
export function effectiveScaleExtent(extent: PlaygroundState['scaleExtent']) {
  const min = Math.max(extent.min, 0.01);
  return { min, max: Math.max(extent.max, min) };
}

/** The zoom the library applies: `zoom` clamped into the effective scale extent. */
export function clampZoom(zoom: number, extent: PlaygroundState['scaleExtent']): number {
  const { min, max } = effectiveScaleExtent(extent);
  return Math.min(Math.max(zoom, min), max);
}

export type Action =
  | { type: 'patch'; patch: Patch }
  | { type: 'reset-group'; group: GroupId }
  | { type: 'reset-all' }
  /** The transform the user reached by dragging and zooming; `translate` becomes explicit. */
  | { type: 'set-transform'; translate: Point; zoom: number };

export function reducer(state: PlaygroundState, action: Action): PlaygroundState {
  switch (action.type) {
    case 'patch':
      return applyPatch(state, action.patch);
    case 'reset-group':
      return resetGroup(state, action.group);
    case 'reset-all':
      return defaults;
    case 'set-transform':
      if (sameValue(state.translate, action.translate) && state.zoom === action.zoom) return state;
      return { ...state, translate: action.translate, zoom: action.zoom };
  }
}
