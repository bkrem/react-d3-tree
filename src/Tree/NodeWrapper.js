import React from 'react';
import T from 'prop-types';
import { TransitionGroup } from 'react-transition-group';

export default class NodeWrapper extends React.Component {
  state = {
    enableTransitions: this.props.transitionDuration > 0,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.transitionDuration !== this.props.transitionDuration) {
      this.setState({
        enableTransitions: nextProps.transitionDuration > 0,
      });
    }
  }

  render() {
    if (this.state.enableTransitions) {
      return (
        <TransitionGroup
          component={this.props.component}
          className={this.props.className}
          transform={this.props.transform}
        >
          {this.props.children}
        </TransitionGroup>
      );
    }

    return (
      <g className={this.props.className} transform={this.props.transform}>
        {this.props.children}
      </g>
    );
  }
}

NodeWrapper.defaultProps = {
  component: 'g',
};

NodeWrapper.propTypes = {
  transitionDuration: T.number.isRequired,
  component: T.string,
  className: T.string.isRequired,
  transform: T.string.isRequired,
  children: T.array.isRequired,
};
