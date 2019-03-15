import React from 'react';
import T from 'prop-types';
import { select } from 'd3';

import SvgTextElement from './SvgTextElement';
import ForeignObjectElement from './ForeignObjectElement';
import './style.css';

export default class Node extends React.Component {
  state = {
    transform: this.setTransform(this.props.nodeData, this.props.orientation, true),
    initialStyle: {
      opacity: 0,
    },
  };

  componentDidMount() {
    this.commitTransform();
  }

  componentDidUpdate() {
    this.commitTransform();
  }

  shouldComponentUpdate(nextProps) {
    return this.shouldNodeTransform(this.props, nextProps);
  }

  shouldNodeTransform = (ownProps, nextProps) =>
    nextProps.subscriptions !== ownProps.subscriptions ||
    nextProps.nodeData.x !== ownProps.nodeData.x ||
    nextProps.nodeData.y !== ownProps.nodeData.y ||
    nextProps.orientation !== ownProps.orientation;

  setTransform(nodeData, orientation, shouldTranslateToOrigin = false) {
    const { x, y, parent } = nodeData;
    if (shouldTranslateToOrigin) {
      const hasParent = typeof parent === 'object';
      const originX = hasParent ? parent.x : 0;
      const originY = hasParent ? parent.y : 0;
      return orientation === 'horizontal'
        ? `translate(${originY},${originX})`
        : `translate(${originX},${originY})`;
    }
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

  commitTransform() {
    const { nodeData, orientation, transitionDuration } = this.props;
    const transform = this.setTransform(nodeData, orientation);

    this.applyTransform(transform, transitionDuration);
  }

  renderNodeElement = () => {
    const { nodeElement, nodeData } = this.props;
    const { shape, baseProps, leafNodeProps, branchNodeProps } = nodeElement;
    const elemProps = nodeData._children
      ? { ...baseProps, ...branchNodeProps }
      : { ...baseProps, ...leafNodeProps };
    return shape === 'none' ? null : React.createElement(shape, elemProps);
  };

  renderNodeLabelElement = () => {
    const {
      allowForeignObjects,
      nodeLabelComponent,
      nodeData,
      nodeSize,
      nodeLabelProps,
    } = this.props;

    return allowForeignObjects && nodeLabelComponent ? (
      <ForeignObjectElement nodeData={nodeData} nodeSize={nodeSize} {...nodeLabelComponent} />
    ) : (
      <SvgTextElement
        nameData={nodeData.name}
        attributesData={nodeData.attributes}
        {...nodeLabelProps}
      />
    );
  };

  handleClick = evt => {
    this.props.onClick(this.props.nodeData.id, evt);
  };

  handleOnMouseOver = evt => {
    this.props.onMouseOver(this.props.nodeData.id, evt);
  };

  handleOnMouseOut = evt => {
    this.props.onMouseOut(this.props.nodeData.id, evt);
  };

  componentWillLeave(done) {
    const { nodeData, orientation, transitionDuration } = this.props;
    const transform = this.setTransform(nodeData, orientation, true);
    this.applyTransform(transform, transitionDuration, 0, done);
  }

  render() {
    const { nodeData } = this.props;
    return (
      <g
        id={nodeData.id}
        ref={n => {
          this.node = n;
        }}
        style={this.state.initialStyle}
        className={nodeData._children ? 'nodeBase' : 'leafNodeBase'}
        transform={this.state.transform}
        onClick={this.handleOnClick}
        onMouseOver={this.handleOnMouseOver}
        onMouseOut={this.handleOnMouseOut}
      >
        {this.renderNodeElement()}
        {this.renderNodeLabelElement()}
      </g>
    );
  }
}

Node.defaultProps = {
  nodeLabelComponent: null,
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
  nodeData: T.object.isRequired,
  nodeElement: T.object.isRequired,
  nodeLabelProps: T.object.isRequired,
  nodeLabelComponent: T.object,
  nodeSize: T.object.isRequired,
  orientation: T.oneOf(['horizontal', 'vertical']).isRequired,
  transitionDuration: T.number.isRequired,
  onClick: T.func.isRequired,
  onMouseOver: T.func.isRequired,
  onMouseOut: T.func.isRequired,
  textLayout: T.object.isRequired,
  subscriptions: T.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  allowForeignObjects: T.bool.isRequired,
  styles: T.object,
};
