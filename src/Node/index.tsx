import { memo } from 'react';
import type { SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import {
  CustomNodeElementProps,
  Orientation,
  Point,
  TreeNodeDatum,
  RawNodeDatum,
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
  nodeClassName: string;
  orientation: Orientation;
  renderCustomNodeElement?: RenderCustomNodeElementFn;
  onNodeToggle: (nodeId: string) => void;
  onNodeClick: NodeEventHandler;
  onNodeMouseOver: NodeEventHandler;
  onNodeMouseOut: NodeEventHandler;
  handleAddChildrenToNode: (nodeId: string, children: RawNodeDatum[]) => void;
};

function Node({
  data,
  position,
  hierarchyPointNode,
  nodeClassName,
  orientation,
  renderCustomNodeElement,
  onNodeToggle,
  onNodeClick,
  onNodeMouseOver,
  onNodeMouseOut,
  handleAddChildrenToNode,
}: NodeProps) {
  const id = data.__rd3t.id;
  // A horizontal tree swaps the layout axes on screen.
  const transform =
    orientation === 'horizontal'
      ? `translate(${position.y},${position.x})`
      : `translate(${position.x},${position.y})`;
  const renderNode =
    typeof renderCustomNodeElement === 'function' ? renderCustomNodeElement : DefaultNodeElement;
  const nodeProps: CustomNodeElementProps = {
    hierarchyPointNode,
    nodeDatum: data,
    toggleNode: () => onNodeToggle(id),
    onNodeClick: evt => onNodeClick(hierarchyPointNode, evt),
    onNodeMouseOver: evt => onNodeMouseOver(hierarchyPointNode, evt),
    onNodeMouseOut: evt => onNodeMouseOut(hierarchyPointNode, evt),
    addChildren: children => handleAddChildrenToNode(id, children),
  };

  return (
    <g
      id={id}
      className={[
        data.children && data.children.length > 0 ? 'rd3t-node' : 'rd3t-leaf-node',
        nodeClassName,
      ]
        .join(' ')
        .trim()}
      transform={transform}
    >
      {renderNode(nodeProps)}
    </g>
  );
}

export default memo(Node);
