import React, { SyntheticEvent } from 'react';
import { select, HierarchyPointNode } from 'd3';
import SvgTextElement from './SvgTextElement';
import ForeignObjectElement from './ForeignObjectElement';
import {
  Orientation,
  FIXME,
  NodeElement,
  PositionCoordinates,
  TreeNodeDatum,
} from '../types/common';
import './style.css';

type NodeEventHandler = (id: string, evt: SyntheticEvent) => void;

type NodeProps = {
  data: TreeNodeDatum;
  position: PositionCoordinates;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  nodeElement: NodeElement;
  nodeLabelProps: FIXME;
  nodeLabelComponent?: FIXME;
  nodeSize: {
    x: number;
    y: number;
  };
  orientation: Orientation;
  enableLegacyTransitions: boolean;
  transitionDuration: number;
  onClick: NodeEventHandler;
  onMouseOver: NodeEventHandler;
  onMouseOut: NodeEventHandler;
  subscriptions: object;
  allowForeignObjects: boolean;
};

type NodeState = {
  transform: string;
  initialStyle: { opacity: number };
};

export default class Node extends React.Component<NodeProps, NodeState> {
  static defaultProps = {
    nodeLabelComponent: null,
  };

  private nodeRef: SVGGElement = null;

  state = {
    transform: this.setTransform(
      this.props.position,
      this.props.parent,
      this.props.orientation,
      true
    ),
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
    nextProps.position.x !== ownProps.position.x ||
    nextProps.position.y !== ownProps.position.y ||
    nextProps.orientation !== ownProps.orientation;

  setTransform(
    position: NodeProps['position'],
    parent: NodeProps['parent'],
    orientation: NodeProps['orientation'],
    shouldTranslateToOrigin = false
  ) {
    if (shouldTranslateToOrigin) {
      const hasParent = parent !== null && parent !== undefined;
      const originX = hasParent ? parent.x : 0;
      const originY = hasParent ? parent.y : 0;
      return orientation === 'horizontal'
        ? `translate(${originY},${originX})`
        : `translate(${originX},${originY})`;
    }
    return orientation === 'horizontal'
      ? `translate(${position.y},${position.x})`
      : `translate(${position.x},${position.y})`;
  }

  applyTransform(
    transform: string,
    transitionDuration: NodeProps['transitionDuration'],
    opacity = 1,
    done = () => {}
  ) {
    if (this.props.enableLegacyTransitions) {
      select(this.nodeRef)
        .transition()
        .duration(transitionDuration)
        .attr('transform', transform)
        .style('opacity', opacity)
        .on('end', done);
    } else {
      select(this.nodeRef)
        .attr('transform', transform)
        .style('opacity', opacity);
      done();
    }
  }

  commitTransform() {
    const { orientation, transitionDuration, position, parent } = this.props;
    const transform = this.setTransform(position, parent, orientation);
    this.applyTransform(transform, transitionDuration);
  }

  renderNodeElement = () => {
    const { nodeElement, data } = this.props;
    const { tag, baseProps, leafNodeProps = {}, branchNodeProps = {} } = nodeElement;
    const elemProps = data._children
      ? { ...baseProps, ...branchNodeProps }
      : { ...baseProps, ...leafNodeProps };
    return tag === 'none' ? null : React.createElement(tag, elemProps);
  };

  renderNodeLabelElement = () => {
    const { allowForeignObjects, nodeLabelComponent, data, nodeSize, nodeLabelProps } = this.props;
    return allowForeignObjects && nodeLabelComponent ? (
      <ForeignObjectElement nodeData={data} nodeSize={nodeSize} {...nodeLabelComponent} />
    ) : (
      <SvgTextElement nameData={data.name} attributesData={data.attributes} {...nodeLabelProps} />
    );
  };

  handleOnClick = evt => {
    this.props.onClick(this.props.data.id, evt);
  };

  handleOnMouseOver = evt => {
    this.props.onMouseOver(this.props.data.id, evt);
  };

  handleOnMouseOut = evt => {
    this.props.onMouseOut(this.props.data.id, evt);
  };

  componentWillLeave(done) {
    const { orientation, transitionDuration, position, parent } = this.props;
    const transform = this.setTransform(position, parent, orientation, true);
    this.applyTransform(transform, transitionDuration, 0, done);
  }

  render() {
    const { data } = this.props;
    return (
      <g
        id={data.id}
        ref={n => {
          this.nodeRef = n;
        }}
        style={this.state.initialStyle}
        className={data._children ? 'nodeBase' : 'leafNodeBase'}
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
