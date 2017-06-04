import React from 'react';
import { shallow } from 'enzyme';

import Node from '../index';

describe('<Node />', () => {
  const nodeData = {
    id: 'abc123',
    name: 'mockNode',
    depth: 3,
    x: 123,
    y: 321,
  };

  const mockProps = {
    nodeData,
    orientation: 'horizontal',
    transitions: {
      enabled: true,
      duration: 500,
    },
  };

  it('has the correct `id` attribute value', () => {
    const renderedComponent = shallow(
      <Node {...mockProps} />
    );

    expect(renderedComponent.find('g').prop('id')).toBe(nodeData.id);
  });

  it('applies correct base className if `nodeData._children` is defined', () => {
    const noChildrenComponent = shallow(
      <Node {...mockProps} />
    );
    const withChildrenComponent = shallow(
      <Node
        {...mockProps}
        nodeData={{ ...nodeData, _children: [] }}
      />
    );

    expect(noChildrenComponent.prop('className')).toBe('leafNodeBase');
    expect(withChildrenComponent.prop('className')).toBe('nodeBase');
  });

  it('applies correct <circle> style prop if `nodeData._children` is defined', () => {
    const leafCircleStyle = { fill: 'blue' };
    const circleStyle = { fill: 'green' };
    const noChildrenComponent = shallow(
      <Node
        {...mockProps}
        leafCircleStyle={leafCircleStyle}
        circleStyle={circleStyle}
      />
    );
    const withChildrenComponent = shallow(
      <Node
        {...mockProps}
        nodeData={{ ...nodeData, _children: [] }}
        leafCircleStyle={leafCircleStyle}
        circleStyle={circleStyle}
      />
    );

    expect(noChildrenComponent.find('circle').prop('style')).toBe(leafCircleStyle);
    expect(withChildrenComponent.find('circle').prop('style')).toBe(circleStyle);
  });

  it('applies correct `transform` prop, depending on parent `orientation`', () => {
    const horizontalTransform = `translate(${nodeData.y},${nodeData.x})`;
    const verticalTransform = `translate(${nodeData.x},${nodeData.y})`;
    const horizontalComponent = shallow(
      <Node {...mockProps} />
    );
    const verticalComponent = shallow(
      <Node
        {...mockProps}
        orientation="vertical"
      />
    );

    expect(horizontalComponent.prop('transform')).toBe(horizontalTransform);
    expect(verticalComponent.prop('transform')).toBe(verticalTransform);
  });

  it('should take an `onClick` prop', () => {
    const renderedComponent = shallow(
      <Node
        {...mockProps}
        onClick={() => {}}
      />
    );

    expect(renderedComponent.prop('onClick')).toBeDefined();
  });

  it('handles click events and pass the nodeId to onClick handler', () => {
    const onClickSpy = jest.fn();
    const renderedComponent = shallow(
      <Node
        {...mockProps}
        onClick={onClickSpy}
      />
    );

    renderedComponent.simulate('click');
    expect(onClickSpy).toHaveBeenCalledWith(nodeData.id);
  });

  it('maps each `props.secondaryLabels` to a <tspan> element', () => {
    const fixture = { keyA: 'valA', keyB: 'valB' };
    const renderedComponent = shallow(
      <Node
        {...mockProps}
        secondaryLabels={fixture}
      />
    );
    const textNode = renderedComponent
      .find('text')
      .findWhere((n) => n.prop('className') === 'secondaryLabelsBase');

    expect(textNode.findWhere((n) =>
      n.text() === `keyA: ${fixture.keyA}`).length
    ).toBe(1);
    expect(textNode.findWhere((n) =>
      n.text() === `keyB: ${fixture.keyB}`).length
    ).toBe(1);
  });

  it('mutates a node\'s `y` property according to `depthFactor`, when specified', () => {
    const depthFactor = 100;
    const expectedY = nodeData.depth * depthFactor;
    const renderedComponent = shallow(
      <Node
        {...mockProps}
        orientation="vertical"
        depthFactor={depthFactor}
      />
    );

    expect(renderedComponent.prop('transform')).toBe(`translate(${nodeData.x},${expectedY})`);
  });
});
