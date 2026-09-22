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

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [customDataset, setCustomDataset] = useState<Dataset | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const liveStore = useMemo(() => createLiveStore(), []);

  useEffect(() => {
    writeUrl(state);
  }, [state]);

  const datasets = customDataset ? [...builtInDatasets, customDataset] : builtInDatasets;
  const dataset = datasets.find(d => d.id === state.dataset) ?? builtInDatasets[0];

  const translate = state.translate ?? fitTranslate(size, state.orientation);
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
        dimensions: state.centerOnClick ? size : null,
      }),
    [state, dataset.identifier, renderer.identifier, translate, size]
  );

  const onSize = useCallback((next: Size) => {
    setSize(prev =>
      prev && prev.width === next.width && prev.height === next.height ? prev : next
    );
  }, []);

  const loadCustom = (next: Dataset) => {
    setCustomDataset(next);
    dispatch({ type: 'patch', patch: { dataset: 'custom' } });
  };

  return (
    <div className="playground">
      <TopBar />
      <TreeCanvas
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
