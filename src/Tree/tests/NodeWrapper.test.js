import React from 'react';
import { shallow } from 'enzyme';
import { TransitionGroup } from 'react-transition-group';

import NodeWrapper from '../NodeWrapper';

describe('<NodeWrapper />', () => {
  it('renders a <g> when transitions are disabled', () => {
    const fixture = {
      transform: 't',
      className: 'cls',
      transitionDuration: 0,
    };

    const renderedComponent = shallow(<NodeWrapper {...fixture}>{[]}</NodeWrapper>);
    expect(renderedComponent.find('g').prop('transform')).toContain(fixture.transform);
    expect(renderedComponent.find('g').prop('className')).toContain(fixture.className);
  });

  it('renders a <TransitionGroup> when transitions are enabled', () => {
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
});
