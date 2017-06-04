import React, { PropTypes } from 'react';
import { svg, select } from 'd3';

import './style.css';

export default class Link extends React.PureComponent {

  componentDidMount() {
    this.applyOpacity(1);
  }

  componentWillLeave(done) {
    this.applyOpacity(0, done);
  }

  applyOpacity(opacity, done = () => {}) {
    const { enabled, duration } = this.props.transitions;
    if (enabled) {
      select(this.link)
      .transition()
      .duration(duration)
      .style('opacity', opacity)
      .each('end', done);
    } else {
      done();
    }
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

  collapsePath() {
    const { linkData, orientation, pathFunc } = this.props;
    const origin = { x: linkData.source.x, y: linkData.source.y };
    const pathDescriptor = { source: origin, target: origin };
    return pathFunc === 'diagonal'
      ? this.diagonalPath(pathDescriptor, orientation)
      : this.elbowPath(pathDescriptor, orientation);
  }

  expandPath() {
    const { linkData, orientation, pathFunc } = this.props;
    return pathFunc === 'diagonal'
      ? this.diagonalPath(linkData, orientation)
      : this.elbowPath(linkData, orientation);
  }

  render() {
    return (
      <path
        ref={(l) => { this.link = l; }}
        className="linkBase"
        d={this.expandPath()}
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
  transitions: PropTypes.object.isRequired,
};
