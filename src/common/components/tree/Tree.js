import React, { PropTypes } from "react";
import * as d3 from "d3";

import styles from "./style.css";
import Node from "../node/Node";
import Link from "../link/Link";

const mockSecondaryLabels = {
  keyA: "val A",
  keyB: "val B",
  keyC: "val C",
};

export default class Tree extends React.Component {

  static defaultProps = {
    orientation: "horizontal",
  }

  static propTypes = {
    data: PropTypes.array.isRequired,
    orientation: PropTypes.oneOf(["horizontal", "vertical"]).isRequired
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

  assignCustomProperties(data) {
    return data.map(node => {
      node._collapsed = false;
      if (node.children && node.children.length > 0) {
        node.children = this.assignCustomProperties(node.children);
        node._children = node.children;
      }
      return node;
    });
  }

  generateTree(data) {
    const tree = d3.layout.tree()
      .nodeSize([100 + 40, 100 + 40])
      .separation(d => {
        return d._children ? 1.2 : 0.9;
      })
      .children(function(d) {
        return d._collapsed ? null : d._children;
      });

    const root = data[0];
    const nodes = tree.nodes(root);
    const links = tree.links(nodes);

    // FIXME Ineffectual; write a recursive walk on `data` to add these
    // properties before `tree.nodes()` is called.
    //nodes.forEach(node => {
    //  node.collapsed = false
    //  node.children ? node._children = node.children : null
    //})

    return {nodes, links};
  }

  render() {
    const {data, orientation} = this.props;
    const treeData = this.assignCustomProperties(data);
    const {nodes, links} = this.generateTree(treeData);
    return (
      <div className={styles.treeContainer}>
        <svg width="100%" height="100%">
          <g transform="translate(200,200)">
            {nodes.map((nodeData, i) =>
              <Node
                key={nodeData.name + i}
                orientation={orientation}
                textAnchor="start"
                nodeData={nodeData}
                primaryLabel={nodeData.name}
                secondaryLabels={mockSecondaryLabels}
              />
            )}
            {links.map((linkData, i) =>
              <Link
                key={"link-" + i}
                orientation={orientation}
                linkData={linkData}
              />
            )}
          </g>
        </svg>
      </div>
    );
  }
}