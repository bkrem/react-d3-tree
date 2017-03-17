import React from "react"
import * as d3 from "d3"

import styles from "./style.css"

export default class Link extends React.Component {

  diagonalPath(linkData) {
    const diagonal = d3.svg.diagonal().projection(d => [d.y, d.x])
    return diagonal(linkData)
  }

  elbowPath(d) {
    return "M" + d.source.y + "," + d.source.x +
				"V" + d.target.x + "H" + d.target.y
  }

  render() {
    return (
      <path className={styles.linkBase} d={this.diagonalPath(this.props.linkData)}></path>
    )
  }
}