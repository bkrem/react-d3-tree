export type FIXME = any;

export type Orientation = 'horizontal' | 'vertical';

export type TreeNode = {
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNode[];
  nodeElement: NodeElement;
  _collapsed?: boolean;
};

export type InternalNodeProperties = {
  id: string;
  depth: number;
  x: number;
  y: number;
  parent?: EnhancedTreeNode;
  _collapsed: boolean;
  _children?: EnhancedTreeNode[];
};

export type EnhancedTreeNode = TreeNode & InternalNodeProperties;

export type TreeLink = {
  source: EnhancedTreeNode;
  target: EnhancedTreeNode;
};

export type PathFunctionOption = 'diagonal' | 'elbow' | 'straight' | 'step';
export type PathFunction = (linkData: TreeLink, orientation: Orientation) => string;

export type NodeElement = {
  tag: string;
  baseProps: Record<string, FIXME>;
  branchNodeProps?: Record<string, FIXME>;
  leafNodeProps?: Record<string, FIXME>;
};
