import React from 'react';
import PropTypes from 'prop-types';

export const BASE_MARGIN = 24;

export default class ForeignObjectElement extends React.PureComponent {
  render() {
    const { nodeData, nodeSize, render, foreignObjectWrapper } = this.props;
    return (
      <foreignObject
        width={nodeSize.x - BASE_MARGIN}
        height={nodeSize.y - BASE_MARGIN}
        {...foreignObjectWrapper}
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
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.node]).isRequired,
  nodeData: PropTypes.object.isRequired,
  nodeSize: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
  foreignObjectWrapper: PropTypes.object,
};
