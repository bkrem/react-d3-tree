import React from 'react';
import { TransitionGroup } from 'react-transition-group';

type NodeWrapperProps = {
  transitionDuration: number;
  component: string;
  className: string;
  transform: string;
  children: any;
};

const NodeWrapper: React.FC<NodeWrapperProps> = props =>
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

export default NodeWrapper;
