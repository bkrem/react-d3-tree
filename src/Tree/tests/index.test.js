import React from 'react';
import { TransitionGroup } from 'react-transition-group';
import { shallow, mount } from 'enzyme';

import Node from '../../Node';
import Link from '../../Link';
import Tree from '../index';
import { mockData, mockData2 } from './mockData';

describe('<Tree />', () => {
  jest.spyOn(Tree.prototype, 'generateTree');
  jest.spyOn(Tree.prototype, 'assignInternalProperties');
  jest.spyOn(Tree.prototype, 'handleNodeToggle');
  jest.spyOn(Tree.prototype, 'collapseNode');
  jest.spyOn(Tree.prototype, 'expandNode');
  jest.spyOn(Tree.prototype, 'setInitialTreeDepth');
  jest.spyOn(Tree.prototype, 'bindZoomListener');

  // Clear method spies on prototype after each test
  afterEach(() => jest.clearAllMocks());

  it('builds a tree on each render', () => {
    const renderedComponent = shallow(<Tree data={mockData} />);
    expect(renderedComponent.instance().generateTree).toHaveBeenCalled();
  });

  it('maps every node onto a <Node />', () => {
    const nodeCount = 3; // 1 top level node + 2 child nodes in mockData
    const renderedComponent = shallow(<Tree data={mockData} />);

    expect(renderedComponent.find(Node).length).toBe(nodeCount);
  });

  it('maps every parent-child relation onto a <Link />', () => {
    const linkCount = 2;
    const renderedComponent = shallow(<Tree data={mockData} />);

    expect(renderedComponent.find(Link).length).toBe(linkCount);
  });

  it('reassigns internal props if `props.data` changes', () => {
    // `assignInternalProperties` recurses by depth: 1 level -> 1 call
    const mockDataDepth = 2;
    const mockData2Depth = 2;
    const nextProps = {
      data: mockData2,
    };
    const renderedComponent = mount(<Tree data={mockData} />);

    expect(renderedComponent.instance().assignInternalProperties).toHaveBeenCalledTimes(
      mockDataDepth,
    );

    renderedComponent.setProps(nextProps);

    expect(renderedComponent.instance().assignInternalProperties).toHaveBeenCalledTimes(
      mockDataDepth + mockData2Depth,
    );
  });

  describe('translate', () => {
    it('applies the `translate` prop when specified', () => {
      const fixture = { x: 123, y: 321 };
      const expected = `translate(${fixture.x},${fixture.y})`;
      const renderedComponent = shallow(<Tree data={mockData} translate={fixture} />);
      expect(renderedComponent.find(TransitionGroup).prop('transform')).toContain(expected);
    });
  });

  describe('depthFactor', () => {
    it("mutates each node's `y` prop according to `depthFactor` when specified", () => {
      const depthFactor = 100;
      // const expectedY = nodeData.depth * depthFactor;
      const renderedComponent = shallow(
        <Tree data={mockData} orientation="vertical" depthFactor={depthFactor} />,
      );

      const { nodes } = renderedComponent.instance().generateTree(mockData);
      nodes.forEach(node => {
        expect(node.y).toBe(node.depth * depthFactor);
      });
    });
  });

  describe('orientation', () => {
    it('passes `props.orientation` to its <Node /> and <Link /> children', () => {
      const fixture = 'vertical';
      const renderedComponent = shallow(<Tree data={mockData} orientation={fixture} />);

      expect(renderedComponent.find(Node).everyWhere(n => n.prop('orientation') === fixture)).toBe(
        true,
      );
      expect(renderedComponent.find(Link).everyWhere(n => n.prop('orientation') === fixture)).toBe(
        true,
      );
    });
  });

  describe('collapsible', () => {
    it('passes `handleNodeToggle()` to its <Node /> children as onClick prop', () => {
      const renderedComponent = shallow(<Tree data={mockData} />);

      expect(
        renderedComponent
          .find(Node)
          .everyWhere(n => n.prop('onClick') === renderedComponent.instance().handleNodeToggle),
      ).toBe(true);
    });

    it("collapses a node's children when it is clicked in an expanded state", () => {
      const renderedComponent = mount(<Tree data={mockData} />);
      renderedComponent
        .find(Node)
        .first()
        .simulate('click'); // collapse

      expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(1);
      expect(Tree.prototype.collapseNode).toHaveBeenCalled();
    });

    it("expands a node's children when it is clicked in a collapsed state", () => {
      const renderedComponent = mount(<Tree data={mockData} />);
      renderedComponent
        .find(Node)
        .first()
        .simulate('click'); // collapse
      renderedComponent
        .find(Node)
        .first()
        .simulate('click'); // re-expand

      expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(2);
      expect(Tree.prototype.collapseNode).toHaveBeenCalled();
      expect(Tree.prototype.expandNode).toHaveBeenCalled();
    });

    it('does not collapse a node if `props.collapsible` is false', () => {
      const renderedComponent = mount(<Tree data={mockData} collapsible={false} />);
      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(1);
      expect(Tree.prototype.collapseNode).toHaveBeenCalledTimes(0);
    });
  });

  describe('initialDepth', () => {
    it('sets tree depth to `props.initialDepth` if specified', () => {
      mount(<Tree data={mockData} initialDepth={1} />);
      expect(Tree.prototype.setInitialTreeDepth).toHaveBeenCalled();
    });
  });

  describe('zoomable', () => {
    it('adds the `.rd3t-grabbable` class if `props.zoomable`', () => {
      const zoomableComponent = shallow(<Tree data={mockData} />);
      const nonZoomableComponent = shallow(<Tree data={mockData} zoomable={false} />);

      expect(zoomableComponent.find('.rd3t-tree-container').hasClass('rd3t-grabbable')).toBe(true);
      expect(nonZoomableComponent.find('.rd3t-tree-container').hasClass('rd3t-grabbable')).toBe(
        false,
      );
    });
  });

  describe('zoom', () => {
    it('applies the `zoom` prop when specified', () => {
      const zoomLevel = 0.3;
      const expected = `scale(${zoomLevel})`;
      const renderedComponent = shallow(<Tree data={mockData} zoom={zoomLevel} />);
      expect(renderedComponent.find(TransitionGroup).prop('transform')).toContain(expected);
    });

    it('rebind zoom handler on zoom-related props update', () => {
      const zoomProps = [
        { translate: { x: 1, y: 1 } },
        { scaleExtent: { min: 0.3, max: 0.4 } },
        { zoom: 3.1415 },
      ];
      const renderedComponent = mount(<Tree data={mockData} />);

      expect(renderedComponent.instance().bindZoomListener).toHaveBeenCalledTimes(1);

      zoomProps.forEach(nextProps => renderedComponent.setProps(nextProps));
      expect(renderedComponent.instance().bindZoomListener).toHaveBeenCalledTimes(4);
    });
  });

  describe('onClick', () => {
    it('calls the onClick callback when a node is toggled', () => {
      const onClickSpy = jest.fn();
      const renderedComponent = mount(<Tree data={mockData} onClick={onClickSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });

    it('calls the onClick callback even when `props.collapsible` is false', () => {
      const onClickSpy = jest.fn();
      const renderedComponent = mount(
        <Tree data={mockData} collapsible={false} onClick={onClickSpy} />,
      );

      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      expect(onClickSpy).toHaveBeenCalledTimes(1);
    });

    it("clones the clicked node's data & passes it to the onClick callback if defined", () => {
      const onClickSpy = jest.fn();
      const renderedComponent = mount(<Tree data={mockData} onClick={onClickSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      expect(onClickSpy).toHaveBeenCalledWith(
        renderedComponent
          .find(Node)
          .first()
          .prop('nodeData'),
      );
    });
  });

  describe('onMouseOver', () => {
    it('calls the onMouseOver callback when a node is hovered over', () => {
      const onMouseOverSpy = jest.fn();
      const renderedComponent = mount(<Tree data={mockData} onMouseOver={onMouseOverSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('mouseover');

      expect(onMouseOverSpy).toHaveBeenCalledTimes(1);
    });

    it("clones the hovered node's data & passes it to the onMouseOver callback if defined", () => {
      const onMouseOverSpy = jest.fn();
      const renderedComponent = mount(<Tree data={mockData} onMouseOver={onMouseOverSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('mouseover');

      expect(onMouseOverSpy).toHaveBeenCalledWith(
        renderedComponent
          .find(Node)
          .first()
          .prop('nodeData'),
      );
    });
  });

  describe('onMouseOut', () => {
    it('calls the onMouseOut callback when a node is hovered over', () => {
      const onMouseOutSpy = jest.fn();
      const renderedComponent = mount(<Tree data={mockData} onMouseOut={onMouseOutSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('mouseout');

      expect(onMouseOutSpy).toHaveBeenCalledTimes(1);
    });

    it("clones the hovered node's data & passes it to the onMouseOut callback if defined", () => {
      const onMouseOutSpy = jest.fn();
      const renderedComponent = mount(<Tree data={mockData} onMouseOut={onMouseOutSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('mouseout');

      expect(onMouseOutSpy).toHaveBeenCalledWith(
        renderedComponent
          .find(Node)
          .first()
          .prop('nodeData'),
      );
    });
  });
});
