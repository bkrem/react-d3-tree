import React from 'react';
import { shallow, mount } from 'enzyme';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import TransitionGroupWrapper from '../TransitionGroupWrapper.tsx';
import Node from '../../Node/index.tsx';
import Link from '../../Link/index.tsx';
import Tree from '../index.tsx';
import { mockData, mockData2, mockData4, mockTree_D1N2_D2N2 } from './mockData';

describe('<Tree />', () => {
  vi.spyOn(Tree.prototype, 'generateTree');
  vi.spyOn(Tree, 'assignInternalProperties');
  vi.spyOn(Tree, 'collapseNode');
  vi.spyOn(Tree, 'expandNode');
  vi.spyOn(Tree.prototype, 'setInitialTreeDepth');
  vi.spyOn(Tree.prototype, 'bindZoomListener');
  vi.spyOn(Tree.prototype, 'collapseNeighborNodes');

  // Clear method spies on prototype after each test
  afterEach(() => vi.clearAllMocks());

  it('builds a tree on each render', () => {
    const renderedComponent = shallow(<Tree data={mockData} />);
    expect(renderedComponent.instance().generateTree).toHaveBeenCalled();
  });

  it('maps every node onto a <Node />', () => {
    const nodeCount = 5; // root + 2 nodes + 2 child nodes
    const renderedComponent = shallow(<Tree data={mockData} />);

    expect(renderedComponent.find(Node).length).toBe(nodeCount);
  });

  it('maps every parent-child relation onto a <Link />', () => {
    const linkCount = 4;
    const renderedComponent = shallow(<Tree data={mockData} />);

    expect(renderedComponent.find(Link).length).toBe(linkCount);
  });

  it('maps every parent-child relation onto a <Link /> with expected siblings', () => {
    const linkCount = 5; // 1 top level node + 2 child nodes (1 child, 2 children) in mockData
    const renderedComponent = shallow(<Tree data={mockData4} />);

    expect(renderedComponent.find(Link).length).toBe(linkCount);
  });

  // Ensures D3's pan & zoom listeners can bind to multiple trees in a single view (https://github.com/bkrem/react-d3-tree/issues/100).
  it("assigns unique ref classNames to each Tree instance's `svg` and primary `g` tag", () => {
    const tree1 = shallow(<Tree data={mockData} />);
    const tree2 = shallow(<Tree data={mockData} />);
    expect(tree1.find('.rd3t-svg').prop('className')).not.toBe(
      tree2.find('.rd3t-svg').prop('className')
    );
    expect(tree1.find('.rd3t-g').prop('className')).not.toBe(
      tree2.find('.rd3t-g').prop('className')
    );
  });

  it('reassigns internal props if `props.data` changes', () => {
    // `assignInternalProperties` recurses by depth: 1 level -> 1 call
    const mockDataDepth = 3;
    const mockData2Depth = 2;
    const nextProps = {
      data: mockData2,
    };
    const renderedComponent = mount(<Tree data={mockData} />);
    expect(Tree.assignInternalProperties).toHaveBeenCalledTimes(mockDataDepth);
    renderedComponent.setProps(nextProps);
    expect(Tree.assignInternalProperties).toHaveBeenCalledTimes(mockDataDepth + mockData2Depth);
  });

  it("reassigns internal props if `props.data`'s array reference changes", () => {
    // `assignInternalProperties` recurses by depth: 1 level -> 1 call
    const mockDataDepth = 3;
    const nextDataDepth = 3;
    const nextData = [...mockData];
    nextData[0].children.push({ name: `${nextData[0].children.length}` });
    const renderedComponent = mount(<Tree data={mockData} />);
    expect(Tree.assignInternalProperties).toHaveBeenCalledTimes(mockDataDepth);
    renderedComponent.setProps({ data: nextData });
    expect(Tree.assignInternalProperties).toHaveBeenCalledTimes(mockDataDepth + nextDataDepth);
  });

  describe('translate', () => {
    it('applies the `translate` prop when specified', () => {
      const fixture = { x: 123, y: 321 };
      const expected = `translate(${fixture.x},${fixture.y})`;
      const renderedComponent = shallow(<Tree data={mockData} translate={fixture} />);
      expect(renderedComponent.find(TransitionGroupWrapper).prop('transform')).toContain(expected);
    });
  });

  describe('depthFactor', () => {
    it("mutates each node's `y` prop according to `depthFactor` when specified", () => {
      const depthFactor = 100;
      const renderedComponent = shallow(
        <Tree data={mockData} orientation="vertical" depthFactor={depthFactor} />
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
        true
      );
      expect(renderedComponent.find(Link).everyWhere(n => n.prop('orientation') === fixture)).toBe(
        true
      );
    });
  });

  describe('collapsible', () => {
    it("collapses a node's children when it is clicked in an expanded state", () => {
      const renderedComponent = mount(<Tree data={mockData4} />);
      const nodeCount = renderedComponent.find(Node).length;
      renderedComponent.find(Node).first().find('circle').simulate('click'); // collapse

      expect(Tree.collapseNode).toHaveBeenCalledTimes(nodeCount);
    });

    it("expands a node's children when it is clicked in a collapsed state", () => {
      const renderedComponent = mount(<Tree data={mockData} />);
      const nodeCount = renderedComponent.find(Node).length;
      renderedComponent.find(Node).first().find('circle').simulate('click'); // collapse

      renderedComponent.find(Node).first().find('circle').simulate('click'); // re-expand

      expect(Tree.collapseNode).toHaveBeenCalledTimes(nodeCount);
      expect(Tree.expandNode).toHaveBeenCalledTimes(1);
    });

    it('does not collapse a node if `props.collapsible` is false', () => {
      const renderedComponent = mount(<Tree data={mockData} collapsible={false} />);
      renderedComponent.find(Node).first().find('circle').simulate('click');

      expect(Tree.collapseNode).toHaveBeenCalledTimes(0);
    });

    describe('with `props.enableLegacyTransitions`', () => {
      it('does not toggle any nodes again until `transitionDuration` has completed', () => {
        const renderedComponent = mount(<Tree data={mockData} enableLegacyTransitions />);
        const nodeCount = renderedComponent.find(Node).length;
        renderedComponent.find(Node).first().find('circle').simulate('click');

        renderedComponent.find(Node).first().find('circle').simulate('click');

        expect(Tree.collapseNode).toHaveBeenCalledTimes(nodeCount);
        expect(Tree.expandNode).not.toHaveBeenCalled();
      });

      it('allows toggling nodes again after `transitionDuration` + 10ms has expired', () => {
        vi.useFakeTimers();
        const renderedComponent = mount(<Tree data={mockData} enableLegacyTransitions />);
        const nodeCount = renderedComponent.find(Node).length;
        renderedComponent.find(Node).first().find('circle').simulate('click');

        vi.runAllTimers();

        renderedComponent.find(Node).first().find('circle').simulate('click');

        expect(Tree.collapseNode).toHaveBeenCalledTimes(nodeCount);
        expect(Tree.expandNode).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('shouldCollapseNeighborNodes', () => {
    it('is inactive by default', () => {
      const renderedComponent = mount(<Tree data={mockData} />);
      renderedComponent.find(Node).first().simulate('click'); // collapse

      renderedComponent.find(Node).first().simulate('click'); // re-expand

      expect(Tree.prototype.collapseNeighborNodes).toHaveBeenCalledTimes(0);
    });

    it('collapses all neighbor nodes of the targetNode if it is about to be expanded', () => {
      const renderedComponent = mount(<Tree data={mockData} shouldCollapseNeighborNodes />);
      renderedComponent.find(Node).first().find('circle').simulate('click'); // collapse

      renderedComponent.find(Node).first().find('circle').simulate('click'); // re-expand

      expect(Tree.prototype.collapseNeighborNodes).toHaveBeenCalledTimes(1);
    });
  });

  describe('initialDepth', () => {
    it('expands tree to full depth by default', () => {
      const renderedComponent = shallow(<Tree data={mockTree_D1N2_D2N2} />);
      expect(renderedComponent.find(Node).length).toBe(5);
    });

    it('expands tree to `props.initialDepth` if specified', () => {
      const renderedComponent = shallow(<Tree data={mockTree_D1N2_D2N2} initialDepth={1} />);
      expect(renderedComponent.find(Node).length).toBe(3);
    });

    it('renders only the root node if `initialDepth === 0`', () => {
      const renderedComponent = shallow(<Tree data={mockTree_D1N2_D2N2} initialDepth={0} />);
      expect(renderedComponent.find(Node).length).toBe(1);
    });

    it('increases tree depth by no more than 1 level when a node is expanded after initialising to `initialDepth`', () => {
      const renderedComponent = mount(<Tree data={mockTree_D1N2_D2N2} initialDepth={0} />);
      expect(renderedComponent.find(Node).length).toBe(1);
      renderedComponent.find(Node).first().find('circle').simulate('click');
      expect(renderedComponent.find(Node).length).toBe(3);
    });
  });

  describe('zoom', () => {
    it('applies the `zoom` prop when specified', () => {
      const zoomLevel = 0.3;
      const expected = `scale(${zoomLevel})`;
      const renderedComponent = shallow(<Tree data={mockData} zoom={zoomLevel} />);
      expect(renderedComponent.find(TransitionGroupWrapper).prop('transform')).toContain(expected);
    });

    it('applies default zoom level when `zoom` is not specified', () => {
      const renderedComponent = shallow(<Tree data={mockData} />);
      expect(renderedComponent.find(TransitionGroupWrapper).prop('transform')).toContain(
        `scale(1)`
      );
    });

    it('respects `scaleExtent` constraints on initial display', () => {
      const scaleExtent = { min: 0.2, max: 0.8 };

      let renderedComponent = shallow(
        <Tree data={mockData} scaleExtent={scaleExtent} zoom={0.9} />
      );
      expect(renderedComponent.find(TransitionGroupWrapper).prop('transform')).toContain(
        `scale(${scaleExtent.max})`
      );

      renderedComponent = shallow(<Tree data={mockData} scaleExtent={scaleExtent} zoom={0.1} />);
      expect(renderedComponent.find(TransitionGroupWrapper).prop('transform')).toContain(
        `scale(${scaleExtent.min})`
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

    it('rebinds on `props.enableLegacyTransitions` change to handle switched DOM nodes from TransitionGroupWrapper', () => {
      const renderedComponent = mount(<Tree data={mockData} />);
      expect(renderedComponent.instance().bindZoomListener).toHaveBeenCalledTimes(1);
      renderedComponent.setProps({ enableLegacyTransitions: true });
      expect(renderedComponent.instance().bindZoomListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event handlers', () => {
    describe('onNodeClick', () => {
      it('calls the onNodeClick callback when a node is toggled', () => {
        const onClickSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData} onNodeClick={onClickSpy} />);

        renderedComponent.find(Node).first().find('circle').simulate('click');

        expect(onClickSpy).toHaveBeenCalledTimes(1);
      });

      it('calls the onNodeClick callback even when `props.collapsible` is false', () => {
        const onClickSpy = vi.fn();
        const renderedComponent = mount(
          <Tree data={mockData} collapsible={false} onNodeClick={onClickSpy} />
        );

        renderedComponent.find(Node).first().find('circle').simulate('click');

        expect(onClickSpy).toHaveBeenCalledTimes(1);
      });

      it('clones the `hierarchyPointNode` representation & passes it to the onNodeClick callback if defined', () => {
        const onClickSpy = vi.fn();
        const mockEvt = { mock: 'event' };

        const renderedComponent = mount(
          // Disable `collapsible` here to avoid side-effects on the underlying tree structure,
          // i.e. node's expanding/collapsing onClick.
          <Tree data={mockData} onNodeClick={onClickSpy} collapsible={false} />
        );

        renderedComponent.find(Node).first().find('circle').simulate('click', mockEvt);

        expect(onClickSpy).toHaveBeenCalledWith(
          renderedComponent.find(Node).first().prop('hierarchyPointNode'),
          expect.objectContaining(mockEvt)
        );
      });

      it('persists the SynthethicEvent for downstream processing', () => {
        const persistSpy = vi.fn();
        const mockEvt = { mock: 'event', persist: persistSpy };
        const renderedComponent = mount(<Tree data={mockData} onNodeClick={() => {}} />);

        renderedComponent.find(Node).first().find('circle').simulate('click', mockEvt);

        expect(persistSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('onNodeMouseOver', () => {
      it('calls the onNodeMouseOver callback when a node is hovered over', () => {
        const onMouseOverSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData} onNodeMouseOver={onMouseOverSpy} />);

        renderedComponent.find(Node).first().find('circle').simulate('mouseover');

        expect(onMouseOverSpy).toHaveBeenCalledTimes(1);
      });

      it('does not call the onNodeMouseOver callback if it is not a function', () => {
        const onMouseOverSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData} onNodeMouseOver />);

        renderedComponent.find(Node).first().find('circle').simulate('mouseover');

        expect(onMouseOverSpy).toHaveBeenCalledTimes(0);
      });

      it('clones the `hierarchyPointNode` representation & passes it to the onNodeMouseOver callback if defined', () => {
        const onMouseOverSpy = vi.fn();
        const mockEvt = { mock: 'event' };
        const renderedComponent = mount(<Tree data={mockData} onNodeMouseOver={onMouseOverSpy} />);

        renderedComponent.find(Node).first().find('circle').simulate('mouseover', mockEvt);

        expect(onMouseOverSpy).toHaveBeenCalledWith(
          renderedComponent.find(Node).first().prop('hierarchyPointNode'),
          expect.objectContaining(mockEvt)
        );
      });

      it('persists the SynthethicEvent for downstream processing if handler is defined', () => {
        const persistSpy = vi.fn();
        const mockEvt = { mock: 'event', persist: persistSpy };
        const renderedComponent = mount(<Tree data={mockData} onNodeMouseOver={() => {}} />);

        renderedComponent.find(Node).first().find('circle').simulate('mouseover', mockEvt);

        expect(persistSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('onNodeMouseOut', () => {
      it('calls the onNodeMouseOut callback when a node is hovered over', () => {
        const onMouseOutSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData} onNodeMouseOut={onMouseOutSpy} />);

        renderedComponent.find(Node).first().find('circle').simulate('mouseout');

        expect(onMouseOutSpy).toHaveBeenCalledTimes(1);
      });

      it('does not call the onNodeMouseOut callback if it is not a function', () => {
        const onMouseOutSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData} onNodeMouseOut />);

        renderedComponent.find(Node).first().find('circle').simulate('mouseout');

        expect(onMouseOutSpy).toHaveBeenCalledTimes(0);
      });

      it('clones the `hierarchyPointNode` representation & passes it to the onNodeMouseOut callback if defined', () => {
        const onMouseOutSpy = vi.fn();
        const mockEvt = { mock: 'event' };
        const renderedComponent = mount(<Tree data={mockData} onNodeMouseOut={onMouseOutSpy} />);

        renderedComponent.find(Node).first().find('circle').simulate('mouseout', mockEvt);

        expect(onMouseOutSpy).toHaveBeenCalledWith(
          renderedComponent.find(Node).first().prop('hierarchyPointNode'),
          expect.objectContaining(mockEvt)
        );
      });

      it('persists the SynthethicEvent for downstream processing if handler is defined', () => {
        const persistSpy = vi.fn();
        const mockEvt = { mock: 'event', persist: persistSpy };
        const renderedComponent = mount(<Tree data={mockData} onNodeMouseOut={() => {}} />);

        renderedComponent.find(Node).first().find('circle').simulate('mouseout', mockEvt);

        expect(persistSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('onLinkClick', () => {
      it('calls the onLinkClick callback when a node is toggled', () => {
        const onLinkClickSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData2} onLinkClick={onLinkClickSpy} />);

        renderedComponent.find(Link).first().simulate('click');

        expect(onLinkClickSpy).toHaveBeenCalledTimes(1);
      });

      it('does not call the onLinkClick callback if it is not a function', () => {
        const onClickSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData} onLinkClick />);

        renderedComponent.find(Link).first().simulate('click');

        expect(onClickSpy).toHaveBeenCalledTimes(0);
      });

      it('calls the onLinkClick callback even when `props.collapsible` is false', () => {
        const onLinkClickSpy = vi.fn();
        const renderedComponent = mount(
          <Tree data={mockData} collapsible={false} onLinkClick={onLinkClickSpy} />
        );

        renderedComponent.find(Link).first().simulate('click');

        expect(onLinkClickSpy).toHaveBeenCalledTimes(1);
      });

      it("clones the clicked link's data & passes it to the onLinkClick callback if defined", () => {
        const onLinkClickSpy = vi.fn();
        const mockEvt = { mock: 'event' };
        const renderedComponent = mount(<Tree data={mockData2} onLinkClick={onLinkClickSpy} />);

        renderedComponent.find(Link).first().simulate('click', mockEvt);

        expect(onLinkClickSpy).toHaveBeenCalledWith(
          renderedComponent.find(Link).first().prop('linkData').source,
          renderedComponent.find(Link).first().prop('linkData').target,
          expect.objectContaining(mockEvt)
        );
      });

      it('persists the SyntheticEvent for downstream processing', () => {
        const persistSpy = vi.fn();
        const mockEvt = { mock: 'event', persist: persistSpy };
        const renderedComponent = mount(<Tree data={mockData2} onLinkClick={() => {}} />);

        renderedComponent.find(Link).first().simulate('click', mockEvt);

        expect(persistSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('onLinkMouseOver', () => {
      it('calls the onLinkMouseOver callback when a node is hovered over', () => {
        const onLinkMouseOverOverSpy = vi.fn();
        const renderedComponent = mount(
          <Tree data={mockData} onLinkMouseOver={onLinkMouseOverOverSpy} />
        );

        renderedComponent.find(Link).first().simulate('mouseover');

        expect(onLinkMouseOverOverSpy).toHaveBeenCalledTimes(1);
      });

      it('does not call the onLinkMouseOver callback if it is not a function', () => {
        const onLinkMouseOverSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData} onLinkMouseOver />);

        renderedComponent.find(Link).first().simulate('mouseover');

        expect(onLinkMouseOverSpy).toHaveBeenCalledTimes(0);
      });

      it("clones the hovered node's data & passes it to the onLinkMouseOver callback if defined", () => {
        const onLinkMouseOverOverSpy = vi.fn();
        const mockEvt = { mock: 'event' };
        const renderedComponent = mount(
          <Tree data={mockData} onLinkMouseOver={onLinkMouseOverOverSpy} />
        );

        renderedComponent.find(Link).first().simulate('mouseover', mockEvt);

        expect(onLinkMouseOverOverSpy).toHaveBeenCalledWith(
          renderedComponent.find(Link).first().prop('linkData').source,
          renderedComponent.find(Link).first().prop('linkData').target,
          expect.objectContaining(mockEvt)
        );
      });

      it('persists the SynthethicEvent for downstream processing if handler is defined', () => {
        const persistSpy = vi.fn();
        const mockEvt = { mock: 'event', persist: persistSpy };
        const renderedComponent = mount(<Tree data={mockData} onLinkMouseOver={() => {}} />);

        renderedComponent.find(Link).first().simulate('mouseover', mockEvt);

        expect(persistSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('onLinkMouseOut', () => {
      it('calls the onLinkMouseOut callback when a node is hovered over', () => {
        const onLinkMouseOutSpy = vi.fn();
        const renderedComponent = mount(
          <Tree data={mockData} onLinkMouseOut={onLinkMouseOutSpy} />
        );

        renderedComponent.find(Link).first().simulate('mouseout');

        expect(onLinkMouseOutSpy).toHaveBeenCalledTimes(1);
      });

      it('does not call the onLinkMouseOut callback if it is not a function', () => {
        const onLinkMouseOutSpy = vi.fn();
        const renderedComponent = mount(<Tree data={mockData} onLinkMouseOut />);

        renderedComponent.find(Link).first().simulate('mouseout');

        expect(onLinkMouseOutSpy).toHaveBeenCalledTimes(0);
      });

      it("clones the hovered node's data & passes it to the onNodeMouseOut callback if defined", () => {
        const onLinkMouseOutSpy = vi.fn();
        const mockEvt = { mock: 'event' };
        const renderedComponent = mount(
          <Tree data={mockData} onLinkMouseOut={onLinkMouseOutSpy} />
        );

        renderedComponent.find(Link).first().simulate('mouseout', mockEvt);

        expect(onLinkMouseOutSpy).toHaveBeenCalledWith(
          renderedComponent.find(Link).first().prop('linkData').source,
          renderedComponent.find(Link).first().prop('linkData').target,
          expect.objectContaining(mockEvt)
        );
      });

      it('persists the SynthethicEvent for downstream processing if handler is defined', () => {
        const persistSpy = vi.fn();
        const mockEvt = { mock: 'event', persist: persistSpy };
        const renderedComponent = mount(<Tree data={mockData} onLinkMouseOut={() => {}} />);

        renderedComponent.find(Link).first().simulate('mouseout', mockEvt);

        expect(persistSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('onUpdate', () => {
      it('calls `onUpdate` on node toggle', () => {
        const onUpdateSpy = vi.fn();

        const renderedComponent = mount(<Tree data={mockData} onUpdate={onUpdateSpy} />);
        renderedComponent.find(Node).first().simulate('click'); // collapse

        expect(onUpdateSpy).toHaveBeenCalledWith({
          node: expect.any(Object),
          zoom: 1,
          translate: { x: 0, y: 0 },
        });
      });

      it('calls `onUpdate` on zoom', () => {
        const onUpdateSpy = vi.fn();

        document.body.innerHTML += '<div id="reactContainer"></div>';
        render(
          <Tree
            data={mockData}
            onUpdate={onUpdateSpy}
            scaleExtent={{ min: 0.1, max: 10 }}
            zoom={1}
          />,
          document.querySelector('#reactContainer')
        );
        const scrollableComponent = document.querySelector('.rd3t-tree-container > svg');
        // `componentDidMount` triggers one update, which also calls `onUpdate`.
        expect(onUpdateSpy).toHaveBeenCalledTimes(1);
        onUpdateSpy.mockClear();

        scrollableComponent.dispatchEvent(new Event('wheel'));
        expect(onUpdateSpy).toHaveBeenCalledTimes(1);
        expect(onUpdateSpy).toHaveBeenCalledWith({
          node: null,
          translate: { x: expect.any(Number), y: expect.any(Number) },
          zoom: expect.any(Number),
        });
      });

      it('does not call `onUpdate` if not a function', () => {
        const onUpdateSpy = vi.fn();

        document.body.innerHTML += '<div id="reactContainer"></div>';
        render(
          <Tree data={mockData} onUpdate scaleExtent={{ min: 0.1, max: 10 }} />,
          document.querySelector('#reactContainer')
        );
        const scrollableComponent = document.querySelector('.rd3t-tree-container > svg');
        scrollableComponent.dispatchEvent(new Event('wheel'));
        expect(onUpdateSpy).toHaveBeenCalledTimes(0);
      });

      it('passes the specified (not default) `zoom` and `translate` when a node is clicked for the 1st time', () => {
        const onUpdateSpy = vi.fn();
        const zoom = 0.7;
        const translate = { x: 10, y: 5 };

        const renderedComponent = mount(
          <Tree data={mockData} zoom={zoom} translate={translate} onUpdate={onUpdateSpy} />
        );
        renderedComponent.find(Node).first().simulate('click');

        expect(onUpdateSpy).toHaveBeenCalledWith({
          node: expect.any(Object),
          translate,
          zoom,
        });
      });
    });
  });

  describe('addChildren', () => {
    const newChildren = [
      { name: 'added A' },
      { name: 'added B', children: [{ name: 'added B1' }] },
    ];

    it('appends the given children to the node and assigns internal properties', () => {
      let addChildren;
      const renderedComponent = mount(
        <Tree
          data={mockData}
          renderCustomNodeElement={rd3tProps => {
            if (rd3tProps.nodeDatum.name === 'Top Level') {
              addChildren = rd3tProps.addChildren;
            }
            return <circle r={10} />;
          }}
        />
      );
      const nodeCount = renderedComponent.find(Node).length;

      act(() => addChildren(newChildren));
      renderedComponent.update();

      expect(renderedComponent.find(Node).length).toBe(nodeCount + 3);
      const root = renderedComponent.find(Node).first().prop('data');
      const added = root.children.slice(-2);
      expect(added.map(n => n.name)).toEqual(['added A', 'added B']);
      expect(added.map(n => n.__rd3t.depth)).toEqual([1, 1]);
      expect(added[1].children[0].__rd3t.depth).toBe(2);
      expect(added.every(n => typeof n.__rd3t.id === 'string')).toBe(true);
    });

    it('leaves the tree unchanged when no node matches the id', () => {
      const renderedComponent = mount(<Tree data={mockData} />);
      const nodeCount = renderedComponent.find(Node).length;

      act(() => renderedComponent.instance().handleAddChildrenToNode('no-such-id', newChildren));
      renderedComponent.update();

      expect(renderedComponent.find(Node).length).toBe(nodeCount);
    });
  });

  describe('centerNode', () => {
    const dimensions = { width: 400, height: 300 };
    let container;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    it.each([
      ['horizontal', ({ x, y }, scale) => [-y * scale + 200, -x * scale + 150]],
      ['vertical', ({ x, y }, scale) => [-x * scale + 200, -y * scale + 150]],
    ])('centers the clicked node in a %s tree', (orientation, expected) => {
      const zoom = 0.5;
      const renderedComponent = mount(
        <Tree
          data={mockData}
          dimensions={dimensions}
          orientation={orientation}
          zoom={zoom}
          centeringTransitionDuration={0}
        />,
        { attachTo: container }
      );
      const target = renderedComponent.find(Node).at(1);
      const point = target.prop('hierarchyPointNode');

      target.find('circle').simulate('click');

      const [x, y] = expected(point, zoom);
      const svg = container.querySelector('.rd3t-svg');
      expect(svg.__zoom).toMatchObject({ x, y, k: zoom });
      renderedComponent.detach();
    });

    it('does nothing without `dimensions`', () => {
      const renderedComponent = mount(<Tree data={mockData} zoom={0.5} />, {
        attachTo: container,
      });
      const svg = container.querySelector('.rd3t-svg');
      const before = { ...svg.__zoom };

      renderedComponent.find(Node).at(1).find('circle').simulate('click');

      expect(svg.__zoom).toMatchObject(before);
      renderedComponent.detach();
    });
  });
});
