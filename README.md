# React D3 Tree
[![Build Status](https://travis-ci.org/bkrem/react-d3-tree.svg?branch=master)](https://travis-ci.org/bkrem/react-d3-tree)
[![Coverage Status](https://coveralls.io/repos/github/bkrem/react-d3-tree/badge.svg?branch=master)](https://coveralls.io/github/bkrem/react-d3-tree?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f9ed4796ee9c448dbcd80af2954cc0d1)](https://www.codacy.com/app/ben.kremer/react-d3-tree?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=bkrem/react-d3-tree&amp;utm_campaign=Badge_Grade)
[![npm version](https://badge.fury.io/js/react-d3-tree.svg)](https://badge.fury.io/js/react-d3-tree)
[![npm](https://img.shields.io/npm/dm/react-d3-tree.svg)](https://www.npmjs.com/package/react-d3-tree)

React D3 Tree is a [React](http://facebook.github.io/react/) component that lets you represent hierarchical data (e.g. ancestor trees, organisational structure, package dependencies) as an animated & interactive tree graph by leveraging [D3](https://d3js.org/)'s `tree` layout.


## Contents
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Node shapes](#node-shapes)
- [Styling](#styling)
- [External data sources](#external-data-sources)
- [Recipes](#recipes)


## Demo
- Current release: https://bkrem.github.io/react-d3-tree/


## Installation
To install via NPM, run:
```bash
npm i --save react-d3-tree
```

Or if Yarn is more your thing:
```bash
yarn add react-d3-tree
```


## Usage
```jsx
import React from 'react';
import Tree from 'react-d3-tree';

const myTreeData = [
  {
    name: 'Top Level',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: 'Level 2: A',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
      },
      {
        name: 'Level 2: B',
      },
    ],
  },
];

class MyComponent extends React.Component {
  render() {
    return (
      {/* <Tree /> will fill width/height of its container; in this case `#treeWrapper` */}
      <div id="treeWrapper" style={{width: '50em', height: '20em'}}>

        <Tree data={myTreeData} />

      </div>
    );
  }
}
```


## Props
| Property                | Type                   | Options                                                                       | Required? | Default                                 | Description                                                                                                                                                                                                                                                                                                                                     |
|:------------------------|:-----------------------|:------------------------------------------------------------------------------|:----------|:----------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `data`                  | `array`                |                                                                               | required  | `undefined`                             | Single-element array containing hierarchical object (see `myTreeData` above). <br /> Contains (at least) `name` and `parent` keys.                                                                                                                                                                                                              |
| `nodeSvgShape`          | `object`               | see [Node shapes](#node-shapes)                                               |           | `{shape: 'circle', shapeProps: r: 10}`  | Sets a specific SVG shape element + shapeProps to be used for each node.                                                                                                                                                                                                                                                                        |
| `onClick`               | `func`                 |                                                                               |           | `undefined`                             | Callback function to be called whenever a node is clicked. <br /><br /> The clicked node's data object is passed to the callback function as the first parameter.                                                                                                                                                                               |
| `orientation`           | `string` (enum)        | `horizontal` `vertical`                                                       |           | `horizontal`                            | `horizontal` - Tree expands left-to-right. <br /><br /> `vertical` - Tree expands top-to-bottom.                                                                                                                                                                                                                                                |
| `translate`             | `object`               |                                                                               |           | `{x: 0, y: 0}`                          | Translates the graph along the x/y axis by the specified amount of pixels (avoids the graph being stuck in the top left canvas corner).                                                                                                                                                                                                         |
| `pathFunc`              | `string (enum)`/`func` | `diagonal`<br/>`elbow`<br/>`straight`<br/>`customFunc(linkData, orientation)` |           | `diagonal`                              | `diagonal` - Smooth, curved edges between parent-child nodes. <br /><br /> `elbow` - Sharp edges at right angles between parent-child nodes.  <br /><br /> `straight` - Straight lines between parent-child nodes. <br /><br /> `customFunc` - Custom draw function that accepts `linkData` as its first param and `orientation` as its second. |
| `collapsible`           | `bool`                 |                                                                               |           | `true`                                  | Toggles ability to collapse/expand the tree's nodes by clicking them.                                                                                                                                                                                                                                                                           |
| `initialDepth`          | `number`               | `0..n`                                                                        |           | `undefined`                             | Sets the maximum node depth to which the tree is expanded on its initial render. <br /> Tree renders to full depth if prop is omitted.                                                                                                                                                                                                          |
| `depthFactor`           | `number`               | `-n..0..n`                                                                    |           | `undefined`                             | Ensures the tree takes up a fixed amount of space (`node.y = node.depth * depthFactor`), regardless of tree depth. <br /> **TIP**: Negative values invert the tree's direction.                                                                                                                                                                 |
| `zoomable`              | `bool`                 |                                                                               |           | `true`                                  | Toggles ability to zoom in/out on the Tree by scaling it according to `props.scaleExtent`.                                                                                                                                                                                                                                                      |
| `scaleExtent`           | `object`               | `{min: 0..n, max: 0..n}`                                                      |           | `{min: 0.1, max: 1}`                    | Sets the minimum/maximum extent to which the tree can be scaled if `props.zoomable` is true.                                                                                                                                                                                                                                                    |
| `nodeSize`              | `object`               | `{x: 0..n, y: 0..n}`                                                          |           | `{x: 140, y: 140}`                      | Sets a fixed size for each node. <br /><br /> This does not affect node circle sizes, circle sizes are handled by the `circleRadius` prop.                                                                                                                                                                                                      |
| `separation`            | `object`               | `{siblings: 0..n, nonSiblings: 0..n}`                                         |           | `{siblings: 1, nonSiblings: 2}`         | Sets separation between neighbouring nodes, differentiating between siblings (same parent) and non-siblings.                                                                                                                                                                                                                                    |
| `transitionDuration`    | `number`               | `0..n`                                                                        |           | `500`                                   | Sets the animation duration (in ms) of each expansion/collapse of a tree node. <br /><br /> Set this to `0` to deactivate animations completely.                                                                                                                                                                                                |
| `textLayout`            | `object`               | `{textAnchor: enum, x: -n..0..n, y: -n..0..n, transform: string}`                                |           | `{textAnchor: "start", x: 10, y: -10, transform: undefined }` | Configures the positioning of each node's text (name & attributes) relative to the node itself.<br/><br/>`textAnchor` enums mirror the [`text-anchor` spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor).<br/><br/>`x` & `y` accept integers denoting `px` values.<br/><br/> `transform` mirrors the [svg `transform` spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform).                                                        |
| `styles`                | `object`               | see [Styling](#styling)                                                       |           | `Node`/`Link` CSS files                 | Overrides and/or enhances the tree's default styling.                                                                                                                                                                                                                                                                                           |
| `circleRadius` (legacy) | `number`               | `0..n`                                                                        |           | `undefined`                             | Sets the radius of each node's `<circle>` element.<br /><br /> **Will be deprecated in v2, please use `nodeSvgShape` instead.**                                                                                                                                                                                                                 |


## Node shapes
The `nodeSvgShape` prop allows specifying any [SVG shape primitive](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes) to describe how the tree's nodes should be shaped.

> Note: `nodeSvgShape` and `circleRadius` are mutually exclusive props. `nodeSvgShape` will be used unless the legacy `circleRadius` is specified.

For example, assuming we want to use squares instead of the default circles, we can do:
```js
const svgSquare = {
  shape: 'rect',
  shapeProps: {
    width: 20,
    height: 20,
    x: -10,
    y: -10,
  }
}

// ...

<Tree data={myTreeData} nodeSvgShape={svgSquare}>
```

### Overridable `shapeProps`
 `shapeProps` is currently merged with `node.circle`/`leafNode.circle` (see [Styling](#styling)).  

 This means any properties passed in `shapeProps` will be overridden by **properties with the same key** in the `node.circle`/`leafNode.circle` style props.  
This is to prevent breaking the legacy usage of `circleRadius` + styling via `node/leafNode` properties until it is deprecated fully in v2. 

**From v1.5.x onwards, it is therefore recommended to pass all node styling properties through `shapeProps`**.

## Styling
The tree's `styles` prop may be used to override any of the tree's default styling.
The following object shape is expected by `styles`:
```js
{
  links: <svgStyleObject>,
  nodes: {
    node: {
      circle: <svgStyleObject>,
      name: <svgStyleObject>,
      attributes: <svgStyleObject>,
    },
    leafNode: {
      circle: <svgStyleObject>,
      name: <svgStyleObject>,
      attributes: <svgStyleObject>,
    },
  },
}
```
where `<svgStyleObject>` is any object containing CSS-like properties that are compatible with an `<svg>` element's `style` attribute, for example:
```js
{
  stroke: 'blue',
  strokeWidth: 3,
}
```

For more information on the SVG `style` attribute, [check this out](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/style).


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


## Recipes
* [Auto-centering inside `treeContainer`](https://codesandbox.io/s/vvz51w5n63)
