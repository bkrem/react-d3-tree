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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var d3_shape_1 = require("d3-shape");
var d3_selection_1 = require("d3-selection");
var Link = /** @class */ (function (_super) {
    __extends(Link, _super);
    function Link() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.linkRef = null;
        _this.state = {
            initialStyle: {
                opacity: 0,
            },
        };
        _this.handleOnClick = function (evt) {
            _this.props.onClick(_this.props.linkData.source, _this.props.linkData.target, evt);
        };
        _this.handleOnMouseOver = function (evt) {
            _this.props.onMouseOver(_this.props.linkData.source, _this.props.linkData.target, evt);
        };
        _this.handleOnMouseOut = function (evt) {
            _this.props.onMouseOut(_this.props.linkData.source, _this.props.linkData.target, evt);
        };
        return _this;
    }
    Link.prototype.componentDidMount = function () {
        this.applyOpacity(1, this.props.transitionDuration);
    };
    Link.prototype.componentWillLeave = function (done) {
        this.applyOpacity(0, this.props.transitionDuration, done);
    };
    Link.prototype.applyOpacity = function (opacity, transitionDuration, done) {
        if (done === void 0) { done = function () { }; }
        if (this.props.enableLegacyTransitions) {
            (0, d3_selection_1.select)(this.linkRef)
                // @ts-ignore
                .transition()
                .duration(transitionDuration)
                .style('opacity', opacity)
                .on('end', done);
        }
        else {
            (0, d3_selection_1.select)(this.linkRef).style('opacity', opacity);
            done();
        }
    };
    Link.prototype.drawStepPath = function (linkData, orientation) {
        var source = linkData.source, target = linkData.target;
        var deltaY = target.y - source.y;
        return orientation === 'horizontal'
            ? "M".concat(source.y, ",").concat(source.x, " H").concat(source.y + deltaY / 2, " V").concat(target.x, " H").concat(target.y)
            : "M".concat(source.x, ",").concat(source.y, " V").concat(source.y + deltaY / 2, " H").concat(target.x, " V").concat(target.y);
    };
    Link.prototype.drawDiagonalPath = function (linkData, orientation) {
        var source = linkData.source, target = linkData.target;
        return orientation === 'horizontal'
            ? (0, d3_shape_1.linkHorizontal)()({
                source: [source.y, source.x],
                target: [target.y, target.x],
            })
            : (0, d3_shape_1.linkVertical)()({
                source: [source.x, source.y],
                target: [target.x, target.y],
            });
    };
    Link.prototype.drawStraightPath = function (linkData, orientation) {
        var source = linkData.source, target = linkData.target;
        return orientation === 'horizontal'
            ? "M".concat(source.y, ",").concat(source.x, "L").concat(target.y, ",").concat(target.x)
            : "M".concat(source.x, ",").concat(source.y, "L").concat(target.x, ",").concat(target.y);
    };
    Link.prototype.drawElbowPath = function (linkData, orientation) {
        return orientation === 'horizontal'
            ? "M".concat(linkData.source.y, ",").concat(linkData.source.x, "V").concat(linkData.target.x, "H").concat(linkData.target.y)
            : "M".concat(linkData.source.x, ",").concat(linkData.source.y, "V").concat(linkData.target.y, "H").concat(linkData.target.x);
    };
    Link.prototype.drawPath = function () {
        var _a = this.props, linkData = _a.linkData, orientation = _a.orientation, pathFunc = _a.pathFunc;
        if (typeof pathFunc === 'function') {
            return pathFunc(linkData, orientation);
        }
        if (pathFunc === 'elbow') {
            return this.drawElbowPath(linkData, orientation);
        }
        if (pathFunc === 'straight') {
            return this.drawStraightPath(linkData, orientation);
        }
        if (pathFunc === 'step') {
            return this.drawStepPath(linkData, orientation);
        }
        return this.drawDiagonalPath(linkData, orientation);
    };
    Link.prototype.getClassNames = function () {
        var _a = this.props, linkData = _a.linkData, orientation = _a.orientation, pathClassFunc = _a.pathClassFunc;
        var classNames = ['rd3t-link'];
        if (typeof pathClassFunc === 'function') {
            classNames.push(pathClassFunc(linkData, orientation));
        }
        return classNames.join(' ').trim();
    };
    Link.prototype.render = function () {
        var _this = this;
        var linkData = this.props.linkData;
        return (react_1.default.createElement("path", { ref: function (l) {
                _this.linkRef = l;
            }, style: __assign({}, this.state.initialStyle), className: this.getClassNames(), d: this.drawPath(), onClick: this.handleOnClick, onMouseOver: this.handleOnMouseOver, onMouseOut: this.handleOnMouseOut, "data-source-id": linkData.source.id, "data-target-id": linkData.target.id }));
    };
    return Link;
}(react_1.default.PureComponent));
exports.default = Link;
