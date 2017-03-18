import React from "react"
import * as d3 from "d3"

import styles from "./style.css"

export default class Link extends React.Component {

  diagonalPath(linkData, orientation) {
    const diagonal = d3.svg.diagonal().projection(d =>
      orientation === "horizontal" ? [d.y, d.x] : [d.x, d.y]
    )
    return diagonal(linkData)
  }

  elbowPath(d, orientation) {
    return orientation === "horizontal" ?
      `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}` :
      `M${d.source.x},${d.source.y}V${d.target.y}H${d.target.x}`
  }

  render() {
    const {linkData, orientation} = this.props
    return (
      <path
        className={styles.linkBase}
        d={this.diagonalPath(linkData, orientation)}
      />
    )
  }
}