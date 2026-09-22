import { memo } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
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
  onClick: LinkEventHandler;
  onMouseOver: LinkEventHandler;
  onMouseOut: LinkEventHandler;
}

function drawStepPath({ source, target }: TreeLinkDatum, orientation: Orientation) {
  const deltaY = target.y - source.y;
  return orientation === 'horizontal'
    ? `M${source.y},${source.x} H${source.y + deltaY / 2} V${target.x} H${target.y}`
    : `M${source.x},${source.y} V${source.y + deltaY / 2} H${target.x} V${target.y}`;
}

// A cubic Bézier whose control points sit halfway along the depth axis: the same curve
// d3-shape's `linkHorizontal` and `linkVertical` draw, with the same number formatting.
function drawDiagonalPath({ source, target }: TreeLinkDatum, orientation: Orientation) {
  const mid = (source.y + target.y) / 2;
  return orientation === 'horizontal'
    ? `M${source.y},${source.x}C${mid},${source.x},${mid},${target.x},${target.y},${target.x}`
    : `M${source.x},${source.y}C${source.x},${mid},${target.x},${mid},${target.x},${target.y}`;
}

function drawStraightPath({ source, target }: TreeLinkDatum, orientation: Orientation) {
  return orientation === 'horizontal'
    ? `M${source.y},${source.x}L${target.y},${target.x}`
    : `M${source.x},${source.y}L${target.x},${target.y}`;
}

function drawElbowPath({ source, target }: TreeLinkDatum, orientation: Orientation) {
  return orientation === 'horizontal'
    ? `M${source.y},${source.x}V${target.x}H${target.y}`
    : `M${source.x},${source.y}V${target.y}H${target.x}`;
}

function drawPath(
  linkData: TreeLinkDatum,
  orientation: Orientation,
  pathFunc: PathFunctionOption | PathFunction
) {
  if (typeof pathFunc === 'function') {
    return pathFunc(linkData, orientation);
  }
  switch (pathFunc) {
    case 'elbow':
      return drawElbowPath(linkData, orientation);
    case 'straight':
      return drawStraightPath(linkData, orientation);
    case 'step':
      return drawStepPath(linkData, orientation);
    default:
      return drawDiagonalPath(linkData, orientation);
  }
}

function getClassNames(
  linkData: TreeLinkDatum,
  orientation: Orientation,
  pathClassFunc?: PathClassFunction
) {
  const classNames = ['rd3t-link'];
  if (typeof pathClassFunc === 'function') {
    classNames.push(pathClassFunc(linkData, orientation));
  }
  return classNames.join(' ').trim();
}

function Link({
  linkData,
  orientation,
  pathFunc,
  pathClassFunc,
  onClick,
  onMouseOver,
  onMouseOut,
}: LinkProps): ReactElement {
  const { source, target } = linkData;
  return (
    <path
      className={getClassNames(linkData, orientation, pathClassFunc)}
      d={drawPath(linkData, orientation, pathFunc)}
      onClick={evt => onClick(source, target, evt)}
      onMouseOver={evt => onMouseOver(source, target, evt)}
      onMouseOut={evt => onMouseOut(source, target, evt)}
      data-source-id={source.data.__rd3t.id}
      data-target-id={target.data.__rd3t.id}
    />
  );
}

export default memo(Link);
