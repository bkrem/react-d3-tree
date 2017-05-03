import React from "react" // eslint-disable-line
import styles from './style.css';
import Tree from '../../common/components/tree/Tree';

const treeData = [
  {
    name: 'Top Level TD1',
    parent: 'null',
    children: [
      {
        name: 'Level 2: A',
        parent: 'Top Level',
        children: [
          {
            name: 'Son of A',
            parent: 'Level 2: A',
          },
          {
            name: 'Daughter of A',
            parent: 'Level 2: A',
          },
        ],
      },
      {
        name: 'Level 2: B',
        parent: 'Top Level',
      },
    ],
  },
];

const treeData2 = [
  {
    name: 'Top Level TD2',
    parent: 'null',
    children: [
      {
        name: 'Level 2: A',
        parent: 'Top Level',
        children: [
          {
            name: 'Son of A',
            parent: 'Level 2: A',
          },
          {
            name: 'Daughter of A',
            parent: 'Level 2: A',
          },
          {
            name: 'Son of A',
            parent: 'Level 2: A',
          },
          {
            name: 'Daughter of A',
            parent: 'Level 2: A',
          },
        ],
      },
      {
        name: 'Level 2: B',
        parent: 'Top Level',
        children: [
          {
            name: 'Son of B',
            parent: 'Level 2: B',
          },
          {
            name: 'Daughter of B',
            parent: 'Level 2: B',
          },
        ],
      },
    ],
  },
];

class PlaygroundPage extends React.Component {

  constructor() {
    super();
    this.state = {
      data: treeData,
      orientation: 'horizontal',
      pathFunc: 'diagonal',
    };
    this.setTreeData = this.setTreeData.bind(this);
    this.setOrientation = this.setOrientation.bind(this);
    this.setPathFunc = this.setPathFunc.bind(this);
  }

  setTreeData(data) {
    this.setState({ data });
  }

  setOrientation(orientation) {
    this.setState({ orientation });
  }

  setPathFunc(pathFunc) {
    this.setState({ pathFunc });
  }

  render() {
    return (
      <div id={styles.playground}>
        <div>
          <button onClick={() => this.setTreeData(treeData)}>TreeData 1</button>
          <button onClick={() => this.setTreeData(treeData2)}>TreeData 2</button>
        </div>
        <div>
          <button onClick={() => this.setOrientation('horizontal')}>{'Left => Right'}</button>
          <button onClick={() => this.setOrientation('vertical')}>{'Top => Bottom'}</button>
        </div>
        <div>
          <button onClick={() => this.setPathFunc('diagonal')}>{'Paths: Diagonal'}</button>
          <button onClick={() => this.setPathFunc('elbow')}>{'Paths: Elbow'}</button>
        </div>
        <Tree
          data={this.state.data}
          orientation={this.state.orientation}
          pathFunc={this.state.pathFunc}
        />
      </div>
    );
  }
}

export default PlaygroundPage;
