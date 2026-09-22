import React, { SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import {
  Orientation,
  TreeLinkDatum,
  PathFunctionOption,
  PathFunction,
  TreeNodeDatum,
  PathClassFunction,
} from '../types/common.js';

type LinkEventHandler = (
  source: HierarchyPointNode<TreeNodeDatum>,
  target: HierarchyPointNode<TreeNodeDatum>,
  evt: SyntheticEvent
) => void;

interface LinkProps {
  linkData: TreeLinkDatum;
  orientation: Orientation;
  pathFunc: PathFunctionOption | PathFunction;
  pathClassFunc?: PathClassFunction;
  enableLegacyTransitions: boolean;
  transitionDuration: number;
  onClick: LinkEventHandler;
  onMouseOver: LinkEventHandler;
  onMouseOut: LinkEventHandler;
}

type LinkState = {
  initialStyle: { opacity: number };
};

export default class Link extends React.PureComponent<LinkProps, LinkState> {
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
    if (this.props.enableLegacyTransitions) {
      select(this.linkRef)
        // @ts-ignore
        .transition()
        .duration(transitionDuration)
        .style('opacity', opacity)
        .on('end', done);
    } else {
      select(this.linkRef).style('opacity', opacity);
      done();
    }
  }

  drawStepPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']) {
    const { source, target } = linkData;
    const deltaY = target.y - source.y;
    return orientation === 'horizontal'
      ? `M${source.y},${source.x} H${source.y + deltaY / 2} V${target.x} H${target.y}`
      : `M${source.x},${source.y} V${source.y + deltaY / 2} H${target.x} V${target.y}`;
  }

  // A cubic Bézier whose control points sit halfway along the depth axis: the same curve
  // d3-shape's `linkHorizontal` and `linkVertical` draw, with the same number formatting.
  drawDiagonalPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']) {
    const { source, target } = linkData;
    if (orientation === 'horizontal') {
      const mid = (source.y + target.y) / 2;
      return `M${source.y},${source.x}C${mid},${source.x},${mid},${target.x},${target.y},${target.x}`;
    }
    const mid = (source.y + target.y) / 2;
    return `M${source.x},${source.y}C${source.x},${mid},${target.x},${mid},${target.x},${target.y}`;
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

  getClassNames() {
    const { linkData, orientation, pathClassFunc } = this.props;
    const classNames = ['rd3t-link'];

    if (typeof pathClassFunc === 'function') {
      classNames.push(pathClassFunc(linkData, orientation));
    }

    return classNames.join(' ').trim();
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
    const { linkData } = this.props;
    return (
      <path
        ref={l => {
          this.linkRef = l;
        }}
        style={{ ...this.state.initialStyle }}
        className={this.getClassNames()}
        d={this.drawPath()}
        onClick={this.handleOnClick}
        onMouseOver={this.handleOnMouseOver}
        onMouseOut={this.handleOnMouseOut}
        data-source-id={linkData.source.data ? linkData.source.data.__rd3t.id : linkData.source.id}
        data-target-id={linkData.target.data ? linkData.target.data.__rd3t.id : linkData.target.id}
      />
    );
  }
}
