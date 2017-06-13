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


  jest.spyOn(Link.prototype, 'diagonalPath');
  jest.spyOn(Link.prototype, 'elbowPath');
  jest.spyOn(Link.prototype, 'applyOpacity');

  // Clear method spies on prototype after each test
  afterEach(() => jest.clearAllMocks());


  it('applies the base className', () => {
    const renderedComponent = shallow(
      <Link {...mockProps} />
    );

    expect(renderedComponent.prop('className')).toBe('linkBase');
  });


  it('applies `props.styles` when defined', () => {
    const initialStyle = { opacity: 0 }; // state.initialStyle
    const fixture = { ...initialStyle, stroke: '#777', strokeWidth: 2 };
    const renderedComponent = shallow(
      <Link
        {...mockProps}
        styles={fixture}
      />
    );

    expect(renderedComponent.prop('style')).toEqual(fixture);
  });


  it('calls the appropriate path func based on `props.pathFunc`', () => {
    const diagonalComponent = shallow(
      <Link {...mockProps} />
    );
    const elbowComponent = shallow(
      <Link
        {...mockProps}
        pathFunc="elbow"
      />
    );

    expect(diagonalComponent.instance().diagonalPath).toHaveBeenCalled();
    expect(elbowComponent.instance().elbowPath).toHaveBeenCalled();
  });


  it('returns an appropriate elbowPath according to `props.orientation`', () => {
    expect(
      Link.prototype.elbowPath(linkData, 'horizontal')
    ).toBe(`M${linkData.source.y},${linkData.source.x}V${linkData.target.x}H${linkData.target.y}`);
    expect(
      Link.prototype.elbowPath(linkData, 'vertical')
    ).toBe(`M${linkData.source.x},${linkData.source.y}V${linkData.target.y}H${linkData.target.x}`);
  });


  it('fades in once it has been mounted', () => {
    const fixture = 1;
    const renderedComponent = mount(
      <Link {...mockProps} />
    );

    expect(renderedComponent.instance().applyOpacity).toHaveBeenCalledWith(fixture);
  });
});
