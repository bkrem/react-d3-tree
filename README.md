# React D3 Tree <!-- omit in toc -->

[![Greenkeeper badge](https://badges.greenkeeper.io/bkrem/react-d3-tree.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/bkrem/react-d3-tree.svg?branch=master)](https://travis-ci.org/bkrem/react-d3-tree)
[![Coverage Status](https://coveralls.io/repos/github/bkrem/react-d3-tree/badge.svg?branch=master)](https://coveralls.io/github/bkrem/react-d3-tree?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/f9ed4796ee9c448dbcd80af2954cc0d1)](https://www.codacy.com/app/ben.kremer/react-d3-tree?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=bkrem/react-d3-tree&amp;utm_campaign=Badge_Grade)
[![npm version](https://badge.fury.io/js/react-d3-tree.svg)](https://badge.fury.io/js/react-d3-tree)
[![npm](https://img.shields.io/npm/dm/react-d3-tree.svg)](https://www.npmjs.com/package/react-d3-tree)

React D3 Tree is a [React](http://facebook.github.io/react/) component that lets you represent hierarchical data (e.g. ancestor trees, organisational structure, package dependencies) as an animated & interactive tree graph by leveraging [D3](https://d3js.org/)'s `tree` layout.


## Contents <!-- omit in toc -->
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Node shapes](#node-shapes)
  - [Overridable `shapeProps`](#overridable-shapeprops)
  - [Individual `shapeProps`](#individual-shapeprops)
- [Styling](#styling)
- [Pre-defining a node's `_collapsed` state](#pre-defining-a-nodes-_collapsed-state)
- [Keeping large trees responsive](#keeping-large-trees-responsive)
- [External data sources](#external-data-sources)
  - [Example](#example)
- [Using foreignObjects](#using-foreignobjects)
  - [`nodeLabelComponent`](#nodelabelcomponent)
    - [Example](#example-1)
- [Recipes](#recipes)
    - [Auto-centering inside `treeContainer`](#auto-centering-inside-treecontainer)
    - [Adding & removing nodes dynamically](#adding--removing-nodes-dynamically)


## Demo
- Current release: https://bkrem.github.io/react-d3-tree-demo/


## Installation
```bash
yarn add react-d3-tree
```
or
```bash
npm i --save react-d3-tree
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
| Property                      | Type                   | Options                                                                                | Required? | Default                                                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|:------------------------------|:-----------------------|:---------------------------------------------------------------------------------------|:----------|:--------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `data`                        | `array`<br/>`object`   |                                                                                        | required  | `undefined`                                                   | Single-element array containing the root node object (see `myTreeData` above). <br/> Passing the root node object without an array wrapping it is also possible. <br /><br /> `react-d3-tree` will automatically attach a unique `id` attribute to each node in the DOM, as well as `data-source-id` & `data-target-id` attributes to each link connecting two nodes.                                                                                                                                                                                  |
| `svgClassName`                | `string`               |                                                                                        |           | `undefined`                                                   | Allows for additional className(s) to be passed to the `svg` element wrapping the tree.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `nodeSvgShape`                | `object`               | see [Node shapes](#node-shapes)                                                        |           | `{shape: 'circle', shapeProps: {r: 10}}`                      | Sets a specific SVG shape element + shapeProps to be used for each node.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `nodeLabelComponent`          | `object`               | see [Using foreignObjects](#using-foreignobjects)                                      |           | `null`                                                        | Allows using a React component as a node label; requires `allowForeignObjects` to be set.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `onClick`                     | `func`                 |                                                                                        |           | `undefined`                                                   | Callback function to be called when a node is clicked. <br /><br />Has the function signature `(nodeData, evt)`. The clicked node's data object is passed as first parameter, event object as second.                                                                                                                                                                                                                                                                                                                                                  |
| `onMouseOver`                 | `func`                 |                                                                                        |           | `undefined`                                                   | Callback function to be called when mouse enters the space belonging to a node. <br /><br />Has the function signature `(nodeData, evt)`. The clicked node's data object is passed as first parameter, event object as second.                                                                                                                                                                                                                                                                                                                         |
| `onMouseOut`                  | `func`                 |                                                                                        |           | `undefined`                                                   | Callback function to be called when mouse leaves the space belonging to a node. <br /><br />Has the function signature `(nodeData, evt)`. The clicked node's data object is passed as first parameter, event object as second.                                                                                                                                                                                                                                                                                                                         |
| `onLinkClick`                 | `func`                 |                                                                                        |           | `undefined`                                                   | Callback function to be called when a link is clicked. <br /><br />Has the function signature `(linkSource, linkTarget, evt)`. The clicked link's parent data object is passed as first parameter, the child's as second, the event object as third.                                                                                                                                                                                                                                                                                                   |
| `onLinkMouseOver`             | `func`                 |                                                                                        |           | `undefined`                                                   | Callback function to be called when mouse enters the space belonging to a link. <br /><br />Has the function signature `(linkSource, linkTarget, evt)`. The clicked link's parent data object is passed as first parameter, the child's as second, the event object as third.                                                                                                                                                                                                                                                                          |
| `onLinkMouseOut`              | `func`                 |                                                                                        |           | `undefined`                                                   | Callback function to be called when mouse leaves the space belonging to a link. <br /><br />Has the function signature `(linkSource, linkTarget, evt)`. The clicked link's parent data object is passed as first parameter, the child's as second, the event object as third.                                                                                                                                                                                                                                                                          |
| `onUpdate`                    | `func`                 |                                                                                        |           | `undefined`                                                   | Callback function to be called when the inner D3 component updates. That is - on every zoom or translate event, or when tree branches are toggled. <br /><br />Has the function signature `(updateTarget: {targetNode, currentTranslate, currentZoom})`.                                                                                                                                                                                                                                                                                               |
| `orientation`                 | `string` (enum)        | `horizontal` `vertical`                                                                |           | `horizontal`                                                  | `horizontal` - Tree expands left-to-right. <br /><br /> `vertical` - Tree expands top-to-bottom.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `translate`                   | `object`               |                                                                                        |           | `{x: 0, y: 0}`                                                | Translates the graph along the x/y axis by the specified amount of pixels (avoids the graph being stuck in the top left canvas corner).                                                                                                                                                                                                                                                                                                                                                                                                                |
| `pathClassFunc`               | `func`                 | `customFunc(linkData, orientation)`                                                    |           | `undefined`                                                   | Allows for additional className(s) to be passed to links.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pathFunc`                    | `string (enum)`/`func` | `diagonal`<br/>`elbow`<br/>`straight`<br/>`customFunc(linkData, orientation)`          |           | `diagonal`                                                    | `diagonal` - Smooth, curved edges between parent-child nodes. <br /><br /> `elbow` - Sharp edges at right angles between parent-child nodes.  <br /><br /> `straight` - Straight lines between parent-child nodes. <br /><br /> `customFunc` - Custom draw function that accepts `linkData` as its first param and `orientation` as its second.                                                                                                                                                                                                        |
| `collapsible`                 | `bool`                 |                                                                                        |           | `true`                                                        | Toggles ability to collapse/expand the tree's nodes by clicking them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `useCollapseData`             | `bool`                 | see [Pre-defining a node's `_collapsed` state](#pre-defining-a-nodes-_collapsed-state) |           | `false`                                                       | Toggles whether the tree should automatically use any `_collapsed: bool` properties it finds on nodes in the passed data set to configure its initial layout.                                                                                                                                                                                                                                                                                                                                                                                          |
| `shouldCollapseNeighborNodes` | `bool`                 |                                                                                        |           | `false`                                                       | If a node is currently being expanded, all other nodes at the same depth will be collapsed.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `initialDepth`                | `number`               | `0..n`                                                                                 |           | `undefined`                                                   | Sets the maximum node depth to which the tree is expanded on its initial render. <br /> Tree renders to full depth if prop is omitted.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `depthFactor`                 | `number`               | `-n..0..n`                                                                             |           | `undefined`                                                   | Ensures the tree takes up a fixed amount of space (`node.y = node.depth * depthFactor`), regardless of tree depth. <br /> **TIP**: Negative values invert the tree's direction.                                                                                                                                                                                                                                                                                                                                                                        |
| `zoomable`                    | `bool`                 |                                                                                        |           | `true`                                                        | Toggles ability to zoom in/out on the Tree by scaling it according to `props.scaleExtent`.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `zoom`                        | `number`               | `0..n`                                                                                 |           | `1`                                                           | A floating point number to set the initial zoom level. It is constrained by `props.scaleExtent`. `1` is the default "non-zoomed" level.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `scaleExtent`                 | `object`               | `{min: 0..n, max: 0..n}`                                                               |           | `{min: 0.1, max: 1}`                                          | Sets the minimum/maximum extent to which the tree can be scaled if `props.zoomable` is true.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `nodeSize`                    | `object`               | `{x: 0..n, y: 0..n}`                                                                   |           | `{x: 140, y: 140}`                                            | Sets a fixed size for each node. <br /><br /> This does not affect node circle sizes, circle sizes are handled by the `circleRadius` prop.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `separation`                  | `object`               | `{siblings: 0..n, nonSiblings: 0..n}`                                                  |           | `{siblings: 1, nonSiblings: 2}`                               | Sets separation between neighbouring nodes, differentiating between siblings (same parent) and non-siblings.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `transitionDuration`          | `number`               | `0..n`                                                                                 |           | `500`                                                         | Sets the animation duration (in ms) of each expansion/collapse of a tree node. <br /><br /> Set this to `0` to deactivate animations completely.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `textLayout`                  | `object`               | `{textAnchor: enum, x: -n..0..n, y: -n..0..n, transform: string}`                      |           | `{textAnchor: "start", x: 10, y: -10, transform: undefined }` | Configures the positioning of each node's text (name & attributes) relative to the node itself. Defining a `textLayout` property on a node passed in `props.data` will override this global configuration for that node.<br/><br/>`textAnchor` enums mirror the [`text-anchor` spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor).<br/><br/>`x` & `y` accept integers denoting `px` values.<br/><br/> `transform` mirrors the [svg `transform` spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform). |
| `styles`                      | `object`               | see [Styling](#styling)                                                                |           | `Node`/`Link` CSS files                                       | Overrides and/or enhances the tree's default styling.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `allowForeignObjects`         | `bool`                 | see [Using foreignObjects](#using-foreignobjects)                                      |           | `false`                                                       | Allows use of partially supported `<foreignObject />` elements.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `circleRadius` (legacy)       | `number`               | `0..n`                                                                                 |           | `undefined`                                                   | Sets the radius of each node's `<circle>` element.<br /><br /> **Will be deprecated in v2, please use `nodeSvgShape` instead.**                                                                                                                                                                                                                                                                                                                                                                                                                        |


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

To avoid rendering any node element, simply set `nodeSvgShape` to `{ shape: 'none' }`.

### Overridable `shapeProps`
 `shapeProps` is currently merged with `node.circle`/`leafNode.circle` (see [Styling](#styling)).

 This means any properties passed in `shapeProps` will be overridden by **properties with the same key** in the `node.circle`/`leafNode.circle` style props.
This is to prevent breaking the legacy usage of `circleRadius` + styling via `node/leafNode` properties until it is deprecated fully in v2.

**From v1.5.x onwards, it is therefore recommended to pass all node styling properties through `shapeProps`**.


### Individual `shapeProps`
`shapeProps` can be passed to a node individually by adding the `nodeSvgShape` property to the relevant node's data set. This allows setting each node's style, shape and size independently of the tree's overall `shapeProps` configuration (see [Styling](#styling)).

The usage example above can be extended to include individual `shapeProps`:
```jsx
import React from 'react';
import Tree from 'react-d3-tree';

const myTreeData = [
  {
    name: 'Parent Node',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    nodeSvgShape: {
      shape: 'circle',
      shapeProps: {
        r: 10,
        fill: 'blue',
      },
    },
    children: [
      {
        name: 'Inner Node',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
        nodeSvgShape: {
          shape: 'rect',
          shapeProps: {
            width: 20,
            height: 20,
            x: -10,
            y: -10,
            fill: 'red',
          },
        },
      },
      {
        name: 'Level 2: B',
      },
    ],
  },
];

...

```

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


## Pre-defining a node's `_collapsed` state
The tree's initial layout can be specified node-for-node by enabling the `useCollapseData` prop.
If activated, `react-d3-tree` will look for nodes specifying their own `_collapsed` property and structure the initial layout accordingly.

For example, given an input data set of the shape:
```js
const dataWithCollapsedProperties = [
  {
    name: 'Top Level',
    children: [
      {
        name: '2: A',
        children: [
          {
            name: '3: Collapsed son of A',
            _collapsed: true,
            children: [
              {
                name: '4: Son of A',
              },
              {
                name: '4: Daughter of A',
              },
            ],
          },
          {
            name: '3: Daughter of A',
          },
        ],
      },
      {
        name: '2: B',
      },
    ],
  },
];
```

all nodes (with children) will be expanded except the `Collapsed son of A` node.

Clarifications:
* Why is a leading underscore required for `_collapsed`?
  * D3 binds its own internal `collapsed` property to each node, `react-d3-tree` simply adds a leading underscore to create a separate namespace.
* Should `_collapsed: false` be explicitly set?
  * No, there's no need to do this since `react-d3-tree` assumes a node to be expanded unless specified otherwise.

> **Note:** `props.useCollapseData` and `props.initialDepth` are mutually exclusive. If `useCollapseData` is set, `initialDepth` values will be ignored.


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
#### [Adding & removing nodes dynamically](https://codesandbox.io/s/jz1v7o2ryy)
