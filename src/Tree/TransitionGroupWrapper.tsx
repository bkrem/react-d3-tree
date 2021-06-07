import React from 'react';
import { TransitionGroup } from '@bkrem/react-transition-group';

interface TransitionGroupWrapperProps {
  enableLegacyTransitions: boolean;
  component: string;
  className: string;
  transform: string;
  children: React.ReactNode;
}

const TransitionGroupWrapper = (props: TransitionGroupWrapperProps) =>
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

export default TransitionGroupWrapper;
