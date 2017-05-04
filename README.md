# React D3 Tree

## Options
| Property      | Type            | Options               | Required? | Default      | Description                                                                                                                                     |
|---------------|-----------------|-----------------------|-----------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `data`        | `object`        |                       | required  | `undefined`  | Hierarchical object, contains (at least) `name`, `parent` and `children` keys.                                                                  |
| `orientation` | `string` (enum) | `horizontal` `vertical` |           | `horizontal` | `horizontal` - Tree expands left-to-right, `vertical` - Tree expands top-to-bottom                                                              |
| `pathFunc`    | `string` (enum) | `diagonal` `elbow`      |           | `diagonal`   | `diagonal` - Renders smooth, curved paths between parent-child nodes, `elbow` - Renders sharp curves at right angles between parent-child nodes |