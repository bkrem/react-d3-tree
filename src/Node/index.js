import React, { PropTypes } from 'react';
import uuid from 'uuid';
import { select } from 'd3';

import './style.css';

export default class Node extends React.Component {

  constructor(props) {
    super(props);
    const { parent } = props.nodeData;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;

    this.state = {
      transform: this.setTransformOrientation(originX, originY),
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { x, y } = this.props.nodeData;
    const transform = this.setTransformOrientation(x, y);

    this.applyTransform(transform);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeData.x !== this.props.nodeData.x ||
      nextProps.nodeData.y !== this.props.nodeData.y) {
      const transform = this.setTransformOrientation(nextProps.nodeData.x, nextProps.nodeData.y);
      this.applyTransform(transform);
    }
  }

  setTransformOrientation(x, y) {
    const { orientation } = this.props;
    const transform = orientation === 'horizontal' ?
      `translate(${y},${x})` :
      `translate(${x},${y})`;
    return transform;
  }

  applyTransform(transform, opacity = 1, done = () => {}) {
    const { enabled, duration } = this.props.transitions;
    if (enabled) {
      select(this.node)
      .transition()
      .duration(duration)
      .attr('transform', transform)
      .style('opacity', opacity)
      .each('end', done);
    } else {
      done();
    }
  }

  handleClick() {
    this.props.onClick(this.props.nodeData.id);
  }

  componentWillLeave(done) {
    const { parent } = this.props.nodeData;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;
    const transform = this.setTransformOrientation(originX, originY);

    this.applyTransform(transform, 0, done);
    // this.applyOpacity(0, done);
  }

  render() {
    const { nodeData, depthFactor, transitions } = this.props;

    const transform = transitions.enabled && this.state.transform ?
      this.state.transform :
      this.setTransformOrientation(nodeData.x, nodeData.y);


    if (depthFactor) {
      nodeData.y = nodeData.depth * depthFactor;
    }
    return (
      <g
        id={nodeData.id}
        ref={(n) => { this.node = n; }}
        style={transitions.enabled ? undefined : { opacity: 1 }}
        className={nodeData._children ? 'nodeBase' : 'leafNodeBase'}
        transform={transform}
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
  depthFactor: undefined,
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

/* eslint-disable */
Node.propTypes = {
  nodeData: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf([
    'horizontal',
    'vertical',
  ]).isRequired,
  transitions: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
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
