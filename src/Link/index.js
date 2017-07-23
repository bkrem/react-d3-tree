import React from 'react';
import PropTypes from 'prop-types';
import { svg, select } from 'd3';

import './style.css';

export default class Link extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      initialStyle: {
        opacity: 0,
      },
    };
  }

  componentDidMount() {
    this.applyOpacity(1);
  }

  componentWillLeave(done) {
    this.applyOpacity(0, done);
  }

  applyOpacity(opacity, done = () => {}) {
    const { transitionDuration } = this.props;

    select(this.link)
    .transition()
    .duration(transitionDuration)
    .style('opacity', opacity)
    .each('end', done);
  }

  diagonalPath(linkData, orientation) {
    const diagonal = svg.diagonal().projection((d) =>
      orientation === 'horizontal' ? [d.y, d.x] : [d.x, d.y]
    );
    return diagonal(linkData);
  }

  straightPath(linkData, orientation) {
    const straight = svg.line().interpolate('basis')
      .x((d) => d.x)
      .y((d) => d.y);

    let data = [
      { x: linkData.source.x, y: linkData.source.y },
      { x: linkData.target.x, y: linkData.target.y },
    ];

    if (orientation === 'horizontal') {
      data = [
        { x: linkData.source.y, y: linkData.source.x },
        { x: linkData.target.y, y: linkData.target.x },
      ];
    }

    return straight(data);
  }

  elbowPath(d, orientation) {
    return orientation === 'horizontal' ?
      `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}` :
      `M${d.source.x},${d.source.y}V${d.target.y}H${d.target.x}`;
  }

  drawPath() {
    const { linkData, orientation, pathFunc } = this.props;

    if (pathFunc === 'elbow') {
      return this.elbowPath(linkData, orientation);
    }

    if (pathFunc === 'straight') {
      return this.straightPath(linkData, orientation);
    }

    return this.diagonalPath(linkData, orientation);
  }

  render() {
    const { styles } = this.props;
    return (
      <path
        ref={(l) => { this.link = l; }}
        style={{ ...this.state.initialStyle, ...styles }}
        className="linkBase"
        d={this.drawPath()}
      />
    );
  }
}

Link.defaultProps = {
  styles: {},
};

Link.propTypes = {
  linkData: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf([
    'horizontal',
    'vertical',
  ]).isRequired,
  pathFunc: PropTypes.oneOf([
    'diagonal',
    'elbow',
    'straight',
  ]).isRequired,
  transitionDuration: PropTypes.number.isRequired,
  styles: PropTypes.object,
};
