import type { ReactElement } from 'react';
import { CustomNodeElementProps } from '../types/common.js';

const DEFAULT_NODE_CIRCLE_RADIUS = 15;

const textLayout = {
  title: {
    textAnchor: 'start' as const,
    x: 40,
  },
  attribute: {
    x: 40,
    dy: '1.2em',
  },
};

export interface DefaultNodeElementProps extends CustomNodeElementProps {}

const DefaultNodeElement = ({
  nodeDatum,
  toggleNode,
  onNodeClick,
  onNodeMouseOver,
  onNodeMouseOut,
}: DefaultNodeElementProps): ReactElement => (
  <>
    <circle
      r={DEFAULT_NODE_CIRCLE_RADIUS}
      onClick={evt => {
        toggleNode();
        onNodeClick(evt);
      }}
      onMouseOver={onNodeMouseOver}
      onMouseOut={onNodeMouseOut}
    ></circle>
    <g className="rd3t-label">
      <text className="rd3t-label__title" {...textLayout.title}>
        {nodeDatum.name}
      </text>
      <text className="rd3t-label__attributes">
        {nodeDatum.attributes &&
          Object.entries(nodeDatum.attributes).map(([labelKey, labelValue], i) => (
            <tspan key={`${labelKey}-${i}`} {...textLayout.attribute}>
              {`${labelKey}: ${labelValue}`}
            </tspan>
          ))}
      </text>
    </g>
  </>
);

export default DefaultNodeElement;
