"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_transition_group_1 = require("@bkrem/react-transition-group");
var TransitionGroupWrapper = function (props) {
    return props.enableLegacyTransitions ? (react_1.default.createElement(react_transition_group_1.TransitionGroup, { component: props.component, className: props.className, transform: props.transform }, props.children)) : (react_1.default.createElement("g", { className: props.className, transform: props.transform }, props.children));
};
exports.default = TransitionGroupWrapper;
