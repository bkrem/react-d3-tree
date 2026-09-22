<h1 align="center">React D3 Tree</h1>

<p align="center">
  <a href="#buildstatus">
    <img alt="build status" src="https://github.com/bkrem/react-d3-tree/workflows/Build/badge.svg">
  </a>
  <a href="https://www.npmjs.com/package/react-d3-tree">
    <img alt="npm package" src="https://img.shields.io/npm/v/react-d3-tree?style=flat">
  </a>
  <a href="https://www.npmjs.com/package/react-d3-tree">
    <img alt="npm package: downloads monthly" src="https://img.shields.io/npm/dm/react-d3-tree.svg">
  </a>
  <a href="https://bundlephobia.com/result?p=react-d3-tree">
    <img alt="npm package: minzipped size" src="https://img.shields.io/bundlephobia/minzip/react-d3-tree">
  </a>
  <a href="https://www.npmjs.com/package/react-d3-tree">
    <img alt="npm package: types" src="https://img.shields.io/npm/types/react-d3-tree">
  </a>
  <a href="https://oxc.rs/docs/guide/usage/formatter">
    <img alt="code style: oxfmt" src="https://img.shields.io/badge/code_style-oxfmt-0d6efd.svg">
  </a>
</p>

<p align="center">
  <h3 align="center"><a href="https://bkrem.github.io/react-d3-tree">👾 Playground</a></h3>
  <h3 align="center"><a href="https://bkrem.github.io/react-d3-tree/docs">📖 API Documentation</a></h3>
</p>

React D3 Tree is a [React](https://react.dev/) component that lets you represent hierarchical data (e.g. family trees, org charts, file directories) as an interactive tree graph with minimal setup, by leveraging [D3](https://d3js.org/)'s `tree` layout.

> **Upgrading from v3? See the [migration guide](https://github.com/bkrem/react-d3-tree/blob/master/MIGRATION.md).** The hosted API documentation describes v3 until 4.0.0 is released.

> **[Legacy v1 docs](https://github.com/bkrem/react-d3-tree/tree/v1)**

## Contents <!-- omit in toc -->
- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Working with the default Tree](#working-with-the-default-tree)
  - [Providing `data`](#providing-data)
  - [Node ids](#node-ids)
  - [Styling Nodes](#styling-nodes)
  - [Styling Links](#styling-links)
  - [Event Handlers](#event-handlers)
- [Collapse state](#collapse-state)
- [Centering and the ref handle](#centering-and-the-ref-handle)
- [Customizing the Tree](#customizing-the-tree)
  - [`renderCustomNodeElement`](#rendercustomnodeelement)
  - [`pathFunc`](#pathfunc)
    - [Providing your own `pathFunc`](#providing-your-own-pathfunc)
- [Development](#development)
  - [Setup](#setup)
  - [Hot reloading](#hot-reloading)
- [Contributors](#contributors)

## Installation
```bash
npm i --save react-d3-tree
```

The package needs React 18 or 19 and ships as ES modules only. `import` works everywhere;
`require()` works on Node 22.12 or later. For Jest and TypeScript CommonJS setups, see the
[migration guide](https://github.com/bkrem/react-d3-tree/blob/master/MIGRATION.md#requirements).

## Usage
```jsx
import Tree from 'react-d3-tree';

// This is a simplified example of an org chart with a depth of 2.
// Note how deeper levels are defined recursively via the `children` property.
const orgChart = {
  name: 'CEO',
  children: [
    {
      name: 'Manager',
      attributes: {
        department: 'Production',
      },
      children: [
        {
          name: 'Foreman',
          attributes: {
            department: 'Fabrication',
          },
          children: [
            {
              name: 'Worker',
            },
          ],
        },
        {
          name: 'Foreman',
          attributes: {
            department: 'Assembly',
          },
          children: [
            {
              name: 'Worker',
            },
          ],
        },
      ],
    },
  ],
};

export default function OrgChartTree() {
  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
    <div id="treeWrapper" style={{ width: '50em', height: '20em' }}>
      <Tree data={orgChart} />
    </div>
  );
}
```

## Props
For details on all props accepted by `Tree`, check out the [`TreeProps` reference docs](https://bkrem.github.io/react-d3-tree/docs).

The only required prop is `data`, all other props on `Tree` are optional with a documented default.

## Working with the default Tree
`react-d3-tree` provides default implementations for `Tree`'s nodes & links, which are intended to get you up & running with a working tree quickly.

This section is focused on explaining **how to provide data, styles and event handlers for the default `Tree` implementation**.

> Need more fine-grained control over how nodes & links appear/behave? Check out the [Customizing the Tree](#customizing-the-tree) section below.

### Providing `data`
`Tree` expects the root node in `data` and every node below it to implement the `RawNodeDatum` interface:

```ts
interface RawNodeDatum {
  id?: string;
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
}
```

The `orgChart` example in the [Usage](#usage) section above is an example of this:

- Every node has at least a `name`. This is rendered as the **node's primary label**.
- Some nodes have `attributes` defined (the `CEO` node does not). **The key-value pairs in `attributes` are rendered as a list of secondary labels**.
- Nodes can have further `RawNodeDatum` objects nested inside them via the `children` key, creating a hierarchy from which the tree graph can be generated.

The tree never changes your `data`. It works on its own copy, so you can keep `data` in React state and replace it whenever your source changes.

### Node ids
Every node has an id. Use the `id` field to supply your own; a node without one gets its path in the tree: `"0"` for the root, `"0.0"` and `"0.1"` for its children, and so on. Ids drive collapse state, React keys, and the DOM: each node's `<g>` carries `data-id`, and each link's `<path>` carries `data-source-id` and `data-target-id`.

Path ids stay stable as long as the structure does. Supply ids when nodes move between updates.

### Styling Nodes
`Tree` provides the following props to style different types of nodes, all of which use an SVG `circle` by default:

- `rootNodeClassName` - applied to the root node.
- `branchNodeClassName` - applied to any node with 1+ children.
- `leafNodeClassName` - applied to any node without children (an empty `children` array counts as no children).

To visually distinguish these three types of nodes from each other by color, we could provide each with their own class:

```css
/* custom-tree.css */

.node__root > circle {
  fill: red;
}

.node__branch > circle {
  fill: yellow;
}

.node__leaf > circle {
  fill: green;
  /* Let's also make the radius of leaf nodes larger */
  r: 40;
}
```

```jsx
import Tree from 'react-d3-tree';
import './custom-tree.css';

// ...

export default function StyledNodesTree() {
  return (
    <div id="treeWrapper" style={{ width: '50em', height: '20em' }}>
      <Tree
        data={data}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
      />
    </div>
  );
}
```

The `svg` element carries the `rd3t-svg` class plus anything you pass in `svgClassName`; the group that zooms and pans carries `rd3t-g`.

### Styling Links
`Tree` provides the `pathClassFunc` property to pass additional classNames to every link to be rendered.

Each link calls `pathClassFunc` with its own `TreeLinkDatum` and the tree's current `orientation`. `Tree` expects `pathClassFunc` to return a `className` string.

```jsx
function StyledLinksTree() {
  const getDynamicPathClass = ({ source, target }, orientation) => {
    if (!target.children) {
      // Target node has no children -> this link leads to a leaf node.
      return 'link__to-leaf';
    }

    // Style it as a link connecting two branch nodes by default.
    return 'link__to-branch';
  };

  return (
    <Tree
      data={data}
      // Statically apply same className(s) to all links
      pathClassFunc={() => 'custom-link'}
      // Want to apply multiple static classes? `Array.join` is your friend :)
      pathClassFunc={() => ['custom-link', 'extra-custom-link'].join(' ')}
      // Dynamically determine which `className` to pass based on the link's properties.
      pathClassFunc={getDynamicPathClass}
    />
  );
}
```

### Event Handlers
`Tree` exposes the following event handler callbacks by default:

- `onLinkClick`
- `onLinkMouseOut`
- `onLinkMouseOver`
- `onNodeClick`
- `onNodeMouseOut`
- `onNodeMouseOver`

Each receives the tree's own layout node (`HierarchyPointNode<TreeNodeDatum>`) and the React event. Read the node; copy what you keep, because its coordinates are stale after the next layout.

Two more callbacks report state:

- `onTransformChange` fires with `{ x, y, k }` on every zoom, pan, and programmatic transform.
- `onCollapsedChange` fires with the new set of collapsed ids and the change that caused it on every toggle.

> **Note:** Nodes are expanded/collapsed whenever `onNodeClick` fires. To prevent this, set the `collapsible` prop to `false`.
> `onNodeClick` will still fire, but it will not change the target node's expanded/collapsed state.

## Collapse state
By default the tree owns the collapse state. `initialDepth` sets which nodes start collapsed, a click toggles a node, and the state survives `data` updates for the nodes that are still there; nodes that a `data` update introduces follow the `initialDepth` rule. To start fresh for a new dataset, remount the tree with a `key`:

```jsx
<Tree key={datasetId} data={data} initialDepth={1} />
```

To drive the state from outside, pass `collapsed` and handle `onCollapsedChange`. The tree then renders exactly that set and reports every requested change without changing anything itself:

```jsx
function ControlledTree() {
  const [collapsed, setCollapsed] = useState(() => new Set());
  return <Tree data={data} collapsed={collapsed} onCollapsedChange={setCollapsed} />;
}
```

Only nodes with children collapse; a click on a leaf changes nothing.

## Centering and the ref handle
The tree measures its own container. Pass `centerOnClick` to center a node when it is clicked, and `centeringTransitionDuration` to set the animation length (0 applies the change at once).

For everything else, hold a ref. `TreeHandle` exposes `centerNode`, `toggleNode`, `expandAll`, `collapseAll`, `expandToDepth`, `setTransform`, and `getTransform`:

```jsx
function TreeWithControls() {
  const tree = useRef(null);
  return (
    <>
      <button onClick={() => tree.current.collapseAll()}>Collapse all</button>
      <button onClick={() => tree.current.centerNode('0', { duration: 300 })}>Go to root</button>
      <Tree ref={tree} data={data} />
    </>
  );
}
```

Programmatic transforms report through `onTransformChange` like a user zoom, and `toggleNode` on the handle works even when `collapsible` is false.

## Customizing the Tree

### `renderCustomNodeElement`
The `renderCustomNodeElement` prop accepts a **custom render function that will be used for every node in the tree.**

The function receives `CustomNodeElementProps`: the node's `id`, `depth`, `isRoot`, `isLeaf`, and `isCollapsed`, its `nodeDatum` and `hierarchyPointNode`, a `toggleNode` function, and the `onNodeClick`, `onNodeMouseOver`, and `onNodeMouseOut` handlers to wire onto your own elements.

Cases where you may find rendering your own `Node` element useful include:

- Using a **different SVG tag for your nodes** (instead of the default `<circle>`).
- Gaining **fine-grained control over event handling** (e.g. to implement events not covered by the default API).
- Building **richer & more complex nodes/labels** by leveraging the `foreignObject` tag to render HTML inside the SVG namespace. Pass `hasInteractiveNodes` so that inputs inside a node don't start a drag or zoom.

```jsx
const renderNode = ({ nodeDatum, isCollapsed, isLeaf, toggleNode }) => (
  <g onClick={toggleNode}>
    <rect width={40} height={20} x={-20} y={-10} fill={isLeaf ? 'white' : 'lightgrey'} />
    <text dy="0.3em" textAnchor="middle">
      {nodeDatum.name}{isCollapsed ? ' +' : ''}
    </text>
  </g>
);

<Tree data={data} renderCustomNodeElement={renderNode} />;
```

### `pathFunc`
The `pathFunc` prop accepts a predefined `PathFunctionOption` enum or a user-defined `PathFunction`.

By changing or providing your own `pathFunc`, you are able to change how links between nodes of the tree (which are SVG `path` tags under the hood) are drawn.

The currently available enums are:
- `diagonal` (default)
- `elbow`
- `straight`
- `step`

> Want to see how each option looks? [Try them out on the playground](https://bkrem.github.io/react-d3-tree).

#### Providing your own `pathFunc`
If none of the available path functions suit your needs, you're also able to provide a custom `PathFunction`:

```jsx
function CustomPathFuncTree() {
  const straightPathFunc = (linkDatum, orientation) => {
    const { source, target } = linkDatum;
    return orientation === 'horizontal'
      ? `M${source.y},${source.x}L${target.y},${target.x}`
      : `M${source.x},${source.y}L${target.x},${target.y}`;
  };

  return (
    <Tree
      data={data}
      // Passing `straight` function as a custom `PathFunction`.
      pathFunc={straightPathFunc}
    />
  );
}
```

## Development
### Setup
The library uses [pnpm](https://pnpm.io/installation) 12. Development needs Node.js 22.22.2 or later, or 24.15 or later; `.nvmrc` names the major that CI uses. The version is pinned in the `packageManager` field of `package.json`. If a globally installed pnpm 10 fails with `Failed to switch pnpm to v12`, upgrade the global pnpm to version 12. The demo is a separate npm project.

To set up `react-d3-tree` for local development, clone the repo and follow the steps below:

```bash
# 1. Set up the library, create a reference to it for symlinking.
cd react-d3-tree
pnpm install
npm link

# 2. Set up the demo/playground, symlink to the local copy of `react-d3-tree`.
cd demo
npm i
npm link react-d3-tree
```

> **Tip:** If you'd prefer to use your own app for development instead of the demo, simply run `npm link react-d3-tree` in your app's root folder instead of the demo's :)

The demo in this branch still targets the v3 API; a rebuilt demo lands separately and follows v4 in a later change.

### Hot reloading
```bash
pnpm build:watch
```

If you're using `react-d3-tree/demo` for development, open up another terminal window in the `demo` directory and call:
```bash
npm start
```

## Contributors
A huge thank you to all the [contributors](https://github.com/bkrem/react-d3-tree/graphs/contributors), as well as users who have opened issues with thoughtful suggestions and feedback.
