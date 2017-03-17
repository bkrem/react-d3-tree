import React from "react"
import * as d3 from "d3"

import styles from "./style.css"

export default class Link extends React.Component {

  diagonalPath() {
    d3.svg.diagonal().projection(d => {
      return [d.y, d.x]
    })
  }

  render() {
    return (
      <path className={styles.linkBase} d={"M0,0C0,71.9140625 -671.837109375,71.9140625 -671.837109375,143.828125"}></path>
    )
  }
}