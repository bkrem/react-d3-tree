import React, { PropTypes } from 'react';
import uuid from 'uuid';
import { select } from 'd3';

import './style.css';

export default class Node extends React.Component {

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { x, y, parent } = this.props.nodeData;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;

    select(this.node)
    .attr('transform', this.setTransformOrientation(originX, originY));

    select(this.node)
    .transition()
    .duration(500)
    .attr('transform', this.setTransformOrientation(x, y));
  }

  // FIXME unstable re-rendering when regressing to parent coordinates
  setTransformOrientation(x, y) {
    const { orientation } = this.props;
    let transform;

    if (orientation === 'horizontal') {
      // transform = nodeData.parent !== 'null' ?
      //   `translate(${nodeData.parent.y},${nodeData.parent.x})` :
      //   `translate(${nodeData.y},${nodeData.x})`;
      transform = `translate(${y},${x})`;
    } else {
      // transform = nodeData.parent !== 'null' ?
      //   `translate(${nodeData.parent.x},${nodeData.parent.y})` :
      //   `translate(${nodeData.x},${nodeData.y})`;
      transform = `translate(${x},${y})`;
    }

    return transform;
  }

  componentWillLeave(done) {
    const { parent } = this.props.nodeData;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;

    select(this.node)
    .transition()
    .duration(500)
    .attr('transform', this.setTransformOrientation(originX, originY))
    .each('end', done);
  }

  handleClick() {
    this.props.onClick(this.props.nodeData.id);
  }

  render() {
    const { nodeData, depthFactor } = this.props;

    if (depthFactor) {
      nodeData.y = nodeData.depth * depthFactor;
    }
    return (
      <g
        id={nodeData.id}
        ref={(n) => { this.node = n; }}
        className={nodeData._children ? 'nodeBase' : 'leafNodeBase'}
        transform={this.setTransformOrientation(nodeData.x, nodeData.y)}
        onClick={this.handleClick}
      >
        <text
          className="primaryLabelBase"
          textAnchor={this.props.textAnchor}
          style={this.props.primaryLabelStyle}
          x="10"
          y="-10"
          dy=".35em"
        >
          {this.props.primaryLabel}
        </text>

        <circle
          r={this.props.circleRadius}
          style={nodeData._children ? this.props.circleStyle : this.props.leafCircleStyle}
        />

        <text
          className="secondaryLabelsBase"
          y="0"
          textAnchor={this.props.textAnchor}
          style={this.props.secondaryLabelsStyle}
        >
          {this.props.secondaryLabels && Object.keys(this.props.secondaryLabels).map((labelKey) =>
            <tspan x="10" dy="1.2em" key={uuid.v4()}>
              {labelKey}: {this.props.secondaryLabels[labelKey]}
            </tspan>
          )}
        </text>
      </g>
    );
  }
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
