import React, { PropTypes } from "react"

import styles from "./style.css"

export default class Node extends React.Component {

  static defaultProps = {
    primaryLabelColor: "#000",
    secondaryLabelsColor: "#000",
  }

  static propTypes = {
    primaryLabel: PropTypes.string,
    primaryLabelColor: PropTypes.string,
    secondaryLabels: PropTypes.object,
    secondaryLabelsColor: PropTypes.string,
    textAnchor: PropTypes.string,
  }

  render() {
    return (
      <g className={styles.node} transform="translate(0,0)">
        <text
          className={styles.primaryLabel}
          textAnchor={this.props.textAnchor}
          style={{fill: this.props.primaryLabelColor}}
          x="10"
          y="-10"
          dy=".35em"
        >
          {this.props.primaryLabel}
        </text>

        <circle r="10" style={{stroke: "rgb(0, 0, 0)", strokeWidth: 3, fill: "grey"}}></circle>

        <text
          className={styles.secondaryLabels}
          y="0"
          textAnchor={this.props.textAnchor}
          style={{fill: this.props.secondaryLabelsColor}}
        >
          {Object.keys(this.props.secondaryLabels).map(labelKey =>
            <tspan x="10" dy="1.2em">
              {labelKey}: {this.props.secondaryLabels[labelKey]}
            </tspan>
          )}
        </text>
      </g>
    )
  }
}