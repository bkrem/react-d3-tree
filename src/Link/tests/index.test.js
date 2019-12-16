import React from 'react';
import { shallow, mount } from 'enzyme';

import Link from '../index';

// TODO Find a way to meaningfully test `componentWillLeave`
describe('<Link />', () => {
  const linkData = {
    source: {
      x: 123,
      y: 321,
    },
    target: {
      x: 456,
      y: 654,
    },
  };

  const mockProps = {
    linkData,
    pathFunc: 'diagonal',
    orientation: 'horizontal',
    transitionDuration: 500,
    onClick: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
    styles: {},
  };

  const pathFuncs = {
    testPathFunc: (d, orientation) =>
      orientation && `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`,
  };

  jest.spyOn(Link.prototype, 'drawPath');
  jest.spyOn(Link.prototype, 'drawDiagonalPath');
  jest.spyOn(Link.prototype, 'drawElbowPath');
  jest.spyOn(Link.prototype, 'drawStraightPath');
  jest.spyOn(Link.prototype, 'drawStepPath');
  jest.spyOn(Link.prototype, 'applyOpacity');
  jest.spyOn(pathFuncs, 'testPathFunc');

  // Clear method spies on prototype after each test
  afterEach(() => jest.clearAllMocks());

  it('applies the base className', () => {
    const renderedComponent = shallow(<Link {...mockProps} />);

    expect(renderedComponent.prop('className')).toBe('linkBase');
  });

  it('applies `props.styles` when defined', () => {
    const initialStyle = { opacity: 0 }; // state.initialStyle
    const fixture = { ...initialStyle, stroke: '#777', strokeWidth: 2 };
    const renderedComponent = shallow(<Link {...mockProps} styles={fixture} />);

    expect(renderedComponent.prop('style')).toEqual(fixture);
  });

  it('binds IDs of source & target nodes to data-source-id/data-target-id', () => {
    linkData.source.id = 1;
    linkData.target.id = 2;
    const renderedComponent = shallow(<Link {...mockProps} />);
    expect(renderedComponent.find('path').prop('data-source-id')).toBe(linkData.source.id);
    expect(renderedComponent.find('path').prop('data-target-id')).toBe(linkData.target.id);
    delete linkData.source.id;
    delete linkData.target.id;
  });

  it('calls the appropriate path func based on `props.pathFunc`', () => {
    const diagonalComponent = shallow(<Link {...mockProps} />);
    const elbowComponent = shallow(<Link {...mockProps} pathFunc="elbow" />);
    const straightComponent = shallow(<Link {...mockProps} pathFunc="straight" />);
    const stepComponent = shallow(<Link {...mockProps} pathFunc="step" />);
    shallow(<Link {...mockProps} pathFunc={pathFuncs.testPathFunc} />);

    expect(diagonalComponent.instance().drawDiagonalPath).toHaveBeenCalled();
    expect(elbowComponent.instance().drawElbowPath).toHaveBeenCalled();
    expect(straightComponent.instance().drawStraightPath).toHaveBeenCalled();
    expect(stepComponent.instance().drawStepPath).toHaveBeenCalled();
    expect(pathFuncs.testPathFunc).toHaveBeenCalled();
    expect(Link.prototype.drawPath).toHaveBeenCalledTimes(5);
  });

  it('returns an appropriate elbowPath according to `props.orientation`', () => {
    expect(Link.prototype.drawElbowPath(linkData, 'horizontal')).toBe(
      `M${linkData.source.y},${linkData.source.x}V${linkData.target.x}H${linkData.target.y}`,
    );
    expect(Link.prototype.drawElbowPath(linkData, 'vertical')).toBe(
      `M${linkData.source.x},${linkData.source.y}V${linkData.target.y}H${linkData.target.x}`,
    );
  });

  it('returns an appropriate diagonal according to `props.orientation`', () => {
    const ymean = (linkData.target.y + linkData.source.y) / 2;
    expect(Link.prototype.drawDiagonalPath(linkData, 'horizontal')).toBe(
      `M${linkData.source.y},${linkData.source.x}` +
        `C${ymean},${linkData.source.x} ${ymean},${linkData.target.x} ` +
        `${linkData.target.y},${linkData.target.x}`,
    );
    expect(Link.prototype.drawDiagonalPath(linkData, 'vertical')).toBe(
      `M${linkData.source.x},${linkData.source.y}` +
        `C${linkData.source.x},${ymean} ${linkData.target.x},${ymean} ` +
        `${linkData.target.x},${linkData.target.y}`,
    );
  });

  it('returns an appropriate straightPath according to `props.orientation`', () => {
    expect(Link.prototype.drawStraightPath(linkData, 'horizontal')).toBe(
      `M${linkData.source.y},${linkData.source.x}L${linkData.target.y},${linkData.target.x}`,
    );
    expect(Link.prototype.drawStraightPath(linkData, 'vertical')).toBe(
      `M${linkData.source.x},${linkData.source.y}L${linkData.target.x},${linkData.target.y}`,
    );
  });

  it('return an appropriate stepPath according to `props.orientation`', () => {
    const { source, target } = linkData;
    const deltaY = target.y - source.y;

    expect(Link.prototype.drawStepPath(linkData, 'horizontal')).toBe(
      `M${source.y},${source.x} H${source.y + deltaY / 2} V${target.x} H${target.y}`,
    );
    expect(Link.prototype.drawStepPath(linkData, 'vertical')).toBe(
      `M${source.x},${source.y} V${source.y + deltaY / 2} H${target.x} V${target.y}`,
    );
  });

  it('fades in once it has been mounted', () => {
    const fixture = 1;
    const renderedComponent = mount(<Link {...mockProps} />);

    expect(renderedComponent.instance().applyOpacity).toHaveBeenCalledWith(
      fixture,
      mockProps.transitionDuration,
    );
  });

  describe('Events', () => {
    it('handles onClick events and passes its nodeId & event object to onClick handler', () => {
      const onClickSpy = jest.fn();
      const mockEvt = { mock: 'event' };
      const renderedComponent = shallow(<Link {...mockProps} onClick={onClickSpy} />);

      renderedComponent.simulate('click', mockEvt);
      expect(onClickSpy).toHaveBeenCalledTimes(1);
      expect(onClickSpy).toHaveBeenCalledWith(
        linkData.source,
        linkData.target,
        expect.objectContaining(mockEvt),
      );
    });

    it('handles onMouseOver events and passes its nodeId & event object to onMouseOver handler', () => {
      const onMouseOverSpy = jest.fn();
      const mockEvt = { mock: 'event' };
      const renderedComponent = shallow(<Link {...mockProps} onMouseOver={onMouseOverSpy} />);

      renderedComponent.simulate('mouseover', mockEvt);
      expect(onMouseOverSpy).toHaveBeenCalledTimes(1);
      expect(onMouseOverSpy).toHaveBeenCalledWith(
        linkData.source,
        linkData.target,
        expect.objectContaining(mockEvt),
      );
    });

    it('handles onMouseOut events and passes its nodeId & event object to onMouseOut handler', () => {
      const onMouseOutSpy = jest.fn();
      const mockEvt = { mock: 'event' };
      const renderedComponent = shallow(<Link {...mockProps} onMouseOut={onMouseOutSpy} />);

      renderedComponent.simulate('mouseout', mockEvt);
      expect(onMouseOutSpy).toHaveBeenCalledTimes(1);
      expect(onMouseOutSpy).toHaveBeenCalledWith(
        linkData.source,
        linkData.target,
        expect.objectContaining(mockEvt),
      );
    });
  });
});
