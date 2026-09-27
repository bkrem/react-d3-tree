<h1 align="center">React D3 Tree</h1>

<p align="center">
  <a href="https://github.com/bkrem/react-d3-tree/actions/workflows/build.yml">
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
  <a href="https://bkrem.github.io/react-d3-tree"><strong>Playground</strong></a>
  ·
  <a href="https://bkrem.github.io/react-d3-tree/docs"><strong>API reference (v3)</strong></a>
</p>

React D3 Tree is a [React](https://react.dev) component that renders hierarchical data, such as family trees, org charts, and file directories, as an interactive tree graph. It uses the `tree` layout from [D3](https://d3js.org/).

## Contents <!-- omit in toc -->

- [Install](#install)
- [Quick start](#quick-start)
- [Data format](#data-format)
- [Props](#props)
- [Style nodes](#style-nodes)
- [Style links](#style-links)
- [Handle events](#handle-events)
- [Render custom nodes](#render-custom-nodes)
- [Change how links are drawn](#change-how-links-are-drawn)
- [Contributing](#contributing)
- [Older versions](#older-versions)

## Install

```bash
npm install react-d3-tree
```

React D3 Tree supports React 16, 17, 18, and 19, and ships its own TypeScript types.

## Quick start

```jsx
import React from 'react';
import Tree from 'react-d3-tree';

// Each node has a `name`, optional `attributes`, and optional `children`.
const orgChart = {
  name: 'CEO',
  children: [
    {
      name: 'Manager',
      attributes: { department: 'Production' },
      children: [
        {
          name: 'Foreman',
          attributes: { department: 'Fabrication' },
          children: [{ name: 'Worker' }],
        },
        {
          name: 'Foreman',
          attributes: { department: 'Assembly' },
          children: [{ name: 'Worker' }],
        },
      ],
    },
  ],
};

export default function OrgChartTree() {
  return (
    // `Tree` fills the width and height of its container.
    <div id="treeWrapper" style={{ width: '50em', height: '20em' }}>
      <Tree data={orgChart} />
    </div>
  );
}
```

## Data format

`Tree` expects `data` to be a node object that matches the [`RawNodeDatum`](https://bkrem.github.io/react-d3-tree/docs/interfaces/RawNodeDatum.html) interface:

```ts
interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
}
```

- `name` is required. The default node shows it as the node's main label.
- `attributes` is optional. The default node lists each key-value pair below the name.
- `children` holds the node's child nodes, each of which is also a `RawNodeDatum`.

`data` also accepts an array, but `Tree` renders only its first element.

## Props

`data` is the only required prop. For every prop, its type, and its default value, see the [`TreeProps` reference](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html).

## Style nodes

By default, each node is an SVG `circle`. To style nodes by their position in the tree, pass a class name to one or more of these props:

- `rootNodeClassName`: the root node.
- `branchNodeClassName`: nodes with children.
- `leafNodeClassName`: nodes without children.

For example, to give each kind of node its own color:

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
  /* Leaf nodes also get a larger radius. */
  r: 40;
}
```

```jsx
import React from 'react';
import Tree from 'react-d3-tree';
import './custom-tree.css';

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

## Style links

To add class names to links, pass a function to `pathClassFunc`. `Tree` calls it for each link with the link's [`TreeLinkDatum`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeLinkDatum.html) and the tree's `orientation`, and adds the returned string to the link's `class` attribute.

To give every link the same classes, return a fixed string:

```jsx
<Tree data={data} pathClassFunc={() => 'custom-link extra-custom-link'} />
```

To pick classes per link, read the link's `source` and `target` nodes:

```jsx
function StyledLinksTree() {
  const getDynamicPathClass = ({ source, target }, orientation) => {
    // The target has no children, so this link leads to a leaf node.
    if (!target.children) {
      return 'link__to-leaf';
    }
    return 'link__to-branch';
  };

  return <Tree data={data} pathClassFunc={getDynamicPathClass} />;
}
```

## Handle events

`Tree` accepts these event handlers:

- [`onNodeClick`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#onnodeclick)
- [`onNodeMouseOver`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#onnodemouseover)
- [`onNodeMouseOut`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#onnodemouseout)
- [`onLinkClick`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#onlinkclick)
- [`onLinkMouseOver`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#onlinkmouseover)
- [`onLinkMouseOut`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#onlinkmouseout)
- [`onUpdate`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#onupdate): runs after each zoom or pan, and after each update of the tree, such as a node toggle.

A click on a default node's circle expands or collapses the node, then calls `onNodeClick`. To keep nodes from expanding or collapsing, set [`collapsible`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#collapsible) to `false`; `onNodeClick` still runs.

To center a node in view when it's clicked, pass the container's size to [`dimensions`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#dimensions).

## Render custom nodes

To replace the default node, pass a render function to [`renderCustomNodeElement`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#rendercustomnodeelement). `Tree` calls it for every node with [`CustomNodeElementProps`](https://bkrem.github.io/react-d3-tree/docs/interfaces/CustomNodeElementProps.html) and renders the SVG element it returns.

A custom node controls its own clicks. To keep the default behavior, call `toggleNode` to expand or collapse the node, and `onNodeClick` to run your `onNodeClick` handler and, if you set `dimensions`, center the node.

<details>
<summary>Example: a different SVG element</summary>

This node draws a square instead of a circle and keeps the default click behavior.

```jsx
const renderRectNode = ({ nodeDatum, toggleNode, onNodeClick }) => (
  <g>
    <rect
      width="20"
      height="20"
      x="-10"
      y="-10"
      onClick={evt => {
        toggleNode();
        onNodeClick(evt);
      }}
    />
    <text x="20">{nodeDatum.name}</text>
  </g>
);

<Tree data={data} renderCustomNodeElement={renderRectNode} />;
```

</details>

<details>
<summary>Example: custom event handlers</summary>

This node splits the click behavior: a click on the label expands or collapses the node, and a click on the circle calls `onNodeClick`. `nodeDatum.__rd3t.collapsed` tells you whether the node is collapsed.

```jsx
const renderLabelToggleNode = ({ nodeDatum, toggleNode, onNodeClick }) => (
  <g>
    <circle r="15" onClick={onNodeClick} />
    <text x="20" onClick={toggleNode}>
      {nodeDatum.name}
      {nodeDatum.children && (nodeDatum.__rd3t.collapsed ? ' (+)' : ' (-)')}
    </text>
  </g>
);

<Tree
  data={data}
  renderCustomNodeElement={renderLabelToggleNode}
  onNodeClick={node => console.log(node.data.name)}
/>;
```

</details>

<details>
<summary>Example: HTML inside nodes</summary>

SVG can't hold HTML elements directly. To render HTML in a node, wrap it in a `foreignObject` element. If the HTML holds inputs or other controls, set `hasInteractiveNodes` so that dragging and zooming don't get in their way.

```jsx
const renderHtmlNode = ({ nodeDatum, toggleNode }) => (
  <g>
    <circle r="15" />
    <foreignObject width="200" height="100" x="20" y="-50">
      <div style={{ border: '1px solid black', backgroundColor: '#dedede' }}>
        <h3 style={{ textAlign: 'center' }}>{nodeDatum.name}</h3>
        {nodeDatum.children && (
          <button type="button" style={{ width: '100%' }} onClick={toggleNode}>
            {nodeDatum.__rd3t.collapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
      </div>
    </foreignObject>
  </g>
);

<Tree data={data} renderCustomNodeElement={renderHtmlNode} hasInteractiveNodes />;
```

</details>

## Change how links are drawn

Each link is an SVG `path`. To change its shape, set [`pathFunc`](https://bkrem.github.io/react-d3-tree/docs/interfaces/TreeProps.html#pathfunc) to one of these options:

- `diagonal` (default)
- `elbow`
- `straight`
- `step`

To compare them, try each one in the [playground](https://bkrem.github.io/react-d3-tree).

For a shape the options don't cover, pass your own [`PathFunction`](https://bkrem.github.io/react-d3-tree/docs/types/PathFunction.html). `Tree` calls it for each link with the link's `TreeLinkDatum` and the tree's `orientation`, and uses the returned string as the path's [`d` attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d). This example draws straight lines:

```jsx
function CustomPathFuncTree() {
  const straightPathFunc = ({ source, target }, orientation) =>
    orientation === 'horizontal'
      ? `M${source.y},${source.x}L${target.y},${target.x}`
      : `M${source.x},${source.y}L${target.x},${target.y}`;

  return <Tree data={data} pathFunc={straightPathFunc} />;
}
```

In a horizontal tree, `x` and `y` swap: a node's `y` is its horizontal position.

## Contributing

To set up the repo, run the playground, and submit changes, see [CONTRIBUTING.md](CONTRIBUTING.md). Thanks to all [contributors](https://github.com/bkrem/react-d3-tree/graphs/contributors) and to everyone who opens issues with suggestions and feedback.

## Older versions

- [v2 release notes](https://github.com/bkrem/react-d3-tree/releases/tag/v2.0.0), which list the breaking changes from v1.
- [v1 docs](https://github.com/bkrem/react-d3-tree/tree/v1).
