import React, { SyntheticEvent } from 'react';
import { linkHorizontal, linkVertical } from 'd3-shape';
import { HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import {
  Orientation,
  TreeLinkDatum,
  PathFunctionOption,
  PathFunction,
  TreeNodeDatum,
  PathClassFunction,
} from '../types/common';

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

let _lastId = 0;
function getId() {
  _lastId++;
  return "tree_link_id_" + _lastId;
}

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

  drawDiagonalPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']) {
    const { source, target } = linkData;
    return orientation === 'horizontal'
      ? linkHorizontal()({
          source: [source.y, source.x],
          target: [target.y, target.x],
        })
      : linkVertical()({
          source: [source.x, source.y],
          target: [target.x, target.y],
        });
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

  getLinkColor(): ?Array<string> | ?string  {
    const { linkData, pathColorFunc } = this.props;
    let color = pathColorFunc;
    if (typeof pathColorFunc === 'function') {
      color = pathColorFunc(linkData);
    }

    return color;
  }

  shouldUseGradient(linkColor): boolean {
    return Array.isArray(linkColor);
  }

  getStrokeValue(linkColor, gradientId): string {
    if (this.shouldUseGradient(linkColor)) {
      return `url(#${gradientId})`;
    } else {
      return linkColor;
    }
  }

  render() {
    const { linkData, pathColorFunc } = this.props;
    const gradientId = getId();
    const linkColor = this.getLinkColor();
    const [gradientStartColor, gradientEndColor] = shouldUseGradient(linkColor) ? linkColor : [undefined, undefined];

    return (
      <>
      {shouldUseGradient() && <defs>
        <linearGradient x1={source.x} y1={source.y} x2={target.x} y2={target.y} id={gradientId} gradientUnits="userStepOnUse">
        <stop offset="0%" stopColor={gradientStartColor} stopOpacity={1} />
        <stop offset="100%" stopColor={gradientEndColor} stopOpacity={1} />
        </linearGradient>
      </defs>}
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
          data-source-id={linkData.source.id}
          data-target-id={linkData.target.id}
          stroke={this.getStrokeValue(linkColor, gradientId)}
        />
      </>
    );
  }
}
