import React, { SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';

import { Orientation, Point, TreeNodeDatum, RenderCustomNodeElementFn } from '../types/common';
import DefaultNodeElement from './DefaultNodeElement';

type NodeEventHandler = (id: string, evt: SyntheticEvent) => void;

type NodeProps = {
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  nodeClassName: string;
  nodeSize: {
    x: number;
    y: number;
  };
  orientation: Orientation;
  enableLegacyTransitions: boolean;
  transitionDuration: number;
  renderCustomNodeElement: RenderCustomNodeElementFn;
  onNodeToggle: (nodeId: string) => void;
  onNodeClick: NodeEventHandler;
  onNodeMouseOver: NodeEventHandler;
  onNodeMouseOut: NodeEventHandler;
  subscriptions: object;
};

type NodeState = {
  transform: string;
  initialStyle: { opacity: number };
};

export default class Node extends React.Component<NodeProps, NodeState> {
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

  // TODO: needs tests
  renderNodeElement = () => {
    const { data, renderCustomNodeElement } = this.props;
    if (typeof renderCustomNodeElement === 'function') {
      return renderCustomNodeElement({ nodeDatum: data, toggleNode: this.handleNodeToggle });
    }

    return DefaultNodeElement({
      nodeDatum: data,
      toggleNode: this.handleNodeToggle,
      onNodeClick: this.handleOnClick,
      onNodeMouseOver: this.handleOnMouseOver,
      onNodeMouseOut: this.handleOnMouseOut,
    });
  };

  handleNodeToggle = () => this.props.onNodeToggle(this.props.data.__rd3t.id);

  handleOnClick = evt => {
    this.props.onNodeClick(this.props.data.__rd3t.id, evt);
  };

  handleOnMouseOver = evt => {
    this.props.onNodeMouseOver(this.props.data.__rd3t.id, evt);
  };

  handleOnMouseOut = evt => {
    this.props.onNodeMouseOut(this.props.data.__rd3t.id, evt);
  };

  componentWillLeave(done) {
    const { orientation, transitionDuration, position, parent } = this.props;
    const transform = this.setTransform(position, parent, orientation, true);
    this.applyTransform(transform, transitionDuration, 0, done);
  }

  render() {
    const { data, nodeClassName } = this.props;
    return (
      <g
        id={data.__rd3t.id}
        ref={n => {
          this.nodeRef = n;
        }}
        style={this.state.initialStyle}
        className={[data.children ? 'rd3t-node' : 'rd3t-leaf-node', nodeClassName].join(' ').trim()}
        transform={this.state.transform}
      >
        {this.renderNodeElement()}
      </g>
    );
  }
}
