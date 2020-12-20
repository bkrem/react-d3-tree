import React from 'react';

const textLayout = {
  vertical: {
    title: {
      textAnchor: 'start',
      x: 40,
    },
    attributes: {},
    attribute: {
      x: 40,
      dy: '1.2em',
    },
  },
  horizontal: {
    title: {
      textAnchor: 'start',
      y: 40,
    },
    attributes: {
      x: 0,
      y: 40,
    },
    attribute: {
      x: 0,
      dy: '1.2em',
    },
  },
};

const PureSvgNodeElement = ({ nodeDatum, orientation, toggleNode, onNodeClick }) => {
  return (
    <>
      <circle r={20} onClick={toggleNode}></circle>
      <g className="rd3t-label">
        <text
          className="rd3t-label__title"
          {...textLayout[orientation].title}
          onClick={onNodeClick}
        >
          {nodeDatum.name}
        </text>
        <text className="rd3t-label__attributes" {...textLayout[orientation].attributes}>
          {nodeDatum.attributes &&
            Object.entries(nodeDatum.attributes).map(([labelKey, labelValue], i) => (
              <tspan key={`${labelKey}-${i}`} {...textLayout[orientation].attribute}>
                {labelKey}: {labelValue}
              </tspan>
            ))}
        </text>
      </g>
    </>
  );
};

export default PureSvgNodeElement;
