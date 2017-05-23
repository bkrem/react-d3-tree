import React, { PropTypes } from 'react';
import uuid from 'uuid';

import './style.css';

function Node(props) {
  const { nodeData, orientation, depthFactor } = props;

  // Normalise node position for fixed depth
  if (depthFactor) {
    nodeData.y = nodeData.depth * depthFactor;
  }

  const transform = orientation === 'horizontal' ?
    `translate(${nodeData.y},${nodeData.x})` :
    `translate(${nodeData.x},${nodeData.y})`;

  return (
    <g
      id={nodeData.id}
      className={nodeData._children ? 'nodeBase' : 'leafNodeBase'}
      transform={transform}
      onClick={() => props.onClick(nodeData.id)}
    >
      <text
        className="primaryLabelBase"
        textAnchor={props.textAnchor}
        style={props.primaryLabelStyle}
        x="10"
        y="-10"
        dy=".35em"
      >
        {props.primaryLabel}
      </text>

      <circle
        r={props.circleRadius}
        style={nodeData._children ? props.circleStyle : props.leafCircleStyle}
      />

      <text
        className="secondaryLabelsBase"
        y="0"
        textAnchor={props.textAnchor}
        style={props.secondaryLabelsStyle}
      >
        {props.secondaryLabels && Object.keys(props.secondaryLabels).map((labelKey) =>
          <tspan x="10" dy="1.2em" key={uuid.v4()}>
            {labelKey}: {props.secondaryLabels[labelKey]}
          </tspan>
        )}
      </text>
    </g>
  );
}

Node.defaultProps = {
  circleRadius: 10,
  circleStyle: {
    stroke: '#000',
    strokeWidth: 2,
    fill: 'grey',
  },
  leafCircleStyle: {
    stroke: '#000',
    strokeWidth: 2,
    fill: 'transparent',
  },
};

/* eslint-disable*/
Node.propTypes = {
  nodeData: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf([
    'horizontal',
    'vertical',
  ]).isRequired,
  onClick: PropTypes.func,
  depthFactor: PropTypes.number,
  primaryLabel: PropTypes.string,
  primaryLabelStyle: PropTypes.object,
  secondaryLabels: PropTypes.object,
  secondaryLabelsStyle: PropTypes.object,
  textAnchor: PropTypes.string,
  circleRadius: PropTypes.number,
  circleStyle: PropTypes.object,
  leafCircleStyle: PropTypes.object,
};
/* eslint-enable */

export default Node;
