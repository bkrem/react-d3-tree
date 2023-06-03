"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var d3_selection_1 = require("d3-selection");
var DefaultNodeElement_js_1 = __importDefault(require("./DefaultNodeElement.js"));
var Node = /** @class */ (function (_super) {
    __extends(Node, _super);
    function Node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodeRef = null;
        _this.state = {
            transform: _this.setTransform(_this.props.position, _this.props.parent, _this.props.orientation, true),
            initialStyle: {
                opacity: 0,
            },
            wasClicked: false,
        };
        _this.shouldNodeTransform = function (ownProps, nextProps, ownState, nextState) {
            return nextProps.subscriptions !== ownProps.subscriptions ||
                nextProps.position.x !== ownProps.position.x ||
                nextProps.position.y !== ownProps.position.y ||
                nextProps.orientation !== ownProps.orientation ||
                nextState.wasClicked !== ownState.wasClicked;
        };
        // TODO: needs tests
        _this.renderNodeElement = function () {
            var _a = _this.props, data = _a.data, hierarchyPointNode = _a.hierarchyPointNode, renderCustomNodeElement = _a.renderCustomNodeElement;
            var renderNode = typeof renderCustomNodeElement === 'function' ? renderCustomNodeElement : DefaultNodeElement_js_1.default;
            var nodeProps = {
                hierarchyPointNode: hierarchyPointNode,
                nodeDatum: data,
                toggleNode: _this.handleNodeToggle,
                onNodeClick: _this.handleOnClick,
                onNodeMouseOver: _this.handleOnMouseOver,
                onNodeMouseOut: _this.handleOnMouseOut,
                addChildren: _this.handleAddChildren,
                removeNode: _this.handleRemoveNode,
                replaceChildren: _this.handleReplaceChildren,
                updateNodeAttributes: _this.handleUpdateNodeAttributes,
            };
            return renderNode(nodeProps);
        };
        _this.handleNodeToggle = function () {
            _this.setState({ wasClicked: true });
            _this.props.onNodeToggle(_this.props.data.__rd3t.id);
        };
        _this.handleOnClick = function (evt) {
            _this.setState({ wasClicked: true });
            _this.props.onNodeClick(_this.props.hierarchyPointNode, evt);
        };
        _this.handleOnMouseOver = function (evt) {
            _this.props.onNodeMouseOver(_this.props.hierarchyPointNode, evt);
        };
        _this.handleOnMouseOut = function (evt) {
            _this.props.onNodeMouseOut(_this.props.hierarchyPointNode, evt);
        };
        _this.handleAddChildren = function (childrenData, callback) {
            _this.props.handleAddChildrenToNode(_this.props.data.__rd3t.id, childrenData, false, callback);
        };
        _this.handleReplaceChildren = function (childrenData, callback) {
            _this.props.handleAddChildrenToNode(_this.props.data.__rd3t.id, childrenData, true, callback);
        };
        _this.handleUpdateNodeAttributes = function (attributes, callback) {
            _this.props.handleUpdateNodeAttributes(_this.props.data.__rd3t.id, attributes, callback);
        };
        _this.handleRemoveNode = function (callback) {
            _this.props.handleRemoveNode(_this.props.data.__rd3t.id, _this.props.parent.data.__rd3t.id, callback);
        };
        return _this;
    }
    Node.prototype.componentDidMount = function () {
        this.commitTransform();
    };
    Node.prototype.componentDidUpdate = function () {
        if (this.state.wasClicked) {
            this.props.centerNode(this.props.hierarchyPointNode);
            this.setState({ wasClicked: false });
        }
        this.commitTransform();
    };
    Node.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return this.shouldNodeTransform(this.props, nextProps, this.state, nextState);
    };
    Node.prototype.setTransform = function (position, parent, orientation, shouldTranslateToOrigin) {
        if (shouldTranslateToOrigin === void 0) { shouldTranslateToOrigin = false; }
        if (shouldTranslateToOrigin) {
            var hasParent = parent !== null && parent !== undefined;
            var originX = hasParent ? parent.x : 0;
            var originY = hasParent ? parent.y : 0;
            return orientation === 'horizontal'
                ? "translate(".concat(originY, ",").concat(originX, ")")
                : "translate(".concat(originX, ",").concat(originY, ")");
        }
        return orientation === 'horizontal'
            ? "translate(".concat(position.y, ",").concat(position.x, ")")
            : "translate(".concat(position.x, ",").concat(position.y, ")");
    };
    Node.prototype.applyTransform = function (transform, transitionDuration, opacity, done) {
        if (opacity === void 0) { opacity = 1; }
        if (done === void 0) { done = function () { }; }
        if (this.props.enableLegacyTransitions) {
            (0, d3_selection_1.select)(this.nodeRef)
                // @ts-ignore
                .transition()
                .duration(transitionDuration)
                .attr('transform', transform)
                .style('opacity', opacity)
                .on('end', done);
        }
        else {
            (0, d3_selection_1.select)(this.nodeRef)
                .attr('transform', transform)
                .style('opacity', opacity);
            done();
        }
    };
    Node.prototype.commitTransform = function () {
        var _a = this.props, orientation = _a.orientation, transitionDuration = _a.transitionDuration, position = _a.position, parent = _a.parent;
        var transform = this.setTransform(position, parent, orientation);
        this.applyTransform(transform, transitionDuration);
    };
    Node.prototype.componentWillLeave = function (done) {
        var _a = this.props, orientation = _a.orientation, transitionDuration = _a.transitionDuration, position = _a.position, parent = _a.parent;
        var transform = this.setTransform(position, parent, orientation, true);
        this.applyTransform(transform, transitionDuration, 0, done);
    };
    Node.prototype.render = function () {
        var _this = this;
        var _a = this.props, data = _a.data, nodeClassName = _a.nodeClassName;
        return (react_1.default.createElement("g", { id: data.__rd3t.id, ref: function (n) {
                _this.nodeRef = n;
            }, style: this.state.initialStyle, className: [
                data.children && data.children.length > 0 ? 'rd3t-node' : 'rd3t-leaf-node',
                nodeClassName,
            ]
                .join(' ')
                .trim(), transform: this.state.transform }, this.renderNodeElement()));
    };
    return Node;
}(react_1.default.Component));
exports.default = Node;
