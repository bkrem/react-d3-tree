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

  it('calls the appropriate path func based on `props.pathFunc`', () => {
    const diagonalComponent = shallow(<Link {...mockProps} />);
    const elbowComponent = shallow(<Link {...mockProps} pathFunc="elbow" />);
    const straightComponent = shallow(<Link {...mockProps} pathFunc="straight" />);
    shallow(<Link {...mockProps} pathFunc={pathFuncs.testPathFunc} />);

    expect(diagonalComponent.instance().drawDiagonalPath).toHaveBeenCalled();
    expect(elbowComponent.instance().drawElbowPath).toHaveBeenCalled();
    expect(straightComponent.instance().drawStraightPath).toHaveBeenCalled();
    expect(pathFuncs.testPathFunc).toHaveBeenCalled();
    expect(Link.prototype.drawPath).toHaveBeenCalledTimes(4);
  });

  it('returns an appropriate elbowPath according to `props.orientation`', () => {
    expect(Link.prototype.drawElbowPath(linkData, 'horizontal')).toBe(
      `M${linkData.source.y},${linkData.source.x}V${linkData.target.x}H${linkData.target.y}`,
    );
    expect(Link.prototype.drawElbowPath(linkData, 'vertical')).toBe(
      `M${linkData.source.x},${linkData.source.y}V${linkData.target.y}H${linkData.target.x}`,
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

  it('fades in once it has been mounted', () => {
    const fixture = 1;
    const renderedComponent = mount(<Link {...mockProps} />);

    expect(renderedComponent.instance().applyOpacity).toHaveBeenCalledWith(
      fixture,
      mockProps.transitionDuration,
    );
  });
});
