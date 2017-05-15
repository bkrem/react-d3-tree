import React from 'react';
import { shallow } from 'enzyme';

import Link from '../index';

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

  // Clear method spies on prototype before each test
  afterEach(() => jest.clearAllMocks());

  it('should apply the base className', () => {
    const renderedComponent = shallow(
      <Link
        linkData={linkData}
        pathFunc="diagonal"
        orientation="horizontal"
      />
    );

    expect(renderedComponent.prop('className')).toBe('linkBase');
  });

  it('should call the appropriate path func based on `props.pathFunc`', () => {
    jest.spyOn(Link.prototype, 'diagonalPath');
    jest.spyOn(Link.prototype, 'elbowPath');
    const diagonalComponent = shallow(
      <Link
        linkData={linkData}
        pathFunc="diagonal"
        orientation="horizontal"
      />
    );
    const elbowComponent = shallow(
      <Link
        linkData={linkData}
        pathFunc="elbow"
        orientation="horizontal"
      />
    );

    expect(diagonalComponent.instance().diagonalPath).toHaveBeenCalled();
    expect(elbowComponent.instance().elbowPath).toHaveBeenCalled();
  });

  // it('should return an appropriate diagonalPath according to `props.orientation`', () => {
  //   jest.spyOn(Link.prototype, 'diagonalPath');
  //   const renderedComponent = shallow(
  //     <Link
  //       linkData={linkData}
  //       pathFunc="diagonal"
  //       orientation="horizontal"
  //     />
  //   );
  // });
});
