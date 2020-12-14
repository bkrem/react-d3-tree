<h1 align="center">React D3 Tree</h1>

<p align="center">
  <a href="#buildstatus">
    <img alt="build status" src="https://github.com/bkrem/react-d3-tree/workflows/Build/badge.svg">
  </a>
  <a href="https://coveralls.io/github/bkrem/react-d3-tree?branch=master">
    <img alt="coverage status" src="https://coveralls.io/repos/github/bkrem/react-d3-tree/badge.svg?branch=master">
  </a>
  <a href="https://www.npmjs.com/package/react-d3-tree">
    <img alt="npm package" src="https://img.shields.io/npm/v/react-d3-tree?style=flat">
  </a>
  <a href="https://www.npmjs.com/package/react-d3-tree">
    <img alt="npm package: downloads monthly" src="https://img.shields.io/npm/dm/react-d3-tree.svg">
  </a>
  <a href="https://github.com/prettier/prettier">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg">
  </a>
</p>

<p align="center">
  <h3 align="center"><a href="https://bkrem.github.io/react-d3-tree">👾 Playground</a></h3>
  <h3 align="center"><a href="https://bkrem.github.io/react-d3-tree/docs">📖 API Documentation (v2)</a></h3>
</p>

React D3 Tree is a [React](http://facebook.github.io/react/) component that lets you represent hierarchical data (e.g. family trees, org charts, file directories) as an interactive tree graph with minimal setup, by leveraging [D3](https://d3js.org/)'s `tree` layout.

> **Looking for v1? Click [here](https://github.com/bkrem/react-d3-tree/tree/v1).**

## Contents <!-- omit in toc -->
- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Up & Running](#up--running)
  - [Styling nodes](#styling-nodes)
  - [Styling links](#styling-links)
- [Rendering custom nodes](#rendering-custom-nodes)
- [Development](#development)
  - [Setup](#setup)
  - [Hot reloading](#hot-reloading)
- [FAQ](#faq)
- [Contributors](#contributors)
- [License](#license)

## Installation
```bash
npm i --save react-d3-tree
```

## Usage
```jsx
import React from 'react';
import Tree from 'react-d3-tree';

// This is a simplified example of an org chart with a depth of 2.
// Note how deeper levels are defined recursively via the `children` property.
const orgChartJson = {
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
      <Tree data={orgChartJson} />
    </div>
  );
}
```

## Props
For details on the props accepted by  `Tree`, check out the [TreeProps reference docs](https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html).

 <!--(TODO: REVISE TITLE) -->
## Up & Running
### Styling nodes
`Tree` provides the following props to style different types of nodes, all of which use an SVG `circle` by default:

- `rootNodeClassName` - will be applied to the root node.
- `branchNodeClassName` - will be applied to any node with 1+ children.
- `leafNodeClassName` - will be applied to any node without children.

To visually distinguish these three types of nodes from each other by color, we could provide each with their own class:

```css
/* custom-tree.css */

.node__root {
  fill: red;
}
.node__branch {
  fill: yellow
}
.node__leaf {
  fill: green;
}
```

```jsx
import React from 'react';
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

 > For more details on the `className` props for nodes, see the [TreeProps reference docs](https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html).

 <!-- For a full list of options of CSS properties that can be used for the default nodes, check the SVG circle [specification](TODO:) -->

### Styling links
`Tree` provides the `pathClassFunc` property to pass additional classNames to every link to be rendered.

Each link calls `pathClassFunc` with its own `TreeLinkDatum` and the tree's current `orientation`. `Tree` expects `pathClassFunc` to return a `className` string.

```jsx
function StyledLinksTree() {
  const getDynamicPathClass = ({ sourceNode, targetNode }, orientation) => {
    if (!targetNode.children) {
      // Node has no children -> this link leads to a leaf node.
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

> For more details, see the `PathClassFunction` [reference docs](https://bkrem.github.io/react-d3-tree/docs/modules/_types_common_.html#pathclassfunction).

## Rendering custom nodes
TODO:

## Development
### Setup
To set up `react-d3-tree` for local development, clone the repo and follow the steps below:

```bash
# 1. Set up the library, create a reference to it for symlinking.
cd react-d3-tree
npm i
npm link

# 2. Set up the demo/playground, symlink to the local copy of `react-d3-tree`.
cd demo
npm i
npm link react-d3-tree
```

> **Tip:** If you'd prefer to use your own app for development instead of the demo, simply run `npm link react-d3-tree` in your app's root folder instead of the demo's :)

### Hot reloading
```bash
npm run build:watch
```

If you're using `react-d3-tree/demo` for development, open up another terminal window in the `demo` directory and call:
```bash
npm start
```

## FAQ

-- TODO --

## Contributors

-- TODO --

## License
MIT