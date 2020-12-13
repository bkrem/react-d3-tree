<h1 align="center">React D3 Tree</h1>

<p align="center">
  <a href="#buildstatus">
    <img alt="build status" src="https://github.com/bkrem/react-d3-tree/workflows/Build/badge.svg">
  </a>
  <a href="https://coveralls.io/github/bkrem/react-d3-tree?branch=master">
    <img alt="coverage status" src="https://coveralls.io/repos/github/bkrem/react-d3-tree/badge.svg?branch=master">
  </a>
  <a href="https://www.npmjs.com/package/react-d3-tree">
    <img alt="npm package" src="https://badge.fury.io/js/react-d3-tree.svg">
  </a>
  <a href="https://www.npmjs.com/package/react-d3-tree">
    <img alt="npm package: downloads monthly" src="https://img.shields.io/npm/dm/react-d3-tree.svg">
  </a>
  <a href="https://github.com/prettier/prettier">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=plastic">
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
- [Development](#development)
  - [Setup](#setup)
  - [Hot reloading](#hot-reloading)
- [FAQ](#faq)
- [Contributors](#contributors)
- [License](#license)
- [Keeping large trees responsive](#keeping-large-trees-responsive)
- [External data sources](#external-data-sources)
  - [Example](#example)
- [Using foreignObjects](#using-foreignobjects)
  - [`nodeLabelComponent`](#nodelabelcomponent)
    - [Example](#example-1)
- [Recipes](#recipes)
    - [Auto-centering inside `treeContainer`](#auto-centering-inside-treecontainer)

## Installation
```bash
npm i --save react-d3-tree
```

## Usage
```jsx
import React from 'react';
import Tree from 'react-d3-tree';

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
              name: 'Workers',
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
              name: 'Workers',
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

----

## Keeping large trees responsive
Attempting to render large trees with animated transitions may cause significant input lag. This is due to limitations related to the way D3's `select().transition()` enqueues calls to `requestAnimationFrame`, discussed [here](https://github.com/bkrem/react-d3-tree/issues/41#issuecomment-338425414).

Until a custom debounce for expand/collapse has been implemented, **it is therefore recommended to set `props.transitionDuration` to `0` for large tree graphs** if you're experiencing responsiveness issues.


## External data sources
Statically hosted JSON or CSV files can be used as data sources via the additional `treeUtil` module.

### Example

```jsx
import React from 'react';
import { Tree, treeUtil } from 'react-d3-tree';

const csvSource = 'https://raw.githubusercontent.com/bkrem/react-d3-tree/master/docs/examples/data/csv-example.csv';

constructor() {
  super();

  this.state = {
    data: undefined,
  };
}

componentWillMount() {
  treeUtil.parseCSV(csvSource)
  .then((data) => {
    this.setState({ data })
  })
  .catch((err) => console.error(err));
}

class MyComponent extends React.Component {
  render() {
    return (
      {/* <Tree /> will fill width/height of its container; in this case `#treeWrapper` */}
      <div id="treeWrapper" style={{width: '50em', height: '20em'}}>

        <Tree data={this.state.data} />

      </div>
    );
  }
}
```

For details regarding the `treeUtil` module, please check the module's [API docs](docs/util/util.md).  
For examples of each data type that can be parsed with `treeUtil`, please check the [data source examples](docs/examples/data).


## Using foreignObjects
> ⚠️  Requires `allowForeignObjects` prop to be set due to limited browser support: [IE does not currently support `foreignObject` elements](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject#Browser_compatibility).

> ⚠️  There is a [known bug in Safari](https://github.com/bkrem/react-d3-tree/issues/284) relating to the positioning of `foreignObject` elements. Please take this into account before opting in via `allowForeignObjects`.

The SVG spec's `foreignObject` element allows foreign XML content to be rendered into the SVG namespace, unlocking the ability to use regular React components for elements of the tree graph.

### `nodeLabelComponent`
The `nodeLabelComponent` prop provides a way to use a React component for each node's label. It accepts an object with the following signature:
```ts
{
  render: ReactElement,
  foreignObjectWrapper?: object
}
```
* `render` is the XML React-D3-Tree will use to render each node's label.
* `foreignObjectWrapper` contains a set of attributes that should be passed to the `<foreignObject />` that wraps `nodeLabelComponent`. For possible attributes please check the [spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject#Global_attributes).

**Note: By default, `foreignObjectWrapper` will set its width and height attributes to `nodeSize.x - 24px` and `nodeSize.y - 24px` respectively; where a base margin of 24px is subtracted to avoid the overlapping of elements.** 
To override this behaviour for each attribute, specify `width` and/or `height` properties for your `foreignObjectWrapper`.

**Note:** The ReactElement passed to `render` is cloned with its existing props and **receives an additional `nodeData` object prop, containing information about the current node.**

#### Example
Assuming we have a React component `NodeLabel` and we want to avoid node's label overlapping with the node itself by moving its position along the Y-axis, we could implement `nodeLabelComponent` like so:
```jsx
class NodeLabel extends React.PureComponent {
  render() {
    const {className, nodeData} = this.props
    return (
      <div className={className}>
        <h2>{nodeData.name}</h2>
        {nodeData._children && 
          <button>{nodeData._collapsed ? 'Expand' : 'Collapse'}</button>
        }
      </div>
    )
  }
}

/* ... */

render() {
  return (
    <Tree 
      data={myTreeData}
      allowForeignObjects
      nodeLabelComponent={{
        render: <NodeLabel className='myLabelComponentInSvg' />,
        foreignObjectWrapper: {
          y: 24
        }
      }}
    />
    )
}
```



## Recipes
#### [Auto-centering inside `treeContainer`](https://codesandbox.io/s/vvz51w5n63)

