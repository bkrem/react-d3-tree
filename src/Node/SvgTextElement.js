import React from 'react';
import uuid from 'uuid';
import T from 'prop-types';

export default class SvgTextElement extends React.PureComponent {
  render() {
    const { name, nodeStyle, textLayout, attributes, type } = this.props;
    return (
      <g>
        <text
          className="nodeNameBase"
          style={nodeStyle.name}
          textAnchor={textLayout.textAnchor}
          x={textLayout.x}
          y={textLayout.y}
          transform={textLayout.transform}
          dy=".35em"
        >
          {name}
        </text>
        <text
          className="nodeAttributesBase"
          y={textLayout.y + 10}
          textAnchor={textLayout.textAnchor}
          transform={textLayout.transform}
          style={nodeStyle.attributes}
        >
          {attributes &&
            Object.keys(attributes).map(labelKey => (
              <div>
                <tspan x={textLayout.x} dy="1.2em" key={uuid.v4()}>
                  {labelKey}: {attributes[labelKey]}
                </tspan>
              </div>
            ))}
        </text>
        <g>
          {
            <button className='node_btn'>
             add new{type}
            </button>
          }
        </g>
      </g>
    );
  }
}

SvgTextElement.defaultProps = {
  attributes: undefined,
  type: undefined,
};

SvgTextElement.propTypes = {
  name: T.string.isRequired,
  attributes: T.object,
  textLayout: T.object.isRequired,
  nodeStyle: T.object.isRequired,
  type: T.object,
};
