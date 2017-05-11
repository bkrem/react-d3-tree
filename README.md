# React D3 Tree
[![Build Status](https://travis-ci.org/bkrem/react-d3-tree.svg?branch=master)](https://travis-ci.org/bkrem/react-d3-tree)

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
      <div>
      
        <Tree data={myTreeData} />
        
      </div>
    );
  }
}
```

## Props
| Property       | Type            | Options                 | Required? | Default        | Description                                                                                                                                     |
|----------------|-----------------|-------------------------|-----------|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `data`         | `object`        |                         | required  | `undefined`    | Hierarchical object; contains (at least) `name` and `parent` keys.                                                                  |
| `orientation`  | `string` (enum) | `horizontal` `vertical` |           | `horizontal`   | `horizontal` - Tree expands left-to-right. `vertical` - Tree expands top-to-bottom                                                              |
| `translate`    | `object`        |                         |           | `{x: 0, y: 0}` | Translates the graph along the x/y axis by the specified amount of pixels (avoids the graph being stuck in the top left canvas corner)          |
| `pathFunc`     | `string` (enum) | `diagonal` `elbow`      |           | `diagonal`     | `diagonal` - Renders smooth, curved paths between parent-child nodes. `elbow` - Renders sharp curves at right angles between parent-child nodes |
| `collapsible`  | `bool`          |                         |           | `true`         | Sets whether the tree's nodes can be collapsed by clicking them                                                                                 |
| `initialDepth` | `number`        | `0` or greater          |           | `undefined`    | Sets the maximum node depth to which the tree is expanded on its initial render; tree renders to full depth if prop is omitted.                   |
