import React, { SyntheticEvent } from 'react';
import { CustomNodeElementProps, TreeNodeDatum, SyntheticEventHandler } from '../types/common';

const textLayout = {
  title: {
    textAnchor: 'start',
    x: 40,
  },
  attribute: {
    x: 40,
    dy: '1.2em',
  },
};

export interface DefaultNodeElementProps extends CustomNodeElementProps {
  onNodeClick: SyntheticEventHandler;
  onNodeMouseOver: SyntheticEventHandler;
  onNodeMouseOut: SyntheticEventHandler;
}

const DefaultNodeElement: React.FunctionComponent<DefaultNodeElementProps> = ({
  data,
  toggleNode,
  onNodeClick,
  onNodeMouseOver,
  onNodeMouseOut,
}) => (
  <>
    <circle
      r={20}
      onClick={evt => {
        toggleNode();
        onNodeClick(evt);
      }}
      onMouseOver={onNodeMouseOver}
      onMouseOut={onNodeMouseOut}
    ></circle>
    <g className="rd3t-label">
      <text className="rd3t-label__title" {...textLayout.title}>
        {data.name}
      </text>
      <text className="rd3t-label__attributes">
        {data.attributes &&
          Object.entries(data.attributes).map(([labelKey, labelValue], i) => (
            <tspan key={`${labelKey}-${i}`} {...textLayout.attribute}>
              {labelKey}: {labelValue}
            </tspan>
          ))}
      </text>
    </g>
  </>
);

export default DefaultNodeElement;
