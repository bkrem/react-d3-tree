import React, { useContext, Context, useState } from 'react';

type NodeId = string;
type TreeNodeMap = Record<NodeId, { isCollapsing: boolean; subscribers: Array<Function> }>;
type AnimationContextType = {
  treeNodeMap: TreeNodeMap;
  registerTreeNodeId: (nodeId: NodeId, done) => void;
  subscribeToParentNode: (parentNodeId: NodeId, callbackFn: () => void) => void;
  triggerNodeCollapse: (nodeId: NodeId) => void;
};

export const AnimationContext = React.createContext({} as AnimationContextType);

export class AnimationContextProvider extends React.Component {
  state = {};

  registerTreeNodeId = (nodeId: NodeId, done) => {
    this.setState(
      prevTreeNodeMap => ({
        ...prevTreeNodeMap,
        [nodeId]: { isCollapsing: false, subscribers: [] },
      }),
      done
    );
  };

  subscribeToParentNode = (parentNodeId: NodeId, callbackFn: () => void) => {
    console.log('subscribing: ', this.state[parentNodeId]);
    this.state[parentNodeId].subscribers.push(callbackFn);
  };

  triggerNodeCollapse = (nodeId: NodeId) => {
    console.log('trigger collapse for: ', this.state[nodeId].subscribers);
    this.state[nodeId].subscribers.forEach(cb => {
      cb();
    });
  };

  render() {
    return (
      <AnimationContext.Provider
        value={{
          treeNodeMap: this.state,
          registerTreeNodeId: this.registerTreeNodeId,
          subscribeToParentNode: this.subscribeToParentNode,
          triggerNodeCollapse: this.triggerNodeCollapse,
        }}
      >
        {this.props.children}
      </AnimationContext.Provider>
    );
  }
}
