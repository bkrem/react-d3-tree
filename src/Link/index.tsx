import React, { SyntheticEvent } from 'react';
import { select, linkHorizontal, linkVertical, HierarchyPointNode } from 'd3';
import {
  Orientation,
  TreeLink,
  PathFunctionOption,
  PathFunction,
  TreeNodeDatum,
} from '../types/common';
import './style.css';

type LinkEventHandler = (
  source: HierarchyPointNode<TreeNodeDatum>,
  target: HierarchyPointNode<TreeNodeDatum>,
  evt: SyntheticEvent
) => void;

type LinkProps = {
  linkData: TreeLink;
  orientation: Orientation;
  pathFunc: PathFunctionOption | PathFunction;
  transitionDuration: number;
  onClick: LinkEventHandler;
  onMouseOver: LinkEventHandler;
  onMouseOut: LinkEventHandler;
  styles?: object;
};

type LinkState = {
  initialStyle: { opacity: number };
};

export default class Link extends React.PureComponent<LinkProps, LinkState> {
  static defaultProps = {
    styles: {},
  };

  private linkRef: SVGPathElement = null;

  state = {
    initialStyle: {
      opacity: 0,
    },
  };

  componentDidMount() {
    this.applyOpacity(1, this.props.transitionDuration);
  }

  componentWillLeave(done) {
    this.applyOpacity(0, this.props.transitionDuration, done);
  }

  applyOpacity(
    opacity: number,
    transitionDuration: LinkProps['transitionDuration'],
    done = () => {}
  ) {
    if (transitionDuration === 0) {
      select(this.linkRef).style('opacity', opacity);
      done();
    } else {
      select(this.linkRef)
        .transition()
        .duration(transitionDuration)
        .style('opacity', opacity)
        .on('end', done);
    }
  }

  drawStepPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']) {
    const { source, target } = linkData;
    const deltaY = target.y - source.y;
    return orientation === 'horizontal'
      ? `M${source.y},${source.x} H${source.y + deltaY / 2} V${target.x} H${target.y}`
      : `M${source.x},${source.y} V${source.y + deltaY / 2} H${target.x} V${target.y}`;
  }

  drawDiagonalPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']) {
    const { source, target } = linkData;
    return orientation === 'horizontal'
      ? linkHorizontal()({ source: [source.y, source.x], target: [target.y, target.x] })
      : linkVertical()({ source: [source.x, source.y], target: [target.x, target.y] });
  }

  drawStraightPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']) {
    const { source, target } = linkData;
    return orientation === 'horizontal'
      ? `M${source.y},${source.x}L${target.y},${target.x}`
      : `M${source.x},${source.y}L${target.x},${target.y}`;
  }

  drawElbowPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']) {
    return orientation === 'horizontal'
      ? `M${linkData.source.y},${linkData.source.x}V${linkData.target.x}H${linkData.target.y}`
      : `M${linkData.source.x},${linkData.source.y}V${linkData.target.y}H${linkData.target.x}`;
  }

  drawPath() {
    const { linkData, orientation, pathFunc } = this.props;

    if (typeof pathFunc === 'function') {
      return pathFunc(linkData, orientation);
    }
    if (pathFunc === 'elbow') {
      return this.drawElbowPath(linkData, orientation);
    }
    if (pathFunc === 'straight') {
      return this.drawStraightPath(linkData, orientation);
    }
    if (pathFunc === 'step') {
      return this.drawStepPath(linkData, orientation);
    }
    return this.drawDiagonalPath(linkData, orientation);
  }

  handleOnClick = evt => {
    this.props.onClick(this.props.linkData.source, this.props.linkData.target, evt);
  };

  handleOnMouseOver = evt => {
    this.props.onMouseOver(this.props.linkData.source, this.props.linkData.target, evt);
  };

  handleOnMouseOut = evt => {
    this.props.onMouseOut(this.props.linkData.source, this.props.linkData.target, evt);
  };

  render() {
    const { linkData, styles } = this.props;
    return (
      <path
        ref={l => {
          this.linkRef = l;
        }}
        style={{ ...this.state.initialStyle, ...styles }}
        className="linkBase"
        d={this.drawPath()}
        onClick={this.handleOnClick}
        onMouseOver={this.handleOnMouseOver}
        onMouseOut={this.handleOnMouseOut}
        data-source-id={linkData.source.id}
        data-target-id={linkData.target.id}
      />
    );
  }
}
