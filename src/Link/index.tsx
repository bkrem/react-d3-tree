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
  PathColorFunction,
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
  pathColorFunc?: PathColorFunction;
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
function getId(): string {
  _lastId++;
  return 'tree_link_id_' + _lastId;
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
      const a = 3;
      a;
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

  getLinkColor(): string[] | string | undefined | null {
    const { linkData, pathColorFunc, orientation } = this.props;

    if (typeof pathColorFunc === 'function') {
      return pathColorFunc(linkData, orientation);
    }

    return undefined;
  }

  getStrokeValue(linkColor, gradientId): string {
    if (Array.isArray(linkColor)) {
      return `url(#${gradientId})`;
    } else {
      return linkColor;
    }
  }

  getGradientDef(gradientId, linkData, gradientStartColor, gradientEndColor) {
    return (
      <defs>
        <linearGradient
          id={gradientId}
          y2={this.props.orientation === 'horizontal' ? '0%' : '100%'}
          x2={this.props.orientation === 'horizontal' ? '100%' : '0%'}
          gradientUnits={
            linkData.source.x === linkData.target.x ? 'userSpaceOnUse' : 'objectBoundingBox'
          }
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity={1} />
          <stop offset="100%" stopColor={gradientEndColor} stopOpacity={1} />
        </linearGradient>
      </defs>
    );
  }

  render() {
    const { linkData } = this.props;
    const gradientId = getId();
    const linkColor = this.getLinkColor();
    const pathStyle = { ...this.state.initialStyle };
    const [gradientStartColor, gradientEndColor] = Array.isArray(linkColor)
      ? linkColor
      : [undefined, undefined];

    if (gradientEndColor) {
      pathStyle['stroke'] = this.getStrokeValue(linkColor, gradientId);
    }
    return (
      <>
        <path
          ref={l => {
            this.linkRef = l;
          }}
          style={{ ...pathStyle }}
          className={this.getClassNames()}
          d={this.drawPath()}
          onClick={this.handleOnClick}
          onMouseOver={this.handleOnMouseOver}
          onMouseOut={this.handleOnMouseOut}
          data-source-id={linkData.source.id}
          data-target-id={linkData.target.id}
        />
        {gradientStartColor &&
          this.getGradientDef(gradientId, linkData, gradientStartColor, gradientEndColor)}
      </>
    );
  }
}
