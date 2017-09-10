import React from 'react';
import { shallow, mount } from 'enzyme';

import Node from '../index';

describe('<Node />', () => {
  const nodeData = {
    id: 'abc123',
    name: 'mockNode',
    depth: 3,
    x: 111,
    y: 222,
    parent: {
      x: 999,
      y: 888,
    },
  };

  const mockProps = {
    nodeData,
    name: nodeData.name,
    orientation: 'horizontal',
    transitionDuration: 500,
    onClick: () => {},
    circleRadius: 10,
    styles: {},
  };

  jest.spyOn(Node.prototype, 'applyTransform');

  // Clear method spies on prototype after each test
  afterEach(() => jest.clearAllMocks());

  it('has the correct `id` attribute value', () => {
    const renderedComponent = shallow(<Node {...mockProps} />);

    expect(renderedComponent.find('g').prop('id')).toBe(nodeData.id);
  });

  it('applies correct base className if `nodeData._children` is defined', () => {
    const leafNodeComponent = shallow(<Node {...mockProps} />);
    const nodeComponent = shallow(
      <Node {...mockProps} nodeData={{ ...nodeData, _children: [] }} />,
    );

    expect(leafNodeComponent.prop('className')).toBe('leafNodeBase');
    expect(nodeComponent.prop('className')).toBe('nodeBase');
  });

  it('applies correct <circle> styles depending on `nodeData._children`', () => {
    const fixture = {
      leafNode: {
        circle: { fill: 'blue' },
      },
      node: {
        circle: { fill: 'green' },
      },
    };
    const leafNodeComponent = shallow(<Node {...mockProps} styles={fixture} />);
    const nodeComponent = shallow(
      <Node
        {...mockProps}
        nodeData={{ ...nodeData, _children: [] }}
        styles={fixture}
      />,
    );

    expect(leafNodeComponent.find('circle').prop('style')).toBe(
      fixture.leafNode.circle,
    );
    expect(nodeComponent.find('circle').prop('style')).toBe(
      fixture.node.circle,
    );
  });

  it('applies correct node name styles depending on `nodeData._children`', () => {
    const fixture = {
      node: {
        name: { stroke: '#000' },
      },
      leafNode: {
        name: { stroke: '#fff' },
      },
    };
    const leafNodeComponent = shallow(<Node {...mockProps} styles={fixture} />);
    const nodeComponent = shallow(
      <Node
        {...mockProps}
        nodeData={{ ...nodeData, _children: [] }}
        styles={fixture}
      />,
    );

    expect(leafNodeComponent.find('.nodeNameBase').prop('style')).toBe(
      fixture.leafNode.name,
    );
    expect(nodeComponent.find('.nodeNameBase').prop('style')).toBe(
      fixture.node.name,
    );
  });

  it('applies correct node attributes styles depending on `nodeData._children`', () => {
    const fixture = {
      node: {
        attributes: { stroke: '#000' },
      },
      leafNode: {
        attributes: { stroke: '#fff' },
      },
    };
    const leafNodeComponent = shallow(<Node {...mockProps} styles={fixture} />);
    const nodeComponent = shallow(
      <Node
        {...mockProps}
        nodeData={{ ...nodeData, _children: [] }}
        styles={fixture}
      />,
    );

    expect(leafNodeComponent.find('.nodeAttributesBase').prop('style')).toBe(
      fixture.leafNode.attributes,
    );
    expect(nodeComponent.find('.nodeAttributesBase').prop('style')).toBe(
      fixture.node.attributes,
    );
  });

  it('applies correct `transform` prop based on its `orientation`', () => {
    const horizontalTransform = `translate(${nodeData.parent.y},${nodeData
      .parent.x})`;
    const verticalTransform = `translate(${nodeData.parent.x},${nodeData.parent
      .y})`;
    const horizontalComponent = shallow(<Node {...mockProps} />);
    const verticalComponent = shallow(
      <Node {...mockProps} orientation="vertical" />,
    );
    expect(horizontalComponent.find('g').prop('transform')).toBe(
      horizontalTransform,
    );
    expect(verticalComponent.find('g').prop('transform')).toBe(
      verticalTransform,
    );
  });

  it('should take an `onClick` prop', () => {
    const renderedComponent = shallow(
      <Node {...mockProps} onClick={() => {}} />,
    );

    expect(renderedComponent.prop('onClick')).toBeDefined();
  });

  it('handles click events and passes its nodeId to onClick handler', () => {
    const onClickSpy = jest.fn();
    const renderedComponent = shallow(
      <Node {...mockProps} onClick={onClickSpy} />,
    );

    renderedComponent.simulate('click');
    expect(onClickSpy).toHaveBeenCalledWith(nodeData.id);
  });

  it('maps each `props.attributes` to a <tspan> element', () => {
    const fixture = { keyA: 'valA', keyB: 'valB' };
    const renderedComponent = shallow(
      <Node {...mockProps} attributes={fixture} />,
    );
    const textNode = renderedComponent
      .find('text')
      .findWhere(n => n.prop('className') === 'nodeAttributesBase');

    expect(
      textNode.findWhere(n => n.text() === `keyA: ${fixture.keyA}`).length,
    ).toBe(1);
    expect(
      textNode.findWhere(n => n.text() === `keyB: ${fixture.keyB}`).length,
    ).toBe(1);
  });

  it('applies its own x/y coords on `transform` once mounted', () => {
    const fixture = `translate(${nodeData.y},${nodeData.x})`;
    const renderedComponent = mount(<Node {...mockProps} />);

    expect(renderedComponent.instance().applyTransform).toHaveBeenCalledWith(
      fixture,
    );
  });

  it('applies updated transform if either the `x` or `y` prop changes', () => {
    // jest.spyOn(Node.prototype, 'applyTransform');
    const updatedProps = {
      ...mockProps,
      nodeData: {
        ...mockProps.nodeData,
        x: 1,
        y: 2,
      },
    };
    const initialTransform = `translate(${mockProps.nodeData.y},${mockProps
      .nodeData.x})`;
    const updatedTransform = `translate(${updatedProps.nodeData
      .y},${updatedProps.nodeData.x})`;
    const renderedComponent = mount(<Node {...mockProps} />);

    expect(renderedComponent.instance().applyTransform).toHaveBeenCalledWith(
      initialTransform,
    );

    renderedComponent.setProps(updatedProps);

    expect(renderedComponent.instance().applyTransform).toHaveBeenCalledWith(
      updatedTransform,
    );
  });

  // TODO Find a way to meaningfully test `componentWillLeave`

  // it('regresses to its parent coords when unmounting/leaving', () => {
  //   jest.spyOn(Node.prototype, 'applyTransform');
  //   const fixture = `translate(${nodeData.parent.y},${nodeData.parent.x})`;
  //   const renderedComponent = mount(
  //     <Node
  //       {...mockProps}
  //     />
  //   );
  //
  //   renderedComponent.unmount();
  //   expect(Node.prototype.applyTransform).toHaveBeenCalledWith(fixture);
  //   expect(Node.prototype.applyTransform).toHaveBeenCalledTimes(1);
  // });
});
