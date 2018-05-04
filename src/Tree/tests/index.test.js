import React from 'react';
import { shallow, mount } from 'enzyme';
import { render } from 'react-dom';

import NodeWrapper from '../NodeWrapper';
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

  it('passes individual `shapeProps` to the specified <Node /> only', () => {
    const svgShapeMock = {
      shape: 'rect',
      shapeProps: {
        r: 3,
        fill: 'red',
      },
    };
    const mockTree = [
      {
        name: 'Top Level',
        parent: 'null',
        nodeSvgShape: svgShapeMock,
        children: [
          {
            name: 'Inner',
            parent: 'Top Level',
          },
        ],
      },
    ];

    const renderedComponent = mount(<Tree data={mockTree} />);
    const parentNode = renderedComponent.find(Node).first();
    expect(parentNode).not.toBeUndefined();
    expect(parentNode.props().nodeSvgShape).toEqual(svgShapeMock);

    const childNode = renderedComponent.find(Node).last();
    expect(childNode).not.toBeUndefined();
    expect(childNode.props().nodeSvgShape).not.toEqual(svgShapeMock);
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

  it("reassigns internal props if `props.data`'s array reference changes", () => {
    // `assignInternalProperties` recurses by depth: 1 level -> 1 call
    const mockDataDepth = 2;
    const nextDataDepth = 2;
    const nextData = [...mockData];
    nextData[0].children.push({ name: `${nextData[0].children.length}` });
    const renderedComponent = mount(<Tree data={mockData} />);
    expect(renderedComponent.instance().assignInternalProperties).toHaveBeenCalledTimes(
      mockDataDepth,
    );
    renderedComponent.setProps({ data: nextData });
    expect(renderedComponent.instance().assignInternalProperties).toHaveBeenCalledTimes(
      mockDataDepth + nextDataDepth,
    );
  });

  describe('translate', () => {
    it('applies the `translate` prop when specified', () => {
      const fixture = { x: 123, y: 321 };
      const expected = `translate(${fixture.x},${fixture.y})`;
      const renderedComponent = shallow(<Tree data={mockData} translate={fixture} />);
      expect(renderedComponent.find(NodeWrapper).prop('transform')).toContain(expected);
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
      jest.useFakeTimers();
      const renderedComponent = mount(<Tree data={mockData} />);
      renderedComponent
        .find(Node)
        .first()
        .simulate('click'); // collapse

      jest.runAllTimers();

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

    it('does not toggle any nodes again until `transitionDuration` has completed', () => {
      const renderedComponent = mount(<Tree data={mockData} />);
      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(2);
      expect(Tree.prototype.collapseNode).toHaveBeenCalled();
      expect(Tree.prototype.expandNode).not.toHaveBeenCalled();
    });

    it('allows toggling nodes again after `transitionDuration` + 10ms has expired', () => {
      jest.useFakeTimers();
      const renderedComponent = mount(<Tree data={mockData} />);
      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      jest.runAllTimers();

      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      expect(Tree.prototype.handleNodeToggle).toHaveBeenCalledTimes(2);
      expect(Tree.prototype.collapseNode).toHaveBeenCalled();
      expect(Tree.prototype.expandNode).toHaveBeenCalledTimes(1);
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
      expect(renderedComponent.find(NodeWrapper).prop('transform')).toContain(expected);
    });

    it('applies default zoom level when `zoom` is not specified', () => {
      const renderedComponent = shallow(<Tree data={mockData} />);
      expect(renderedComponent.find(NodeWrapper).prop('transform')).toContain(`scale(1)`);
    });

    it('respects `scaleExtent` constraints on initial display', () => {
      const scaleExtent = { min: 0.2, max: 0.8 };

      let renderedComponent = shallow(
        <Tree data={mockData} scaleExtent={scaleExtent} zoom={0.9} />,
      );
      expect(renderedComponent.find(NodeWrapper).prop('transform')).toContain(
        `scale(${scaleExtent.max})`,
      );

      renderedComponent = shallow(<Tree data={mockData} scaleExtent={scaleExtent} zoom={0.1} />);
      expect(renderedComponent.find(NodeWrapper).prop('transform')).toContain(
        `scale(${scaleExtent.min})`,
      );
    });

    it('rebinds zoom handler on zoom-related props update', () => {
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

    it('rebinds on `props.transitionDuration` change to handle switched DOM nodes from NodeWrapper', () => {
      const renderedComponent = mount(<Tree data={mockData} />);
      expect(renderedComponent.instance().bindZoomListener).toHaveBeenCalledTimes(1);
      renderedComponent.setProps({ transitionDuration: 0 });
      expect(renderedComponent.instance().bindZoomListener).toHaveBeenCalledTimes(2);
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
      const mockEvt = { mock: 'event' };
      const renderedComponent = mount(<Tree data={mockData} onClick={onClickSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('click', mockEvt);

      expect(onClickSpy).toHaveBeenCalledWith(
        renderedComponent
          .find(Node)
          .first()
          .prop('nodeData'),
        expect.objectContaining(mockEvt),
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
      const mockEvt = { mock: 'event' };
      const renderedComponent = mount(<Tree data={mockData} onMouseOver={onMouseOverSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('mouseover', mockEvt);

      expect(onMouseOverSpy).toHaveBeenCalledWith(
        renderedComponent
          .find(Node)
          .first()
          .prop('nodeData'),
        expect.objectContaining(mockEvt),
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
      const mockEvt = { mock: 'event' };
      const renderedComponent = mount(<Tree data={mockData} onMouseOut={onMouseOutSpy} />);

      renderedComponent
        .find(Node)
        .first()
        .simulate('mouseout', mockEvt);

      expect(onMouseOutSpy).toHaveBeenCalledWith(
        renderedComponent
          .find(Node)
          .first()
          .prop('nodeData'),
        expect.objectContaining(mockEvt),
      );
    });
  });

  describe('onUpdate', () => {
    it('calls `onUpdate` on node toggle', () => {
      const onUpdateSpy = jest.fn();

      const renderedComponent = mount(<Tree data={mockData} onUpdate={onUpdateSpy} />);
      renderedComponent
        .find(Node)
        .first()
        .simulate('click'); // collapse

      expect(onUpdateSpy).toHaveBeenCalledTimes(1);
      expect(onUpdateSpy).toHaveBeenCalledWith({
        node: expect.any(Object),
        zoom: 1,
        translate: { x: 0, y: 0 },
      });
    });

    it('calls `onUpdate` on zoom', () => {
      const onUpdateSpy = jest.fn();

      document.body.innerHTML += '<div id="reactContainer"></div>';
      render(
        <Tree data={mockData} onUpdate={onUpdateSpy} scaleExtent={{ min: 0.1, max: 10 }} />,
        document.querySelector('#reactContainer'),
      );

      const scrollableComponent = document.querySelector('.rd3t-tree-container > svg');
      scrollableComponent.dispatchEvent(new Event('wheel'));

      expect(onUpdateSpy).toHaveBeenCalledTimes(1);
      expect(onUpdateSpy).toHaveBeenCalledWith({
        node: null,
        translate: { x: expect.any(Number), y: expect.any(Number) },
        zoom: expect.any(Number),
      });
    });

    it('passes the specified (not default) `zoom` and `translate` when a node is clicked for the 1st time', () => {
      const onUpdateSpy = jest.fn();
      const zoom = 0.7;
      const translate = { x: 10, y: 5 };

      const renderedComponent = mount(
        <Tree data={mockData} zoom={zoom} translate={translate} onUpdate={onUpdateSpy} />,
      );
      renderedComponent
        .find(Node)
        .first()
        .simulate('click');

      expect(onUpdateSpy).toHaveBeenCalledTimes(1);
      expect(onUpdateSpy).toHaveBeenCalledWith({
        node: expect.any(Object),
        translate,
        zoom,
      });
    });
  });
});
