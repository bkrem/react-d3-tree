import React from "react"
import * as d3 from "d3"

import styles from "./style.css"
import Node from "../node/Node"

export default class Tree extends React.Component {
  render() {
    const mockSecondaryLabels = {
      keyA: "val A",
      keyB: "val B",
      keyC: "val C",
    }

    return (
      <div className={styles.treeContainer}>
        <svg width="100%" height="100%">
          <g transform="translate(200,200)">
            <Node
              textAnchor="start"
              primaryLabel="My node"
              secondaryLabels={mockSecondaryLabels}
            />
          </g>
        </svg>
      </div>
    )
  }
}