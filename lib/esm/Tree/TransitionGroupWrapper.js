import React from 'react';
import { TransitionGroup } from '@bkrem/react-transition-group';
const TransitionGroupWrapper = (props) => props.enableLegacyTransitions ? (React.createElement(TransitionGroup, { component: props.component, className: props.className, transform: props.transform }, props.children)) : (React.createElement("g", { className: props.className, transform: props.transform }, props.children));
export default TransitionGroupWrapper;
