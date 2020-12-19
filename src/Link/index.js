import React from 'react';
import T from 'prop-types';
import { svg, select } from 'd3';

import './style.css';

export default class Link extends React.PureComponent {
  state = {
    initialStyle: {
      opacity: 0,
    },
  };

  componentDidMount() {
    this.applyOpacity(1, this.props.transitionDuration);
  }

  componentWillLeave(done) {
    this.applyOpacity(0, this.props.transitionDuration, done);
  }

  applyOpacity(opacity, transitionDuration, done = () => {}) {
    if (transitionDuration === 0) {
      select(this.link).style('opacity', opacity);
      done();
    } else {
      select(this.link)
        .transition()
        .duration(transitionDuration)
        .style('opacity', opacity)
        .each('end', done);
    }
  }

  drawStepPath(linkData, orientation) {
    const { source, target } = linkData;
    const deltaY = target.y - source.y;

    return orientation === 'horizontal'
      ? `M${source.y},${source.x} H${source.y + deltaY / 2} V${target.x} H${target.y}`
      : `M${source.x},${source.y} V${source.y + deltaY / 2} H${target.x} V${target.y}`;
  }

  drawDiagonalPath(linkData, orientation) {
    const diagonal = svg
      .diagonal()
      .projection(d => (orientation === 'horizontal' ? [d.y, d.x] : [d.x, d.y]));
    return diagonal(linkData);
  }

  drawStraightPath(linkData, orientation) {
    const straight = svg
      .line()
      .interpolate('basis')
      .x(d => d.x)
      .y(d => d.y);

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

  drawElbowPath(d, orientation) {
    return orientation === 'horizontal'
      ? `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`
      : `M${d.source.x},${d.source.y}V${d.target.y}H${d.target.x}`;
  }

  drawPath() {
    const { linkData, orientation, pathFunc } = this.props;

    if (typeof pathFunc === 'function') {
      return pathFunc(linkData, orientation);
    }

    if (pathFunc === 'elbow') {
      return this.drawElbowPath(linkData, orientation);
    }

    if (pathFunc === 'straight') {
      return this.drawStraightPath(linkData, orientation);
    }

    if (pathFunc === 'step') {
      return this.drawStepPath(linkData, orientation);
    }

    return this.drawDiagonalPath(linkData, orientation);
  }

  getClassNames() {
    const { linkData, orientation, pathClassFunc } = this.props;
    const classNames = ['linkBase'];

    if (typeof pathClassFunc === 'function') {
      classNames.push(pathClassFunc(linkData, orientation));
    }

    return classNames.join(' ');
  }

  handleOnClick = evt => {
    this.props.onClick(this.props.linkData.source, this.props.linkData.target, evt);
  };

  handleOnMouseOver = evt => {
    this.props.onMouseOver(this.props.linkData.source, this.props.linkData.target, evt);
  };

  handleOnMouseOut = evt => {
    this.props.onMouseOut(this.props.linkData.source, this.props.linkData.target, evt);
  };

  render() {
    const { styles } = this.props;
    return (
      <path
        ref={l => {
          this.link = l;
        }}
        style={{ ...this.state.initialStyle, ...styles }}
        className={this.getClassNames()}
        d={this.drawPath()}
        onClick={this.handleOnClick}
        onMouseOver={this.handleOnMouseOver}
        onMouseOut={this.handleOnMouseOut}
        data-source-id={this.props.linkData.source.id}
        data-target-id={this.props.linkData.target.id}
      />
    );
  }
}

Link.defaultProps = {
  styles: {},
  pathClassFunc: undefined,
};

Link.propTypes = {
  linkData: T.object.isRequired,
  orientation: T.oneOf(['horizontal', 'vertical']).isRequired,
  pathClassFunc: T.func,
  pathFunc: T.oneOfType([T.oneOf(['diagonal', 'elbow', 'straight', 'step']), T.func]).isRequired,
  transitionDuration: T.number.isRequired,
  onClick: T.func.isRequired,
  onMouseOver: T.func.isRequired,
  onMouseOut: T.func.isRequired,
  styles: T.object,
};
