import React from 'react';
import T from 'prop-types';

export const BASE_MARGIN = 24;

export default class ForeignObjectElement extends React.PureComponent {
  render() {
    const { nodeData, nodeSize, render, foreignObjectWrapper } = this.props;
    const sizeConfig = typeof foreignObjectWrapper === 'function'? foreignObjectWrapper({ node: nodeData }):
      foreignObjectWrapper;
    return (
      <foreignObject
        width={nodeSize.x - BASE_MARGIN}
        height={nodeSize.y - BASE_MARGIN}
        {...sizeConfig}
      >
        {React.cloneElement(render, { nodeData })}
      </foreignObject>
    );
  }
}

ForeignObjectElement.defaultProps = {
  foreignObjectWrapper: {},
};

ForeignObjectElement.propTypes = {
  render: T.oneOfType([T.element, T.node]).isRequired,
  nodeData: T.object.isRequired,
  nodeSize: T.shape({
    x: T.number,
    y: T.number,
  }).isRequired,
  foreignObjectWrapper: T.oneOfType([T.func, T.object]),
};
