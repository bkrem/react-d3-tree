import { isModified, type PlaygroundState, type Point } from './playground.js';

/** Values the canvas resolves at runtime and the snippet has to spell out. */
export interface JsxContext {
  /** Identifier the snippet uses for the `data` prop, for example `orgChart`. */
  dataIdentifier: string;
  /** Identifier for `renderCustomNodeElement`, or `null` for the library default. */
  rendererIdentifier: string | null;
  /** The translate in effect, whether set by hand or fitted to the container. */
  translate: Point;
  /** The container size, when `centerOnClick` is on. */
  dimensions: { width: number; height: number } | null;
}

const point = (p: Point) => `{{ x: ${p.x}, y: ${p.y} }}`;
const num = (n: number) => `{${n}}`;
const bool = (b: boolean) => `{${b}}`;
const str = (s: string) => `"${s}"`;

/**
 * The `<Tree />` a consumer would write to get what the playground shows. Lists `data`, the
 * effective `translate`, and every prop that differs from the library defaults, in the order the
 * `TreeProps` docs use.
 */
export function toJsx(state: PlaygroundState, ctx: JsxContext): string {
  const props: string[] = [`data={${ctx.dataIdentifier}}`];
  const add = (name: string, value: string) => props.push(`${name}=${value}`);

  if (ctx.rendererIdentifier) add('renderCustomNodeElement', `{${ctx.rendererIdentifier}}`);
  if (isModified(state, 'orientation')) add('orientation', str(state.orientation));
  add('translate', point(ctx.translate));
  if (state.centerOnClick && ctx.dimensions) {
    add('dimensions', `{{ width: ${ctx.dimensions.width}, height: ${ctx.dimensions.height} }}`);
  }
  if (isModified(state, 'centeringTransitionDuration')) {
    add('centeringTransitionDuration', num(state.centeringTransitionDuration));
  }
  if (isModified(state, 'pathFunc')) add('pathFunc', str(state.pathFunc));
  if (state.depthFactor !== null) add('depthFactor', num(state.depthFactor));
  if (isModified(state, 'collapsible')) add('collapsible', bool(state.collapsible));
  if (state.initialDepth !== null) add('initialDepth', num(state.initialDepth));
  if (isModified(state, 'zoomable')) add('zoomable', bool(state.zoomable));
  if (isModified(state, 'draggable')) add('draggable', bool(state.draggable));
  if (isModified(state, 'zoom')) add('zoom', num(state.zoom));
  if (isModified(state, 'scaleExtent')) {
    add('scaleExtent', `{{ min: ${state.scaleExtent.min}, max: ${state.scaleExtent.max} }}`);
  }
  if (isModified(state, 'nodeSize')) add('nodeSize', point(state.nodeSize));
  if (isModified(state, 'separation')) {
    const { siblings, nonSiblings } = state.separation;
    add('separation', `{{ siblings: ${siblings}, nonSiblings: ${nonSiblings} }}`);
  }
  if (isModified(state, 'shouldCollapseNeighborNodes')) {
    add('shouldCollapseNeighborNodes', bool(state.shouldCollapseNeighborNodes));
  }
  if (isModified(state, 'enableLegacyTransitions')) {
    add('enableLegacyTransitions', bool(state.enableLegacyTransitions));
  }
  if (isModified(state, 'transitionDuration'))
    add('transitionDuration', num(state.transitionDuration));
  if (isModified(state, 'hasInteractiveNodes')) {
    add('hasInteractiveNodes', bool(state.hasInteractiveNodes));
  }

  return `<Tree\n${props.map(p => `  ${p}`).join('\n')}\n/>`;
}
