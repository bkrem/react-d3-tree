import React, { PropTypes } from "react"

import styles from "./style.css"

export default class Node extends React.Component {

  static defaultProps = {
    primaryLabelStyle: {fill: "#000"},
    secondaryLabelsStyle: {fill: "#000"},
    circleRadius: 10,
    circleStyle: {
      stroke: "#000",
      strokeWidth: 3,
      fill: "grey"
    },
  }

  static propTypes = {
    nodeData: PropTypes.object.isRequired,
    orientation: PropTypes.oneOf(["horizontal", "vertical"]).isRequired,
    primaryLabel: PropTypes.string,
    primaryLabelStyle: PropTypes.object,
    secondaryLabels: PropTypes.object,
    secondaryLabelsStyle: PropTypes.object,
    textAnchor: PropTypes.string,
    circleRadius: PropTypes.number,
    circleStyle: PropTypes.object,
  }

  render() {
    const {nodeData} = this.props
    return (
      <g className={styles.node} transform={`translate(${nodeData.y},${nodeData.x})`}>
        <text
          className={styles.primaryLabelBase}
          textAnchor={this.props.textAnchor}
          style={{fill: this.props.primaryLabelColor}}
          x="10"
          y="-10"
          dy=".35em"
        >
          {this.props.primaryLabel}
        </text>

        <circle r={this.props.circleRadius} style={this.props.circleStyle} />

        <text
          className={styles.secondaryLabelsBase}
          y="0"
          textAnchor={this.props.textAnchor}
          style={this.props.secondaryLabelsStyle}
        >
          {Object.keys(this.props.secondaryLabels).map((labelKey, i) =>
            <tspan x="10" dy="1.2em" key={labelKey + i}>
              {labelKey}: {this.props.secondaryLabels[labelKey]}
            </tspan>
          )}
        </text>
      </g>
    )
  }
}