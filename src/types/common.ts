export type FIXME = any

export type Orientation = 'horizontal' | 'vertical';

export type NodeData = {
  id: string,
  x: number,
  y: number,
  name: string
  attributes: Record<string, FIXME>
  parent?: NodeData,
  _children?: FIXME,
  _collapsed: boolean
}