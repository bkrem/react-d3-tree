import React from 'react';
import { shallow, mount } from 'enzyme';
import { TransitionGroup } from 'react-transition-group';

import NodeWrapper from '../NodeWrapper';

describe('<NodeWrapper />', () => {
  jest.spyOn(NodeWrapper.prototype, 'setState');

  // Clear method spies on prototype after each test
  afterEach(() => jest.clearAllMocks());

  it('Renders a <g> when transitions are disabled', () => {
    const fixture = {
      transform: 't',
      className: 'cls',
      transitionDuration: 0,
    };

    const renderedComponent = shallow(<NodeWrapper {...fixture}>{[]}</NodeWrapper>);
    expect(renderedComponent.find('g').prop('transform')).toContain(fixture.transform);
    expect(renderedComponent.find('g').prop('className')).toContain(fixture.className);
  });

  it('Renders a <TransitionGroup> when transitions are enabled', () => {
    const fixture = {
      component: 'g',
      transform: 't',
      className: 'cls',
      transitionDuration: 10,
    };

    const renderedComponent = shallow(<NodeWrapper {...fixture}>{[]}</NodeWrapper>);
    expect(renderedComponent.find(TransitionGroup).prop('transform')).toContain(fixture.transform);
    expect(renderedComponent.find(TransitionGroup).prop('className')).toContain(fixture.className);
    expect(renderedComponent.find(TransitionGroup).prop('component')).toContain(fixture.component);
  });

  it('does not do useless state updates unless transitionDuration has changed', () => {
    const fixture = {
      transform: 't',
      className: 'cls',
      transitionDuration: 1,
    };

    const renderedComponent = mount(<NodeWrapper {...fixture}>{[]}</NodeWrapper>);
    renderedComponent.setProps(fixture);
    expect(renderedComponent.instance().setState).toHaveBeenCalledTimes(0);
    renderedComponent.setProps({
      ...fixture,
      transitionDuration: 2,
    });
    expect(renderedComponent.instance().setState).toHaveBeenCalledTimes(1);
  });
});
