import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import { select } from 'd3';

import './style.css';

export default class Node extends React.Component {
  constructor(props) {
    super(props);
    const { nodeData: { parent }, orientation } = props;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;

    this.state = {
      transform: this.setTransformOrientation(originX, originY, orientation),
      initialStyle: {
        opacity: 0,
      },
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleOnMouseOver = this.handleOnMouseOver.bind(this);
    this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
  }

  componentDidMount() {
    const { nodeData: { x, y }, orientation, transitionDuration } = this.props;
    const transform = this.setTransformOrientation(x, y, orientation);

    this.applyTransform(transform, transitionDuration);
  }

  componentWillUpdate(nextProps) {
    const transform = this.setTransformOrientation(
      nextProps.nodeData.x,
      nextProps.nodeData.y,
      nextProps.orientation,
    );
    this.applyTransform(transform, nextProps.transitionDuration);
  }

  shouldComponentUpdate(nextProps) {
    return this.shouldNodeTransform(this.props, nextProps);
  }

  shouldNodeTransform(ownProps, nextProps) {
    return (
      nextProps.subscriptions !== ownProps.subscriptions ||
      nextProps.nodeData.x !== ownProps.nodeData.x ||
      nextProps.nodeData.y !== ownProps.nodeData.y ||
      nextProps.orientation !== ownProps.orientation
    );
  }

  setTransformOrientation(x, y, orientation) {
    return orientation === 'horizontal' ? `translate(${y},${x})` : `translate(${x},${y})`;
  }

  applyTransform(transform, transitionDuration, opacity = 1, done = () => {}) {
    if (transitionDuration === 0) {
      select(this.node)
        .attr('transform', transform)
        .style('opacity', opacity);
      done();
    } else {
      select(this.node)
        .transition()
        .duration(transitionDuration)
        .attr('transform', transform)
        .style('opacity', opacity)
        .each('end', done);
    }
  }

  handleClick() {
    this.props.onClick(this.props.nodeData.id);
  }

  handleOnMouseOver() {
    this.props.onMouseOver(this.props.nodeData.id);
  }

  handleOnMouseOut() {
    this.props.onMouseOut(this.props.nodeData.id);
  }

  componentWillLeave(done) {
    const { nodeData: { parent }, orientation, transitionDuration } = this.props;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;
    const transform = this.setTransformOrientation(originX, originY, orientation);

    this.applyTransform(transform, transitionDuration, 0, done);
  }

  render() {
    const { nodeData, nodeSvgShape, textLayout, styles } = this.props;
    const nodeStyle = nodeData._children ? { ...styles.node } : { ...styles.leafNode };
    return (
      <g
        id={nodeData.id}
        ref={n => {
          this.node = n;
        }}
        style={this.state.initialStyle}
        className={nodeData._children ? 'nodeBase' : 'leafNodeBase'}
        transform={this.state.transform}
        onClick={this.handleClick}
        onMouseOver={this.handleOnMouseOver}
        onMouseOut={this.handleOnMouseOut}
      >
        {/* TODO: DEPRECATE <circle /> */}
        {this.props.circleRadius ? (
          <circle r={this.props.circleRadius} style={nodeStyle.circle} />
        ) : (
          React.createElement(nodeSvgShape.shape, {
            ...nodeSvgShape.shapeProps,
            ...nodeStyle.circle,
          })
        )}

        <text
          className="nodeNameBase"
          style={nodeStyle.name}
          textAnchor={textLayout.textAnchor}
          x={textLayout.x}
          y={textLayout.y}
          transform={textLayout.transform}
          dy=".35em"
        >
          {this.props.name}
        </text>
        <text
          className="nodeAttributesBase"
          y={textLayout.y + 10}
          textAnchor={textLayout.textAnchor}
          transform={textLayout.transform}
          style={nodeStyle.attributes}
        >
          {this.props.attributes &&
            Object.keys(this.props.attributes).map(labelKey => (
              <tspan x={textLayout.x} dy="1.2em" key={uuid.v4()}>
                {labelKey}: {this.props.attributes[labelKey]}
              </tspan>
            ))}
        </text>
      </g>
    );
  }
}

Node.defaultProps = {
  textAnchor: 'start',
  attributes: undefined,
  circleRadius: undefined,
  onMouseOver: undefined,
  styles: {
    node: {
      circle: {},
      name: {},
      attributes: {},
    },
    leafNode: {
      circle: {},
      name: {},
      attributes: {},
    },
  },
};

Node.propTypes = {
  nodeData: PropTypes.object.isRequired,
  nodeSvgShape: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  transitionDuration: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onMouseOut: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  attributes: PropTypes.object,
  textLayout: PropTypes.object.isRequired,
  subscriptions: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  circleRadius: PropTypes.number,
  styles: PropTypes.object,
};
