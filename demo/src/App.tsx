import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { Orientation } from 'react-d3-tree';
import { CodeDrawer } from './components/CodeDrawer.jsx';
import { Inspector } from './components/Inspector.jsx';
import { TopBar } from './components/TopBar.jsx';
import { TreeCanvas, type Size } from './components/TreeCanvas.jsx';
import { builtInDatasets, type Dataset } from './data/datasets.js';
import { nodeRenderers } from './nodes/renderers.jsx';
import { toJsx } from './state/jsx.js';
import { createLiveStore } from './state/liveTransform.js';
import { applyPatch, defaults, reducer, type Point } from './state/playground.js';
import { fromSearchParams, writeUrl } from './state/url.js';

/** Where the root goes when no translate is set: a fifth in from the left, or a sixth down. */
function fitTranslate(size: Size | null, orientation: Orientation): Point {
  if (!size) return { x: 0, y: 0 };
  return orientation === 'horizontal'
    ? { x: Math.round(size.width / 5), y: Math.round(size.height / 2) }
    : { x: Math.round(size.width / 2), y: Math.round(size.height / 6) };
}

function initialState() {
  return applyPatch(defaults, fromSearchParams(new URLSearchParams(window.location.search)));
}

/** How long after the last drag or zoom tick the view counts as settled. */
const SETTLE_MS = 150;

const round = (n: number, decimals = 0) => {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};

/** A pasted dataset and how many have been loaded, so that each load remounts the tree. */
interface CustomDataset {
  dataset: Dataset;
  load: number;
}

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [custom, setCustom] = useState<CustomDataset | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const liveStore = useMemo(() => createLiveStore(), []);

  useEffect(() => {
    writeUrl(state);
  }, [state]);

  const datasets = custom ? [...builtInDatasets, custom.dataset] : builtInDatasets;
  const dataset = datasets.find(d => d.id === state.dataset) ?? builtInDatasets[0];
  // `Tree` keeps collapse state across data updates by node id, and path ids repeat between
  // datasets, so a dataset change remounts the tree. `initialDepth` seeds that state on mount,
  // so a change to it remounts too and the field applies at once.
  const treeKey = [
    dataset.id === 'custom' ? `custom-${custom?.load ?? 0}` : dataset.id,
    state.initialDepth ?? 'all',
  ].join(':');

  const translate = state.translate ?? fitTranslate(size, state.orientation);

  // `Tree` applies the `translate` and `zoom` props whenever they change and reports drags,
  // zooms, and centring through `onTransformChange`. Once a gesture settles, the live transform
  // becomes the state, so the props, the URL, and the snippet match the view. Until then the
  // store keeps the per-tick reports out of React state.
  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = liveStore.subscribe(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const live = liveStore.get();
        if (!live) return;
        dispatch({
          type: 'set-transform',
          translate: { x: round(live.translate.x), y: round(live.translate.y) },
          zoom: round(live.zoom, 3),
        });
      }, SETTLE_MS);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [liveStore]);

  const renderer = nodeRenderers.find(r => r.id === state.nodeRenderer) ?? nodeRenderers[0];
  const renderNode = useMemo(
    () => renderer.make?.({ orientation: state.orientation, nodeSize: state.nodeSize }),
    [renderer, state.orientation, state.nodeSize]
  );

  const jsx = useMemo(
    () =>
      toJsx(state, {
        dataIdentifier: dataset.identifier,
        rendererIdentifier: renderer.identifier,
        translate,
      }),
    [state, dataset.identifier, renderer.identifier, translate]
  );

  const onSize = useCallback((next: Size) => {
    setSize(prev =>
      prev && prev.width === next.width && prev.height === next.height ? prev : next
    );
  }, []);

  const loadCustom = (next: Dataset) => {
    setCustom(prev => ({ dataset: next, load: (prev?.load ?? 0) + 1 }));
    dispatch({ type: 'patch', patch: { dataset: 'custom' } });
  };

  return (
    <div className="playground">
      <TopBar />
      <TreeCanvas
        treeKey={treeKey}
        state={state}
        dataset={dataset}
        size={size}
        translate={translate}
        renderNode={renderNode}
        liveStore={liveStore}
        onSize={onSize}
        onReset={() => dispatch({ type: 'reset-all' })}
      />
      <CodeDrawer jsx={jsx} />
      <Inspector state={state} dispatch={dispatch} datasets={datasets} onLoadCustom={loadCustom} />
    </div>
  );
}
