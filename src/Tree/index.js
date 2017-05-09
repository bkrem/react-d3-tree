import React, { PropTypes } from 'react';
import { layout } from 'd3';
import clone from 'clone';
import uuid from 'uuid';

import Node from '../Node';
import Link from '../Link';
import './style.css';

export default class Tree extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      initialRender: true,
      data: this.assignCustomProperties(clone(this.props.data)),
    };
    this.findTargetNode = this.findTargetNode.bind(this);
    this.collapseNode = this.collapseNode.bind(this);
    this.handleNodeToggle = this.handleNodeToggle.bind(this);
  }

  componentDidMount() {
    // TODO find better way of setting initialDepth, re-render here is suboptimal
    this.setState({ initialRender: false }); // eslint-disable-line
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({ data: this.assignCustomProperties(clone(nextProps.data)) });
    }
  }

  setInitialTreeDepth(nodeSet, initialDepth) {
    console.log('setInitialTreeDepth: ', initialDepth);
    nodeSet.forEach((n) => {
      n._collapsed = n.depth >= initialDepth;
    });
  }

  assignCustomProperties(data) {
    return data.map((node) => {
      node.id = uuid.v4();
      node._collapsed = false;
      // if there are children, recursively assign properties to them too
      if (node.children && node.children.length > 0) {
        node.children = this.assignCustomProperties(node.children);
        node._children = node.children;
      }
      return node;
    });
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
    if (this.props.collapsible) {
      const data = clone(this.state.data);
      const targetNode = this.findTargetNode(nodeId, data);
      targetNode._collapsed
        ? this.expandNode(targetNode)
        : this.collapseNode(targetNode);
      this.setState({ data });
    }
  }

  generateTree() {
    const { initialDepth } = this.props;
    const tree = layout.tree()
      .nodeSize([100 + 40, 100 + 40])
      .separation((d) => d._children ? 1.2 : 0.9)
      .children((d) => d._collapsed ? null : d._children);

    const rootNode = this.state.data[0];
    const nodes = tree.nodes(rootNode);
    const links = tree.links(nodes);

    // set `initialDepth` on first render if specified
    if (initialDepth !== undefined && this.state.initialRender) {
      this.setInitialTreeDepth(nodes, initialDepth);
    }

    return { nodes, links };
  }

  render() {
    const { orientation, translate, pathFunc } = this.props;
    const { nodes, links } = this.generateTree();
    console.log(links[0]);
    return (
      <div className="treeContainer">
        <svg width="100%" height="100%">
          <g transform={`translate(${translate.x},${translate.y})`}>

            {nodes.map((nodeData) =>
              <Node
                key={nodeData.id}
                orientation={orientation}
                textAnchor="start"
                nodeData={nodeData}
                primaryLabel={nodeData.name}
                secondaryLabels={nodeData.attributes}
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
  translate: { x: 0, y: 0 },
  pathFunc: 'diagonal',
  collapsible: true,
  initialDepth: undefined,
};

Tree.propTypes = {
  data: PropTypes.array.isRequired,
  orientation: PropTypes.oneOf([
    'horizontal',
    'vertical',
  ]),
  translate: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  pathFunc: PropTypes.oneOf([
    'diagonal',
    'elbow',
  ]),
  collapsible: PropTypes.bool,
  initialDepth: PropTypes.number,
};
