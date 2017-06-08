import React from 'react';
import { TransitionGroup } from 'react-transition-group';
import { shallow, mount } from 'enzyme';

import Node from '../../Node';
import Link from '../../Link';
import Tree from '../index';

describe('<Tree />', () => {
  const mockData = [
    {
      name: 'Top Level',
      parent: 'null',
      attributes: {
        keyA: 'val A',
        keyB: 'val B',
        keyC: 'val C',
      },
      children: [
        {
          name: 'Level 2: A',
          parent: 'Top Level',
          attributes: {
            keyA: 'val A',
            keyB: 'val B',
            keyC: 'val C',
          },
        },
        {
          name: 'Level 2: B',
          parent: 'Top Level',
        },
      ],
    },
  ];

  const mockData2 = [
    {
      name: 'Top Level',
      parent: 'null',
      attributes: {
        keyA: 'val A',
        keyB: 'val B',
        keyC: 'val C',
      },
      children: [
        {
          name: 'Level 2: A',
          parent: 'Top Level',
          attributes: {
            keyA: 'val A',
            keyB: 'val B',
            keyC: 'val C',
          },
        },
      ],
    },
  ];

  jest.spyOn(Tree.prototype, 'generateTree');
  jest.spyOn(Tree.prototype, 'assignInternalProperties');
  jest.spyOn(Tree.prototype, 'handleNodeToggle');
  jest.spyOn(Tree.prototype, 'collapseNode');
  jest.spyOn(Tree.prototype, 'expandNode');
  jest.spyOn(Tree.prototype, 'setInitialTreeDepth');

  // Clear method spies on prototype after each test
  afterEach(() => jest.clearAllMocks());


  it('builds a tree on each render', () => {
    const renderedComponent = shallow(
      <Tree data={mockData} />
    );
    expect(renderedComponent.instance().generateTree).toHaveBeenCalled();
  });


  it('maps every node onto a <Node />', () => {
    const nodeCount = 3; // 1 top level node + 2 child nodes in mockData
    const renderedComponent = shallow(
      <Tree data={mockData} />
    );

    expect(renderedComponent.find(Node).length).toBe(nodeCount);
  });


  it('maps every parent-child relation onto a <Link />', () => {
    const linkCount = 2;
    const renderedComponent = shallow(
      <Tree data={mockData} />
    );

    expect(renderedComponent.find(Link).length).toBe(linkCount);
  });


  it('reassigns internal props if `props.data` changes', () => {
    // `assignInternalProperties` recurses by depth: 1 level -> 1 call
    const mockDataDepth = 2;
    const mockData2Depth = 2;
    const nextProps = {
      data: mockData2,
    };
    const renderedComponent = mount(
      <Tree data={mockData} />
    );

    expect(renderedComponent.instance().assignInternalProperties)
    .toHaveBeenCalledTimes(mockDataDepth);

    renderedComponent.setProps(nextProps);

    expect(renderedComponent.instance().assignInternalProperties)
    .toHaveBeenCalledTimes(mockDataDepth + mockData2Depth);
  });


  it('applies the `translate` prop when specified', () => {
    const fixture = { x: 123, y: 321 };
    const expected = `translate(${fixture.x},${fixture.y})`;
    const renderedComponent = shallow(
      <Tree
        data={mockData}
        translate={fixture}
      />
    );
    expect(renderedComponent.find(TransitionGroup).prop('transform')).toBe(expected);
  });


  it('passes `props.orientation` to its <Node /> and <Link /> children', () => {
    const fixture = 'vertical';
    const renderedComponent = shallow(
      <Tree
        data={mockData}
        orientation={fixture}
      />
    );

    expect(renderedComponent.find(Node).everyWhere((n) =>
      n.prop('orientation') === fixture)
    ).toBe(true);
    expect(renderedComponent.find(Link).everyWhere((n) =>
      n.prop('orientation') === fixture)
    ).toBe(true);
  });


  it('passes `handleNodeToggle()` to its <Node /> children as onClick prop', () => {
    const renderedComponent = shallow(
      <Tree data={mockData} />
    );

    expect(renderedComponent.find(Node).everyWhere((n) =>
      n.prop('onClick') === renderedComponent.instance().handleNodeToggle)
    ).toBe(true);
  });


  it('collapses a node\'s children when it is clicked in an expanded state', () => {
    const renderedComponent = mount(
      <Tree data={mockData} />
    );
    renderedComponent.find(Node).first().simulate('click'); // collapse

    expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(1);
    expect(Tree.prototype.collapseNode).toHaveBeenCalled();
  });


  it('expands a node\'s children when it is clicked in a collapsed state', () => {
    const renderedComponent = mount(
      <Tree data={mockData} />
    );
    renderedComponent.find(Node).first().simulate('click'); // collapse
    renderedComponent.find(Node).first().simulate('click'); // re-expand

    expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(2);
    expect(Tree.prototype.collapseNode).toHaveBeenCalled();
    expect(Tree.prototype.expandNode).toHaveBeenCalled();
  });


  it('does not collapse a node if `props.collapsible` is false', () => {
    const renderedComponent = mount(
      <Tree
        data={mockData}
        collapsible={false}
      />
    );
    renderedComponent.find(Node).first().simulate('click');

    expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(1);
    expect(Tree.prototype.collapseNode).toHaveBeenCalledTimes(0);
  });


  it('sets tree depth to `props.initialDepth` if specified', () => {
    mount(
      <Tree
        data={mockData}
        initialDepth={1}
      />
    );

    expect(Tree.prototype.setInitialTreeDepth).toHaveBeenCalled();
  });


  // it('allows zooming in/out according to `props.scaleExtent` if `props.zoomable`', () => {
  //   const zoomableComponent = mount(
  //     <Tree
  //       data={mockData}
  //     />
  //   );
  //   const nonZoomableComponent = mount(
  //     <Tree
  //       data={mockData}
  //       zoomable={false}
  //     />
  //   );
  //
  //   zoomableComponent.find('svg').simulate('touchmove');
  //
  //   expect(zoomableComponent.find('svg').prop('transform')).toBeDefined();
  //   expect(nonZoomableComponent.find('svg').prop('transform')).toBeUndefined();
  // });
});
