import React, { SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';

import { Orientation, Point, TreeNodeDatum, RenderCustomNodeElementFn } from '../types/common';
import './style.css';
import DefaultNodeElement from './DefaultNodeElement';

type NodeEventHandler = (id: string, evt: SyntheticEvent) => void;

type NodeProps = {
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  nodeSize: {
    x: number;
    y: number;
  };
  orientation: Orientation;
  enableLegacyTransitions: boolean;
  transitionDuration: number;
  renderCustomNodeElement: RenderCustomNodeElementFn;
  onClick: NodeEventHandler;
  onMouseOver: NodeEventHandler;
  onMouseOut: NodeEventHandler;
  subscriptions: object;
};

type NodeState = {
  transform: string;
  initialStyle: { opacity: number };
};

export default class Node extends React.Component<NodeProps, NodeState> {
  static defaultProps = {
    renderCustomNodeElement: (nodeDatum: TreeNodeDatum) => DefaultNodeElement({ nodeDatum }),
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
        // @ts-ignore
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
    const { data, renderCustomNodeElement } = this.props;
    return (
      <g
        id={data.id}
        ref={n => {
          this.nodeRef = n;
        }}
        style={this.state.initialStyle}
        className={data._children ? 'rd3t-node' : 'rd3t-leaf-node'}
        transform={this.state.transform}
        onClick={this.handleOnClick}
        onMouseOver={this.handleOnMouseOver}
        onMouseOut={this.handleOnMouseOut}
      >
        {renderCustomNodeElement(data)}
      </g>
    );
  }
}
