import React from 'react';
import { shallow } from 'enzyme';
import { TransitionGroup } from '@bkrem/react-transition-group';

import TransitionGroupWrapper from '../TransitionGroupWrapper.tsx';

describe('<TransitionGroupWrapper />', () => {
  it('renders a <g> when transitions are disabled', () => {
    const fixture = {
      component: 'g',
      transform: 't',
      className: 'cls',
      enableLegacyTransitions: false,
      transitionDuration: 500,
    };

    const renderedComponent = shallow(
      <TransitionGroupWrapper {...fixture}>{[]}</TransitionGroupWrapper>
    );
    expect(renderedComponent.find('g').prop('transform')).toContain(fixture.transform);
    expect(renderedComponent.find('g').prop('className')).toContain(fixture.className);
  });

  it('renders a <TransitionGroup> when transitions are enabled', () => {
    const fixture = {
      component: 'g',
      transform: 't',
      className: 'cls',
      enableLegacyTransitions: true,
      transitionDuration: 500,
    };

    const renderedComponent = shallow(
      <TransitionGroupWrapper {...fixture}>{[]}</TransitionGroupWrapper>
    );
    expect(renderedComponent.find(TransitionGroup).prop('transform')).toContain(fixture.transform);
    expect(renderedComponent.find(TransitionGroup).prop('className')).toContain(fixture.className);
    expect(renderedComponent.find(TransitionGroup).prop('component')).toContain(fixture.component);
  });
});
