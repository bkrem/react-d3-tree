import React from 'react';
import T from 'prop-types';
import { TransitionGroup } from 'react-transition-group';

// eslint-disable-next-line
const NodeWrapper = props =>
  props.transitionDuration > 0 ? (
    <TransitionGroup
      component={props.component}
      className={props.className}
      transform={props.transform}
    >
      {props.children}
    </TransitionGroup>
  ) : (
    <g className={props.className} transform={props.transform}>
      {props.children}
    </g>
  );

NodeWrapper.defaultProps = {
  component: 'g',
};

NodeWrapper.propTypes = {
  transitionDuration: T.number.isRequired,
  component: T.string,
  className: T.string.isRequired,
  transform: T.string.isRequired,
  children: T.array.isRequired,
};

export default NodeWrapper;
