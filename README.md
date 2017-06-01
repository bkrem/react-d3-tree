# React D3 Tree
[![Build Status](https://travis-ci.org/bkrem/react-d3-tree.svg?branch=master)](https://travis-ci.org/bkrem/react-d3-tree)
[![Coverage Status](https://coveralls.io/repos/github/bkrem/react-d3-tree/badge.svg?branch=master)](https://coveralls.io/github/bkrem/react-d3-tree?branch=master)
[![npm version](https://badge.fury.io/js/react-d3-tree.svg)](https://badge.fury.io/js/react-d3-tree)

React D3 Tree is a [React](http://facebook.github.io/react/) component that lets you represent hierarchical data (e.g. ancestor trees, organisational structure, package dependencies) as an animated & interactive tree graph by leveraging [D3](https://d3js.org/)'s `tree` layout.


## Contents
- [Demo](#demo)
- [Installation](#installation)
- [Minimal example](#minimal-example)
- [Props](#props)


## Demo
- Current release (stable): https://bkrem.github.io/react-d3-tree/ 


## Installation
To install via NPM, run:
```bash
npm i --save react-d3-tree
```


## Minimal example
```jsx
import Tree from 'react-d3-tree';

const myTreeData = [
  {
    name: 'Top Level',
    parent: 'null',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: 'Level 2: A',
        parent: 'Top Level',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
      },
      {
        name: 'Level 2: B',
        parent: 'Top Level',
      },
    ],
  },
];

class MyComponent extends Component {
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
| Property       | Type            | Options                 | Required? | Default                 | Description                                                                                                                                                                     |
|----------------|-----------------|-------------------------|-----------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `data`         | `array`         |                         | required  | `undefined`             | Single-element array containing hierarchical object (see `myTreeData` above). <br /> Contains (at least) `name` and `parent` keys.                                              |
| `orientation`  | `string` (enum) | `horizontal` `vertical` |           | `horizontal`            | `horizontal` - Tree expands left-to-right. <br /><br /> `vertical` - Tree expands top-to-bottom.                                                                                |
| `translate`    | `object`        |                         |           | `{x: 0, y: 0}`          | Translates the graph along the x/y axis by the specified amount of pixels (avoids the graph being stuck in the top left canvas corner).                                         |
| `pathFunc`     | `string` (enum) | `diagonal` `elbow`      |           | `diagonal`              | `diagonal` - Renders smooth, curved edges between parent-child nodes. <br /><br /> `elbow` - Renders sharp edges at right angles between parent-child nodes.                    |
| `collapsible`  | `bool`          |                         |           | `true`                  | Toggles ability to collapse/expand the tree's nodes by clicking them.                                                                                                           |
| `initialDepth` | `number`        | `0..n`                  |           | `undefined`             | Sets the maximum node depth to which the tree is expanded on its initial render. <br /> Tree renders to full depth if prop is omitted.                                          |
| `zoomable`     | `bool`          |                         |           | `true`                  | Toggles ability to zoom in/out on the Tree by scaling the SVG element according to `props.scaleExtent`.                                                                         |
| `scaleExtent`  | `object`        |                         |           | `{min: 0.1, max: 1}`    | Sets the minimum/maximum extent to which the tree can be scaled if `props.zoomable` is true.                                                                                    |
| `depthFactor`  | `number`        | `-n..0..n`              |           | `undefined`             | Ensures the tree takes up a fixed amount of space (`node.y = node.depth * depthFactor`), regardless of tree depth. <br /> **TIP**: Negative values invert the tree's direction. |


## External data sources
Statically hosted JSON or CSV files can be used as data sources via the additional `treeUtil` module.

### Example

```jsx
import { Tree, treeUtil } from 'react-d3-tree';

const csvSource = 'https://raw.githubusercontent.com/bkrem/react-d3-tree/feature/add-csv-to-json-transform/examples/data/csv-example.csv';

constructor() {
  super();

  this.state = {
    data: undefined,
  };
  
  componentWillMount() {
    treeUtil.parseCSV(csvSource)
    .then((data) => {
      this.setState({ data })
    })
    .catch((err) => console.error(err));
  }

class MyComponent extends Component {
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
