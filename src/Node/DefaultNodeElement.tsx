import React from 'react';
import { TreeNodeDatum } from '../types/common';

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

type DefaultNodeElementProps = {
  nodeDatum: TreeNodeDatum;
};

const DefaultNodeElement: React.FunctionComponent<DefaultNodeElementProps> = ({ nodeDatum }) => (
  <>
    <circle r={20}></circle>
    <g className="rd3t-label">
      <text className="rd3t-label__title" {...textLayout.title}>
        {nodeDatum.name}
      </text>
      <text className="rd3t-label__attributes">
        {nodeDatum.attributes &&
          Object.entries(nodeDatum.attributes).map(([labelKey, labelValue], i) => (
            <tspan key={`${labelKey}-${i}`} {...textLayout.attribute}>
              {labelKey}: {labelValue}
            </tspan>
          ))}
      </text>
    </g>
  </>
);

export default DefaultNodeElement;
