import type { Dispatch } from 'react';
import type { Dataset } from '../data/datasets.js';
import { nodeRenderers } from '../nodes/renderers.jsx';
import {
  groups,
  isModified,
  type Action,
  type GroupId,
  type NodeRendererId,
  type Patch,
  type PlaygroundState,
} from '../state/playground.js';
import { DataPanel } from './DataPanel.jsx';
import { Group, Hint, NumberField, Row, Segmented, Select, Toggle } from './controls.jsx';

interface InspectorProps {
  state: PlaygroundState;
  dispatch: Dispatch<Action>;
  datasets: Dataset[];
  onLoadCustom: (dataset: Dataset) => void;
}

const orientationOptions = [
  { value: 'horizontal', label: 'horizontal' },
  { value: 'vertical', label: 'vertical' },
] as const;

const pathFuncOptions = [
  { value: 'diagonal', label: 'diagonal' },
  { value: 'elbow', label: 'elbow' },
  { value: 'straight', label: 'straight' },
  { value: 'step', label: 'step' },
] as const;

const rendererOptions = nodeRenderers.map(r => ({ value: r.id, label: r.label }));

export function Inspector({ state, dispatch, datasets, onLoadCustom }: InspectorProps) {
  const set = (patch: Patch) => dispatch({ type: 'patch', patch });
  const groupProps = (group: GroupId) => ({
    modified: groups[group].some(key => isModified(state, key)),
    onReset: () => dispatch({ type: 'reset-group', group }),
  });
  const mod = (key: keyof PlaygroundState) => isModified(state, key);

  return (
    <aside className="inspector" aria-label="Props">
      <Group title="Data" {...groupProps('data')}>
        <DataPanel
          datasets={datasets}
          selected={state.dataset}
          onSelect={dataset => set({ dataset })}
          onLoadCustom={onLoadCustom}
        />
      </Group>

      <Group title="Layout" {...groupProps('layout')}>
        <Row label="orientation" modified={mod('orientation')}>
          <Segmented
            name="orientation"
            label="Orientation"
            value={state.orientation}
            options={orientationOptions}
            onChange={orientation => set({ orientation })}
          />
        </Row>
        <Row label="pathFunc" modified={mod('pathFunc')} stack>
          <Segmented
            name="pathFunc"
            label="Path function"
            value={state.pathFunc}
            options={pathFuncOptions}
            onChange={pathFunc => set({ pathFunc })}
          />
        </Row>
        <Row label="nodeSize" modified={mod('nodeSize')}>
          <span className="pair">
            <span className="pair__k">x</span>
            <NumberField
              id="nodeSize-x"
              ariaLabel="nodeSize x"
              value={state.nodeSize.x}
              modified={mod('nodeSize')}
              min={1}
              onChange={x => x !== null && set({ nodeSize: { ...state.nodeSize, x } })}
            />
            <span className="pair__k">y</span>
            <NumberField
              id="nodeSize-y"
              ariaLabel="nodeSize y"
              value={state.nodeSize.y}
              modified={mod('nodeSize')}
              min={1}
              onChange={y => y !== null && set({ nodeSize: { ...state.nodeSize, y } })}
            />
          </span>
        </Row>
        <Row label="separation" modified={mod('separation')}>
          <span className="pair">
            <span className="pair__k" aria-hidden="true">
              sib
            </span>
            <NumberField
              id="separation-siblings"
              ariaLabel="separation siblings"
              value={state.separation.siblings}
              modified={mod('separation')}
              step={0.5}
              min={0}
              onChange={siblings =>
                siblings !== null && set({ separation: { ...state.separation, siblings } })
              }
            />
            <span className="pair__k" aria-hidden="true">
              non
            </span>
            <NumberField
              id="separation-nonSiblings"
              ariaLabel="separation nonSiblings"
              value={state.separation.nonSiblings}
              modified={mod('separation')}
              step={0.5}
              min={0}
              onChange={nonSiblings =>
                nonSiblings !== null && set({ separation: { ...state.separation, nonSiblings } })
              }
            />
          </span>
        </Row>
        <Row label="depthFactor" htmlFor="depthFactor" modified={mod('depthFactor')}>
          <NumberField
            id="depthFactor"
            value={state.depthFactor}
            modified={mod('depthFactor')}
            emptyMeans="auto"
            step={10}
            onChange={depthFactor => set({ depthFactor })}
          />
        </Row>
        <Row label="translate" modified={mod('translate')}>
          <span className="pair">
            <span className="pair__k">x</span>
            <NumberField
              id="translate-x"
              ariaLabel="translate x"
              value={state.translate?.x ?? null}
              modified={mod('translate')}
              emptyMeans="fit"
              step={10}
              onChange={x =>
                set({ translate: x === null ? null : { x, y: state.translate?.y ?? 0 } })
              }
            />
            <span className="pair__k">y</span>
            <NumberField
              id="translate-y"
              ariaLabel="translate y"
              value={state.translate?.y ?? null}
              modified={mod('translate')}
              emptyMeans="fit"
              step={10}
              onChange={y =>
                set({ translate: y === null ? null : { x: state.translate?.x ?? 0, y } })
              }
            />
          </span>
        </Row>
        <Hint>Empty fields fit the root to the canvas. Dragging the tree fills them in.</Hint>
        <Row label="initialDepth" htmlFor="initialDepth" modified={mod('initialDepth')}>
          <NumberField
            id="initialDepth"
            value={state.initialDepth}
            modified={mod('initialDepth')}
            emptyMeans="all"
            min={0}
            step={1}
            onChange={initialDepth => set({ initialDepth })}
          />
        </Row>
        <Hint>initialDepth applies when the data changes: pick a dataset again to see it.</Hint>
      </Group>

      <Group title="Behaviour" {...groupProps('behaviour')}>
        <Row label="collapsible" htmlFor="collapsible" modified={mod('collapsible')}>
          <Toggle
            id="collapsible"
            checked={state.collapsible}
            onChange={collapsible => set({ collapsible })}
          />
        </Row>
        <Row label="zoomable" htmlFor="zoomable" modified={mod('zoomable')}>
          <Toggle id="zoomable" checked={state.zoomable} onChange={zoomable => set({ zoomable })} />
        </Row>
        <Row label="draggable" htmlFor="draggable" modified={mod('draggable')}>
          <Toggle
            id="draggable"
            checked={state.draggable}
            onChange={draggable => set({ draggable })}
          />
        </Row>
        <Row
          label="Centre node on click"
          code={false}
          htmlFor="centerOnClick"
          modified={mod('centerOnClick')}
        >
          <Toggle
            id="centerOnClick"
            checked={state.centerOnClick}
            onChange={centerOnClick => set({ centerOnClick })}
          />
        </Row>
        <Hint>
          Passes the canvas size as <code>dimensions</code>.
        </Hint>
        <Row
          label="shouldCollapseNeighborNodes"
          htmlFor="shouldCollapseNeighborNodes"
          modified={mod('shouldCollapseNeighborNodes')}
        >
          <Toggle
            id="shouldCollapseNeighborNodes"
            checked={state.shouldCollapseNeighborNodes}
            onChange={shouldCollapseNeighborNodes => set({ shouldCollapseNeighborNodes })}
          />
        </Row>
        <Row
          label="hasInteractiveNodes"
          htmlFor="hasInteractiveNodes"
          modified={mod('hasInteractiveNodes')}
        >
          <Toggle
            id="hasInteractiveNodes"
            checked={state.hasInteractiveNodes}
            onChange={hasInteractiveNodes => set({ hasInteractiveNodes })}
          />
        </Row>
        <Hint>Hold Shift over a node to zoom and drag while this is on.</Hint>
      </Group>

      <Group title="Zoom" {...groupProps('zoom')}>
        <Row label="zoom" htmlFor="zoom" modified={mod('zoom')}>
          <NumberField
            id="zoom"
            value={state.zoom}
            modified={mod('zoom')}
            step={0.1}
            min={0}
            onChange={zoom => zoom !== null && set({ zoom })}
          />
        </Row>
        <Row label="scaleExtent" modified={mod('scaleExtent')}>
          <span className="pair">
            <span className="pair__k">min</span>
            <NumberField
              id="scaleExtent-min"
              ariaLabel="scaleExtent min"
              value={state.scaleExtent.min}
              modified={mod('scaleExtent')}
              step={0.1}
              min={0}
              onChange={min => min !== null && set({ scaleExtent: { ...state.scaleExtent, min } })}
            />
            <span className="pair__k">max</span>
            <NumberField
              id="scaleExtent-max"
              ariaLabel="scaleExtent max"
              value={state.scaleExtent.max}
              modified={mod('scaleExtent')}
              step={0.1}
              min={0}
              onChange={max => max !== null && set({ scaleExtent: { ...state.scaleExtent, max } })}
            />
          </span>
        </Row>
      </Group>

      <Group title="Animation" {...groupProps('animation')}>
        <Row
          label="enableLegacyTransitions"
          htmlFor="enableLegacyTransitions"
          modified={mod('enableLegacyTransitions')}
        >
          <Toggle
            id="enableLegacyTransitions"
            checked={state.enableLegacyTransitions}
            onChange={enableLegacyTransitions => set({ enableLegacyTransitions })}
          />
        </Row>
        <Row
          label="transitionDuration"
          htmlFor="transitionDuration"
          modified={mod('transitionDuration')}
        >
          <NumberField
            id="transitionDuration"
            value={state.transitionDuration}
            modified={mod('transitionDuration')}
            step={50}
            min={0}
            unit="ms"
            onChange={transitionDuration =>
              transitionDuration !== null && set({ transitionDuration })
            }
          />
        </Row>
        <Row
          label="centeringTransitionDuration"
          htmlFor="centeringTransitionDuration"
          modified={mod('centeringTransitionDuration')}
          stack
        >
          <NumberField
            id="centeringTransitionDuration"
            value={state.centeringTransitionDuration}
            modified={mod('centeringTransitionDuration')}
            step={50}
            min={0}
            unit="ms"
            onChange={centeringTransitionDuration =>
              centeringTransitionDuration !== null && set({ centeringTransitionDuration })
            }
          />
        </Row>
      </Group>

      <Group title="Rendering" {...groupProps('rendering')}>
        <Row
          label="renderCustomNodeElement"
          htmlFor="nodeRenderer"
          modified={mod('nodeRenderer')}
          stack
        >
          <Select<NodeRendererId>
            id="nodeRenderer"
            value={state.nodeRenderer}
            options={rendererOptions}
            onChange={nodeRenderer => set({ nodeRenderer })}
          />
        </Row>
        <Hint>
          The HTML cards take their width and height from <code>nodeSize</code>. Choosing the card
          with an input also turns on <code>hasInteractiveNodes</code>.
        </Hint>
      </Group>
    </aside>
  );
}
