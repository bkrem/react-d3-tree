import React from "react" // eslint-disable-line
import styles from "./style.css"
import Tree from "../../common/components/tree/Tree"

const treeData = [
  {
    "name": "Top Level",
    "parent": "null",
    "children": [
      {
        "name": "Level 2: A",
        "parent": "Top Level",
        "children": [
          {
            "name": "Son of A",
            "parent": "Level 2: A"
          },
          {
            "name": "Daughter of A",
            "parent": "Level 2: A"
          }
        ]
      },
      {
        "name": "Level 2: B",
        "parent": "Top Level"
      }
    ]
  }
]

const PlaygroundPage = () => {
  return (
    <div id={styles.playground}>
      <Tree data={treeData} />
    </div>
  )
}

export default PlaygroundPage