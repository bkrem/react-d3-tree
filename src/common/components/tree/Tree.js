import React, { PropTypes } from 'react';
import clone from 'clone';
import uuid from 'uuid/v4';
import * as d3 from 'd3';

import styles from './style.css';
import Node from '../node/Node';
import Link from '../link/Link';

const mockSecondaryLabels = {
  keyA: 'val A',
  keyB: 'val B',
  keyC: 'val C',
};

export default class Tree extends React.Component {

  static defaultProps = {
    orientation: 'horizontal',
  }

  static propTypes = {
    data: PropTypes.array.isRequired,
    orientation: PropTypes.oneOf([
      'horizontal',
      'vertical',
    ]).isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      data: this.assignCustomProperties(clone(this.props.data)),
    };
    this.findTargetNode = this.findTargetNode.bind(this);
    this.collapseNode = this.collapseNode.bind(this);
    this.handleNodeToggle = this.handleNodeToggle.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({ data: this.assignCustomProperties(clone(nextProps.data)) });
    }
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
    return data.map((node) => {
      node.id = uuid();
      node._collapsed = false;
      if (node.children && node.children.length > 0) {
        node.children = this.assignCustomProperties(node.children);
        node._children = node.children;
      }
      return node;
    });
  }

  generateTree() {
    const tree = d3.layout.tree()
      .nodeSize([100 + 40, 100 + 40])
      .separation((d) => d._children ? 1.2 : 0.9)
      .children((d) => d._collapsed ? null : d._children);

    const rootNode = this.state.data[0];
    const nodes = tree.nodes(rootNode);
    const links = tree.links(nodes);

    return { nodes, links };
  }

  // TODO Refactor this into a more readable/reasonable recursive depth-first walk.
  findTargetNode(nodeId, nodeSet) {
    const hits = nodeSet.filter((node) => node.id === nodeId);

    if (hits.length > 0) {
      const targetNode = hits[0];
      return targetNode;
    }

    return nodeSet.map((node) => {
      if (node._children && node._children.length > 0) {
        return this.findTargetNode(nodeId, node._children);
      }
    })[0];
  }

  collapseNode(node) {
    node._collapsed = true;
    if (node._children && node._children.length > 0) {
      node._children.forEach((child) => {
        this.collapseNode(child);
      });
    }
  }

  expandNode(node) {
    node._collapsed = false;
  }

  handleNodeToggle(nodeId) {
    const data = clone(this.state.data);
    const targetNode = this.findTargetNode(nodeId, data);
    targetNode._collapsed
      ? this.expandNode(targetNode)
      : this.collapseNode(targetNode);
    this.setState({ data });
  }

  render() {
    const { orientation } = this.props;
    const { nodes, links } = this.generateTree();
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
                onClick={this.handleNodeToggle}
              />
            )}
            {links.map((linkData, i) =>
              <Link
                key={`link-${i}`}
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
