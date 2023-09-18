import React from 'react';
import { select } from 'd3-selection';
import DefaultNodeElement from './DefaultNodeElement.js';
export default class Node extends React.Component {
    constructor() {
        super(...arguments);
        this.nodeRef = null;
        this.state = {
            transform: this.setTransform(this.props.position, this.props.parent, this.props.orientation, true),
            initialStyle: {
                opacity: 0,
            },
            wasClicked: false,
        };
        this.shouldNodeTransform = (ownProps, nextProps, ownState, nextState) => nextProps.subscriptions !== ownProps.subscriptions ||
            nextProps.position.x !== ownProps.position.x ||
            nextProps.position.y !== ownProps.position.y ||
            nextProps.orientation !== ownProps.orientation ||
            nextState.wasClicked !== ownState.wasClicked;
        // TODO: needs tests
        this.renderNodeElement = () => {
            const { data, hierarchyPointNode, renderCustomNodeElement } = this.props;
            const renderNode = typeof renderCustomNodeElement === 'function' ? renderCustomNodeElement : DefaultNodeElement;
            const nodeProps = {
                hierarchyPointNode: hierarchyPointNode,
                nodeDatum: data,
                toggleNode: this.handleNodeToggle,
                onNodeClick: this.handleOnClick,
                onNodeMouseOver: this.handleOnMouseOver,
                onNodeMouseOut: this.handleOnMouseOut,
                addChildren: this.handleAddChildren,
            };
            return renderNode(nodeProps);
        };
        this.handleNodeToggle = () => {
            this.setState({ wasClicked: true });
            this.props.onNodeToggle(this.props.data.__rd3t.id);
        };
        this.handleOnClick = evt => {
            this.setState({ wasClicked: true });
            this.props.onNodeClick(this.props.hierarchyPointNode, evt);
        };
        this.handleOnMouseOver = evt => {
            this.props.onNodeMouseOver(this.props.hierarchyPointNode, evt);
        };
        this.handleOnMouseOut = evt => {
            this.props.onNodeMouseOut(this.props.hierarchyPointNode, evt);
        };
        this.handleAddChildren = childrenData => {
            this.props.handleAddChildrenToNode(this.props.data.__rd3t.id, childrenData);
        };
    }
    componentDidMount() {
        this.commitTransform();
    }
    componentDidUpdate() {
        if (this.state.wasClicked) {
            this.props.centerNode(this.props.hierarchyPointNode);
            this.setState({ wasClicked: false });
        }
        this.commitTransform();
    }
    shouldComponentUpdate(nextProps, nextState) {
        return this.shouldNodeTransform(this.props, nextProps, this.state, nextState);
    }
    setTransform(position, parent, orientation, shouldTranslateToOrigin = false) {
        if (shouldTranslateToOrigin) {
            const hasParent = parent !== null && parent !== undefined;
            const originX = hasParent ? parent.x : 0;
            const originY = hasParent ? parent.y : 0;
            return orientation === 'horizontal'
                ? `translate(${originY},${originX})`
                : `translate(${originX},${originY})`;
        }
        return orientation === 'horizontal'
            ? `translate(${position.y},${position.x})`
            : `translate(${position.x},${position.y})`;
    }
    applyTransform(transform, transitionDuration, opacity = 1, done = () => { }) {
        if (this.props.enableLegacyTransitions) {
            select(this.nodeRef)
                // @ts-ignore
                .transition()
                .duration(transitionDuration)
                .attr('transform', transform)
                .style('opacity', opacity)
                .on('end', done);
        }
        else {
            select(this.nodeRef)
                .attr('transform', transform)
                .style('opacity', opacity);
            done();
        }
    }
    commitTransform() {
        const { orientation, transitionDuration, position, parent } = this.props;
        const transform = this.setTransform(position, parent, orientation);
        this.applyTransform(transform, transitionDuration);
    }
    componentWillLeave(done) {
        const { orientation, transitionDuration, position, parent } = this.props;
        const transform = this.setTransform(position, parent, orientation, true);
        this.applyTransform(transform, transitionDuration, 0, done);
    }
    render() {
        const { data, nodeClassName } = this.props;
        return (React.createElement("g", { id: data.__rd3t.id, ref: n => {
                this.nodeRef = n;
            }, style: this.state.initialStyle, className: [
                data.children && data.children.length > 0 ? 'rd3t-node' : 'rd3t-leaf-node',
                nodeClassName,
            ]
                .join(' ')
                .trim(), transform: this.state.transform }, this.renderNodeElement()));
    }
}
