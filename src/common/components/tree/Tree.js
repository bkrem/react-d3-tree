import React, { PropTypes } from "react"
import * as d3 from "d3"

import styles from "./style.css"
import Node from "../node/Node"
import Link from "../link/Link"

const mockSecondaryLabels = {
  keyA: "val A",
  keyB: "val B",
  keyC: "val C",
}

export default class Tree extends React.Component {

  static propTypes = {
    rawData: PropTypes.array.isRequired
  }

  /*
  zoom(treeOffset) {
    return d3.behavior.zoom().scaleExtent([0.1, 1]).on("zoom", function() {
      svg.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")")
    })
  // Offset so that first pan and zoom does not jump back to the origin
    .translate([treeOffset.x, treeOffset.y])
  }
  */

  generateTree(rawData) {
    const tree = d3.layout.tree()
      .nodeSize([50 + 40, 50 + 40])
      .separation(d => {
        return d._children ? 1.2 : 0.9
      })
      //.children(function(d) {
      //  return d.collapsed ? null : d._children
      //})

    const root = rawData[0]
    const nodes = tree.nodes(root)
    nodes.forEach(node =>
      node.children ? node._children = node.children : null
    )
    const links = tree.links(nodes)

    return {nodes, links}
  }

  render() {
    const {nodes, links} = this.generateTree(this.props.rawData)
    console.log(links)
    return (
      <div className={styles.treeContainer}>
        <svg width="100%" height="100%">
          <g transform="translate(200,200)">
            {nodes.map((nodeData, i) =>
              <Node
                key={nodeData.name + i}
                textAnchor="start"
                nodeData={nodeData}
                primaryLabel={nodeData.name}
                secondaryLabels={mockSecondaryLabels}
              />
            )}
            {links.map((linkData, i) =>
              <Link
                key={"link-" + i}
                linkData={linkData}
              />
            )}
          </g>
        </svg>
      </div>
    )
  }
}