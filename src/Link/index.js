import React, { PropTypes } from 'react';
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

  elbowPath(d, orientation) {
    return orientation === 'horizontal' ?
      `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}` :
      `M${d.source.x},${d.source.y}V${d.target.y}H${d.target.x}`;
  }

  drawPath() {
    const { linkData, orientation, pathFunc } = this.props;
    return pathFunc === 'diagonal'
      ? this.diagonalPath(linkData, orientation)
      : this.elbowPath(linkData, orientation);
  }

  render() {
    return (
      <path
        ref={(l) => { this.link = l; }}
        style={this.state.initialStyle}
        className="linkBase"
        d={this.drawPath()}
      />
    );
  }
}

Link.propTypes = {
  linkData: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf([
    'horizontal',
    'vertical',
  ]).isRequired,
  pathFunc: PropTypes.oneOf([
    'diagonal',
    'elbow',
  ]).isRequired,
  transitionDuration: PropTypes.number.isRequired,
};
