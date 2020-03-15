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
import { Transition } from 'react-transition-group';
import { AnimationContext } from '../Tree/AnimationContext';

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
  transitionDuration: number;
  onClick: NodeEventHandler;
  onMouseOver: NodeEventHandler;
  onMouseOut: NodeEventHandler;
  subscriptions: object;
  allowForeignObjects: boolean;
};

type NodeState = {
  in: boolean;
  transform: string;
  initialStyle: { opacity: number };
};

export default class Node extends React.Component<NodeProps, NodeState> {
  static defaultProps = {
    nodeLabelComponent: null,
  };

  private nodeRef: SVGGElement = null;

  // private transitionStyles = {
  //   entering: () => ({
  //     transform: this.setTransform(
  //       this.props.position,
  //       this.props.parent,
  //       this.props.orientation,
  //       true
  //     ),
  //     opacity: 1,
  //   }),
  //   entered: () => ({
  //     transform: this.setTransform(this.props.position, this.props.parent, this.props.orientation),
  //     opacity: 1,
  //   }),
  //   exiting: () => ({
  //     transform: this.setTransform(
  //       this.props.position,
  //       this.props.parent,
  //       this.props.orientation,
  //       true
  //     ),
  //     opacity: 0,
  //   }),
  //   exited: () => ({
  //     transform: this.setTransform(
  //       this.props.position,
  //       this.props.parent,
  //       this.props.orientation,
  //       true
  //     ),
  //     opacity: 0,
  //   }),
  // };

  state = {
    in: true,
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

  private triggerNodeCollapse = null;

  componentDidMount() {
    // this.setState({ in: true });
    // this.commitTransform();
    document.addEventListener('click', this.handleCollapsingParent);
  }

  handleCollapsingParent = () => {
    const { parent } = this.props;
    if (parent) {
      const parentEl = document.getElementById(parent.data.id);
      if (parentEl.dataset.isCollapsing === '1') {
        console.log(this.props.data.name, ': PARENT IS COLLAPSING');
        this.setState({ in: false }, () => {
          const { orientation, transitionDuration, position, parent } = this.props;
          const transform = this.setTransform(position, parent, orientation, true);
          this.applyTransform(transform, transitionDuration, 0);
        });
      } else if (parentEl.dataset.isCollapsing === '0') {
        console.log(this.props.data.name, ': PARENT IS EXPANDING');
        this.setState({ in: true });
      }
    }
  };

  componentDidUpdate() {
    // this.commitTransform();
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
        .on('end', done);
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
    const { data } = this.props;
    // const elem = document.getElementById(data.id);
    // console.log('isCollapsed?: ', data._collapsed)
    if (!data._collapsed) {
      this.triggerNodeCollapse(data.id);
    }
    this.props.onClick(this.props.data.id, evt);
  };

  handleOnMouseOver = evt => {
    this.props.onMouseOver(this.props.data.id, evt);
  };

  handleOnMouseOut = evt => {
    this.props.onMouseOut(this.props.data.id, evt);
  };

  componentWillUnmount() {
    console.log('------------ WILL UNMOUNT -----------', this.props.data.name);
    // const { orientation, transitionDuration, position, parent } = this.props;
    // const transform = this.setTransform(position, parent, orientation, true);
    // this.applyTransform(transform, transitionDuration, 0);
  }

  handleParentCollapse = () => {
    console.log('COLLAPSE CALLBACK ++++++++++++', this.props.data.id);
    this.setState({ in: false });
  };

  render() {
    const { data, transitionDuration } = this.props;
    return (
      <AnimationContext.Consumer>
        {animContext => (
          <Transition
            in={this.state.in}
            timeout={transitionDuration}
            appear
            unmountOnExit
            onEnter={() => {
              this.triggerNodeCollapse = animContext.triggerNodeCollapse;
              animContext.registerTreeNodeId(data.id, () => {
                if (this.props.parent) {
                  animContext.subscribeToParentNode(
                    this.props.parent.data.id,
                    this.handleParentCollapse
                  );
                }
              });
              // console.log('PARENT: ', this.props.parent);
              this.commitTransform();
            }}
            onEntered={() => {
              console.log(animContext);
            }}
            onExit={() => {
              console.log('++++++++++++ WILL EXIT +++++++++++++');
              const { orientation, transitionDuration, position, parent } = this.props;
              const transform = this.setTransform(position, parent, orientation, true);
              this.applyTransform(transform, transitionDuration, 0);
            }}
          >
            {transitionState => {
              console.log('transitionState:', transitionState, data.name);
              return (
                <g
                  id={data.id}
                  ref={n => {
                    this.nodeRef = n;
                  }}
                  // style={
                  //   {
                  //     ...this.state.initialStyle,
                  //     opacity: this.transitionStyles[transitionState]().opacity,
                  //   }
                  // }
                  className={data._children ? 'nodeBase' : 'leafNodeBase'}
                  // transform={this.transitionStyles[transitionState]().transform}
                  onClick={this.handleOnClick}
                  onMouseOver={this.handleOnMouseOver}
                  onMouseOut={this.handleOnMouseOut}
                >
                  {this.renderNodeElement()}
                  {this.renderNodeLabelElement()}
                </g>
              );
            }}
          </Transition>
        )}
      </AnimationContext.Consumer>
    );
  }
}
