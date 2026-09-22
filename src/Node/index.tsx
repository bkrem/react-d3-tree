import { memo } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import {
  CustomNodeElementProps,
  Orientation,
  Point,
  TreeNodeDatum,
  RenderCustomNodeElementFn,
} from '../types/common.js';
import DefaultNodeElement from './DefaultNodeElement.js';

type NodeEventHandler = (
  hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>,
  evt: SyntheticEvent
) => void;

type NodeProps = {
  data: TreeNodeDatum;
  position: Point;
  hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>;
  isCollapsed: boolean;
  nodeClassName: string;
  orientation: Orientation;
  renderCustomNodeElement?: RenderCustomNodeElementFn;
  onNodeToggle: (nodeId: string) => void;
  onNodeClick: NodeEventHandler;
  onNodeMouseOver: NodeEventHandler;
  onNodeMouseOut: NodeEventHandler;
};

/** A node with no children, including one with an empty `children` array. */
export const isLeafNode = (node: TreeNodeDatum) => !node.children || node.children.length === 0;

function Node({
  data,
  position,
  hierarchyPointNode,
  isCollapsed,
  nodeClassName,
  orientation,
  renderCustomNodeElement,
  onNodeToggle,
  onNodeClick,
  onNodeMouseOver,
  onNodeMouseOut,
}: NodeProps): ReactElement {
  const { id } = data;
  const isLeaf = isLeafNode(data);
  // A horizontal tree swaps the layout axes on screen.
  const transform =
    orientation === 'horizontal'
      ? `translate(${position.y},${position.x})`
      : `translate(${position.x},${position.y})`;
  const renderNode =
    typeof renderCustomNodeElement === 'function' ? renderCustomNodeElement : DefaultNodeElement;
  const nodeProps: CustomNodeElementProps = {
    id,
    depth: hierarchyPointNode.depth,
    isRoot: hierarchyPointNode.parent === null,
    isLeaf,
    isCollapsed,
    hierarchyPointNode,
    nodeDatum: data,
    toggleNode: () => onNodeToggle(id),
    onNodeClick: evt => onNodeClick(hierarchyPointNode, evt),
    onNodeMouseOver: evt => onNodeMouseOver(hierarchyPointNode, evt),
    onNodeMouseOut: evt => onNodeMouseOut(hierarchyPointNode, evt),
  };

  return (
    <g
      data-id={id}
      className={[isLeaf ? 'rd3t-leaf-node' : 'rd3t-node', nodeClassName].join(' ').trim()}
      transform={transform}
    >
      {renderNode(nodeProps)}
    </g>
  );
}

export default memo(Node);
