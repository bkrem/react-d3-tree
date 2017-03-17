import React from "react"
import { Route, IndexRoute } from "react-router"

import App from "./App"
import PlaygroundPage from "../../pages/playground/page"


export default (
  <Route path="/" component={App}>
    <IndexRoute component={PlaygroundPage} />
  </Route>
)
