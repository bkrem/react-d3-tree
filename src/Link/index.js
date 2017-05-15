import React, { PropTypes } from 'react';
import { svg, select } from 'd3';

import './style.css';

export default class Link extends React.PureComponent {

  constructor(props) {
    super(props);
    this.expandPath = this.expandPath.bind(this);
  }

  componentDidMount() {
    console.log('mounted:\n', `${this.props.linkData.source.name}-->${this.props.linkData.target.name}`);
    select(this.link)
    .transition()
    .duration(500)
    .attr('d', this.expandPath());
  }

  componentWillLeave() {
    const { orientation, linkData } = this.props;
    console.log('Leaving:\n', `${linkData.source.name}-->${linkData.target.name}`);
    select(this.link)
    .transition()
    .duration(500)
    .attr('d', this.collapsePath());
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
        d={this.collapsePath()}
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
