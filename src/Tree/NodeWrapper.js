import React from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup } from 'react-transition-group';

export default class NodeWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enableTransitions: props.transitionDuration > 0,
    };
  }

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
  transitionDuration: PropTypes.number.isRequired,
  component: PropTypes.string,
  className: PropTypes.string.isRequired,
  transform: PropTypes.string.isRequired,
  children: PropTypes.array.isRequired,
};
