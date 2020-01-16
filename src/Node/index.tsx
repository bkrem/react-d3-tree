import React from 'react';
import { select } from 'd3';
import SvgTextElement from './SvgTextElement';
import ForeignObjectElement from './ForeignObjectElement';
import { Orientation, NodeData, FIXME } from '../types/common';
import './style.css';

type NodeEventHandler = (id: string, evt: Event) => void;

type NodeProps = {
  nodeData: NodeData;
  nodeElement: {
    shape: string;
    baseProps: FIXME;
    branchNodeProps: FIXME;
    leafNodeProps: FIXME;
  };
  nodeLabelProps: FIXME;
  nodeLabelComponent?: FIXME;
  nodeSize: {
    x: number;
    y: number;
  };
  orientation: Orientation;
  transitionDuration: number;
  onClick: NodeEventHandler;
  onMouseOver: NodeEventHandler;
  onMouseOut: NodeEventHandler;
  textLayout: FIXME;
  subscriptions: object;
  allowForeignObjects: boolean;
  styles?: object;
};

type NodeState = {
  transform: string;
  initialStyle: { opacity: number };
};

export default class Node extends React.Component<NodeProps, NodeState> {
  static defaultProps = {
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

  private nodeRef: SVGGElement = null;

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

  shouldComponentUpdate(nextProps: NodeProps) {
    return this.shouldNodeTransform(this.props, nextProps);
  }

  shouldNodeTransform = (ownProps: NodeProps, nextProps: NodeProps) =>
    nextProps.subscriptions !== ownProps.subscriptions ||
    nextProps.nodeData.x !== ownProps.nodeData.x ||
    nextProps.nodeData.y !== ownProps.nodeData.y ||
    nextProps.orientation !== ownProps.orientation;

  setTransform(
    nodeData: NodeProps['nodeData'],
    orientation: NodeProps['orientation'],
    shouldTranslateToOrigin = false
  ) {
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

  applyTransform(
    transform: string,
    transitionDuration: NodeProps['transitionDuration'],
    opacity = 1,
    done = () => {}
  ) {
    if (transitionDuration === 0) {
      select(this.nodeRef)
        .attr('transform', transform)
        .style('opacity', opacity);
      done();
    } else {
      select(this.nodeRef)
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

  handleOnClick = evt => {
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
          this.nodeRef = n;
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
