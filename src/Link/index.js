import React, { PropTypes } from 'react';
import { svg, select } from 'd3';

import './style.css';

export default class Link extends React.PureComponent {

  constructor(props) {
    super(props);
    this.expandPath = this.expandPath.bind(this);
  }

  componentDidMount() {
    console.log('mounted:', this.props.linkData.target.name);
    select(this.link)
    .transition()
    .duration(500)
    .attr('d', this.expandPath());
  }

  componentWillLeave() {
    const { orientation, linkData } = this.props;
    const origin = { x: linkData.source.x, y: linkData.source.y };
    console.log('Leaving:', linkData.target.name);
    select(this.link)
    .transition()
    .duration(500)
    .attr('d', this.diagonalPath({ source: origin, target: origin }, orientation));
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

  expandPath() {
    const { linkData, orientation, pathFunc } = this.props;
    return pathFunc === 'diagonal'
      ? this.diagonalPath(linkData, orientation)
      : this.elbowPath(linkData, orientation);
  }

  render() {
    const { linkData } = this.props;
    const origin = { x: linkData.source.y, y: linkData.source.x };
    return (
      <path
        ref={(l) => { this.link = l; }}
        className="linkBase"
        d={this.diagonalPath({ source: origin, target: origin })}
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
};
