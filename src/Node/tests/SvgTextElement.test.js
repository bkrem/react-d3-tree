import React from 'react';
import { shallow } from 'enzyme';

import SvgTextElement from '../SvgTextElement';

describe('<SvgTextElement />', () => {
  const mockProps = {
    name: 'svgNodeName',
    textLayout: {},
    nodeStyle: {},
    attributes: {
      'attribute 1': 'value 1',
      'attribute 2': 'value 2',
    },
  };

  it('maps each `props.attributes` to a <tspan> element', () => {
    const fixture = { keyA: 'valA', keyB: 'valB' };
    const renderedComponent = shallow(<SvgTextElement {...mockProps} attributes={fixture} />);
    const textNode = renderedComponent
      .find('text')
      .findWhere(n => n.prop('className') === 'nodeAttributesBase');

    expect(textNode.findWhere(n => n.text() === `keyA: ${fixture.keyA}`).length).toBe(1);
    expect(textNode.findWhere(n => n.text() === `keyB: ${fixture.keyB}`).length).toBe(1);
  });

  it('applies the `textLayout` prop to the node name & attributes', () => {
    const fixture = {
      textAnchor: 'test',
      x: 999,
      y: 111,
    };
    const renderedComponent = shallow(<SvgTextElement {...mockProps} textLayout={fixture} />);
    const nodeName = renderedComponent
      .find('text')
      .findWhere(n => n.prop('className') === 'nodeNameBase');
    const nodeAttribute = renderedComponent.find('tspan').first();
    expect(nodeName.props()).toEqual(expect.objectContaining(fixture));
    expect(nodeAttribute.prop('x')).toBe(fixture.x);
  });
});
