import Tree, { type Orientation, type PathFunctionOption } from 'react-d3-tree';

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
  /** Passes the container's `dimensions` to `Tree`, which centres a node when clicked. */
  centerOnClick: boolean;
  shouldCollapseNeighborNodes: boolean;
  hasInteractiveNodes: boolean;
  zoom: number;
  scaleExtent: { min: number; max: number };
  enableLegacyTransitions: boolean;
  transitionDuration: number;
  centeringTransitionDuration: number;
  nodeRenderer: NodeRendererId;
}

export type Patch = Partial<PlaygroundState>;

const lib = Tree.defaultProps;

/** The library's own defaults, so the inspector starts where a consumer with no props starts. */
export const defaults: PlaygroundState = {
  dataset: 'org-chart',
  orientation: lib.orientation ?? 'horizontal',
  pathFunc: typeof lib.pathFunc === 'string' ? lib.pathFunc : 'diagonal',
  nodeSize: { x: lib.nodeSize?.x ?? 140, y: lib.nodeSize?.y ?? 140 },
  separation: {
    siblings: lib.separation?.siblings ?? 1,
    nonSiblings: lib.separation?.nonSiblings ?? 2,
  },
  depthFactor: lib.depthFactor ?? null,
  translate: null,
  initialDepth: lib.initialDepth ?? null,
  collapsible: lib.collapsible ?? true,
  zoomable: lib.zoomable ?? true,
  draggable: lib.draggable ?? true,
  centerOnClick: false,
  shouldCollapseNeighborNodes: lib.shouldCollapseNeighborNodes ?? false,
  hasInteractiveNodes: lib.hasInteractiveNodes ?? false,
  zoom: lib.zoom ?? 1,
  scaleExtent: { min: lib.scaleExtent?.min ?? 0.1, max: lib.scaleExtent?.max ?? 1 },
  enableLegacyTransitions: lib.enableLegacyTransitions ?? false,
  transitionDuration: lib.transitionDuration ?? 500,
  centeringTransitionDuration: lib.centeringTransitionDuration ?? 800,
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
  animation: ['enableLegacyTransitions', 'transitionDuration', 'centeringTransitionDuration'],
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
  const next = { ...state };
  for (const key of groups[group]) {
    (next as Record<StateKey, unknown>)[key] = defaults[key];
  }
  return next;
}

/** Applies a patch. Rules that keep the state consistent live here, not in the controls. */
export function applyPatch(state: PlaygroundState, patch: Patch): PlaygroundState {
  const next = { ...state, ...patch };
  // Inputs inside a node need the D3 zoom and drag handlers out of the way.
  if (patch.nodeRenderer === 'inputs' && state.nodeRenderer !== 'inputs') {
    next.hasInteractiveNodes = true;
  }
  return next;
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
