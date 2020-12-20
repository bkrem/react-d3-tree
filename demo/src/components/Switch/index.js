import PropTypes from 'prop-types'
import React, { Component } from 'react';
import './styles.css';

class Input extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    variable: PropTypes.object
  };

  render() {
    const { variable, name, onChange, checked } = this.props;
    return (
      <div className='onoffswitch'>
        <input type='checkbox' className='onoffswitch-checkbox' id={name} name={name}
          onChange={onChange} checked={checked} {...variable} />
        <label className='onoffswitch-label' htmlFor={name}>
          <span className='onoffswitch-inner' />
          <span className='onoffswitch-switch' />
        </label>
      </div>
    );
  }
}

export default Input;