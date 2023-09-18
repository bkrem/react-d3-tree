"use strict";
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
var DEFAULT_NODE_CIRCLE_RADIUS = 15;
var textLayout = {
    title: {
        textAnchor: 'start',
        x: 40,
    },
    attribute: {
        x: 40,
        dy: '1.2em',
    },
};
var DefaultNodeElement = function (_a) {
    var nodeDatum = _a.nodeDatum, toggleNode = _a.toggleNode, onNodeClick = _a.onNodeClick, onNodeMouseOver = _a.onNodeMouseOver, onNodeMouseOut = _a.onNodeMouseOut;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("circle", { r: DEFAULT_NODE_CIRCLE_RADIUS, onClick: function (evt) {
                toggleNode();
                onNodeClick(evt);
            }, onMouseOver: onNodeMouseOver, onMouseOut: onNodeMouseOut }),
        react_1.default.createElement("g", { className: "rd3t-label" },
            react_1.default.createElement("text", __assign({ className: "rd3t-label__title" }, textLayout.title), nodeDatum.name),
            react_1.default.createElement("text", { className: "rd3t-label__attributes" }, nodeDatum.attributes &&
                Object.entries(nodeDatum.attributes).map(function (_a, i) {
                    var labelKey = _a[0], labelValue = _a[1];
                    return (react_1.default.createElement("tspan", __assign({ key: "".concat(labelKey, "-").concat(i) }, textLayout.attribute),
                        labelKey,
                        ": ",
                        typeof labelValue === 'boolean' ? labelValue.toString() : labelValue));
                })))));
};
exports.default = DefaultNodeElement;
