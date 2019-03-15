import React from 'react';
import { shallow } from 'enzyme';

import SvgTextElement from '../SvgTextElement';

describe('<SvgTextElement />', () => {
  const mockProps = {
    nameData: 'name from data',
    textLayout: {},
    nodeStyle: {},
    attributesData: {
      'attribute 1 from data': 'value 1',
      'attribute 2 from data': 'value 2',
    },
  };

  describe('label name', () => {
    it('applies `labelNameProps` to label name', () => {
      const fixture = {
        textAnchor: 'start',
        x: 999,
        y: 111,
      };
      const renderedComponent = shallow(<SvgTextElement {...mockProps} labelNameProps={fixture} />);
      const nodeName = renderedComponent
        .find('text')
        .findWhere(n => n.prop('className') === 'labelNameBase');
      expect(nodeName.props()).toEqual(expect.objectContaining(fixture));
    });
  });

  describe('label attributes', () => {
    it('maps label attributes to <tspan> elements', () => {
      const fixture = { keyA: 'valA', keyB: 'valB' };
      const renderedComponent = shallow(<SvgTextElement {...mockProps} attributesData={fixture} />);
      const textNode = renderedComponent
        .find('text')
        .findWhere(n => n.prop('className') === 'labelAttributesBase');

      expect(textNode.findWhere(n => n.text() === `keyA: ${fixture.keyA}`).length).toBe(1);
      expect(textNode.findWhere(n => n.text() === `keyB: ${fixture.keyB}`).length).toBe(1);
    });
    it('applies `labelAttributeProps` to each label attribute', () => {
      const fixture = {
        textAnchor: 'start',
        x: 999,
        y: 111,
      };
      const renderedComponent = shallow(
        <SvgTextElement {...mockProps} labelAttributeProps={fixture} />,
      );
      const firstNodeAttribute = renderedComponent.find('tspan').first();
      const lastNodeAttribute = renderedComponent.find('tspan').last();
      expect(firstNodeAttribute.props()).toEqual(expect.objectContaining(fixture));
      expect(lastNodeAttribute.props()).toEqual(expect.objectContaining(fixture));
    });
  });
});
