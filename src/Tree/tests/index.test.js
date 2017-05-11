import React from 'react';
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

  // Clear method spies on prototype before next test
  afterEach(() => jest.clearAllMocks());

  it('builds a tree on each render', () => {
    jest.spyOn(Tree.prototype, 'generateTree');
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

  it('applies the `translate` prop when specified', () => {
    const fixture = { x: 123, y: 321 };
    const expected = `translate(${fixture.x},${fixture.y})`;
    const renderedComponent = shallow(
      <Tree
        data={mockData}
        translate={fixture}
      />
    );

    expect(renderedComponent.find('g').prop('transform')).toBe(expected);
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

  it('collapses a node when it is clicked', () => {
    jest.spyOn(Tree.prototype, 'handleNodeToggle');
    jest.spyOn(Tree.prototype, 'collapseNode');
    const renderedComponent = mount(
      <Tree data={mockData} />
    );
    renderedComponent.find(Node).first().simulate('click');

    expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(1);
    expect(Tree.prototype.collapseNode).toHaveBeenCalled();
  });

  it('does not collapse a node if `props.collapsible` is false', () => {
    jest.spyOn(Tree.prototype, 'handleNodeToggle');
    jest.spyOn(Tree.prototype, 'collapseNode');
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
});
