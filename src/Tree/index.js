import React, { PropTypes } from 'react';
import clone from 'clone';
import uuid from 'uuid';
import * as d3 from 'd3';

import Node from '../Node';
import Link from '../Link';
import './style.css';

const mockSecondaryLabels = {
  keyA: 'val A',
  keyB: 'val B',
  keyC: 'val C',
};

export default class Tree extends React.Component {

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
      node.id = uuid.v4();
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
      return null;
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
    const { orientation, pathFunc } = this.props;
    const { nodes, links } = this.generateTree();
    return (
      <div className="treeContainer">
        <svg width="100%" height="100%">
          <g transform="translate(200,200)">
            {nodes.map((nodeData) =>
              <Node
                key={nodeData.id}
                orientation={orientation}
                textAnchor="start"
                nodeData={nodeData}
                primaryLabel={nodeData.name}
                secondaryLabels={mockSecondaryLabels}
                onClick={this.handleNodeToggle}
              />
            )}
            {links.map((linkData) =>
              <Link
                key={uuid.v4()}
                orientation={orientation}
                pathFunc={pathFunc}
                linkData={linkData}
              />
            )}
          </g>
        </svg>
      </div>
    );
  }
}

Tree.defaultProps = {
  orientation: 'horizontal',
  pathFunc: 'diagonal',
};

Tree.propTypes = {
  data: PropTypes.array.isRequired,
  orientation: PropTypes.oneOf([
    'horizontal',
    'vertical',
  ]).isRequired,
  pathFunc: PropTypes.oneOf([
    'diagonal',
    'elbow',
  ]).isRequired,
};
