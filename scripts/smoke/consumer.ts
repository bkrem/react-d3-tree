// Type-checked from a CommonJS and from an ES module file by scripts/smoke-test.js.
import Tree, { Tree as NamedTree } from 'react-d3-tree';
import type { RawNodeDatum, TreeProps } from 'react-d3-tree';

const data: RawNodeDatum = { name: 'root', children: [{ name: 'leaf' }] };
const props: TreeProps = { data, orientation: 'vertical' };

export const same: typeof NamedTree = Tree;
export { props };
