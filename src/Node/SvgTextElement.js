import React from 'react';
import uuid from 'uuid';
import T from 'prop-types';

export default class SvgTextElement extends React.PureComponent {
  render() {
    const { labelNameProps, labelAttributeProps, nameData, attributesData } = this.props;
    return (
      <g>
        <text className="labelNameBase" {...labelNameProps}>
          {nameData}
        </text>
        <text className="labelAttributesBase">
          {attributesData &&
            Object.entries(attributesData).map(([labelKey, labelValue]) => (
              <tspan {...labelAttributeProps} key={uuid.v4()}>
                {labelKey}: {labelValue}
              </tspan>
            ))}
        </text>
      </g>
    );
  }
}

SvgTextElement.defaultProps = {
  attributesData: undefined,
};

SvgTextElement.propTypes = {
  nameData: T.string.isRequired,
  attributesData: T.object,
  labelNameProps: T.object.isRequired,
  labelAttributeProps: T.object.isRequired,
};
