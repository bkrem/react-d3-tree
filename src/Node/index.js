/* eslint-disable */
import React, { PropTypes } from 'react';

import './style.css';

export default class Node extends React.Component {
  static defaultProps = {
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
  }

  static propTypes = {
    nodeData: PropTypes.object.isRequired,
    orientation: PropTypes.oneOf([
      'horizontal',
      'vertical',
    ]).isRequired,
    onClick: PropTypes.func,
    primaryLabel: PropTypes.string,
    primaryLabelStyle: PropTypes.object,
    secondaryLabels: PropTypes.object,
    secondaryLabelsStyle: PropTypes.object,
    textAnchor: PropTypes.string,
    circleRadius: PropTypes.number,
    circleStyle: PropTypes.object,
  }

  render() {
    const { nodeData, orientation } = this.props;
    const transform = orientation === 'horizontal' ?
      `translate(${nodeData.y},${nodeData.x})` :
      `translate(${nodeData.x},${nodeData.y})`;

    return (
      <g
        id={nodeData.id}
        className={nodeData.children ? "nodeBase" : "leafNodeBase"}
        transform={transform}
        onClick={() => this.props.onClick(nodeData.id)}
      >
        <text
          className="primaryLabelBase"
          textAnchor={this.props.textAnchor}
          style={{ fill: this.props.primaryLabelColor }}
          x="10"
          y="-10"
          dy=".35em"
        >
          {this.props.primaryLabel}
        </text>

        <circle
          r={this.props.circleRadius}
          style={nodeData.children ? this.props.circleStyle : this.props.leafCircleStyle}
        />

        <text
          className="secondaryLabelsBase"
          y="0"
          textAnchor={this.props.textAnchor}
          style={this.props.secondaryLabelsStyle}
        >
          {Object.keys(this.props.secondaryLabels).map((labelKey, i) =>
            <tspan x="10" dy="1.2em" key={labelKey + i}>
              {labelKey}: {this.props.secondaryLabels[labelKey]}
            </tspan>
          )}
        </text>
      </g>
    );
  }
}
