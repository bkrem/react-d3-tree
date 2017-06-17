`Tree` (component)
==================



Props
-----

### `collapsible`

type: `bool`
defaultValue: `true`


### `data` (required)

type: `array`


### `depthFactor`

type: `number`
defaultValue: `undefined`


### `initialDepth`

type: `number`
defaultValue: `undefined`


### `orientation`

type: `enum('horizontal'|'vertical')`
defaultValue: `'horizontal'`


### `pathFunc`

type: `enum('diagonal'|'elbow')`
defaultValue: `'diagonal'`


### `scaleExtent`

type: `shape[object Object]`
defaultValue: `{ min: 0.1, max: 1 }`


### `styles`

type: `shape[object Object]`
defaultValue: `{
  nodes: {
    node: {
      circle: {},
      name: {},
      attributes: {},
    },
    leafNode: {
      circle: {},
      name: {},
      attributes: {},
    },
  },
  links: {},
}`


### `transitionDuration`

type: `number`
defaultValue: `500`


### `translate`

type: `shape[object Object]`
defaultValue: `{ x: 0, y: 0 }`


### `zoomable`

type: `bool`
defaultValue: `true`

