import React from 'react';
import T from 'prop-types';
import { TransitionGroup } from 'react-transition-group';

const TransitionGroupWrapper = props =>
  props.enableLegacyTransitions ? (
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

TransitionGroupWrapper.propTypes = {
  enableLegacyTransitions: T.bool.isRequired,
  component: T.string.isRequired,
  className: T.string.isRequired,
  transform: T.string.isRequired,
  children: T.array.isRequired,
};

export default TransitionGroupWrapper;
