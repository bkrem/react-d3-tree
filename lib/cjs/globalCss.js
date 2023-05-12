"use strict";
// Importing CSS files globally (e.g. `import "./styles.css"`) can cause resolution issues with certain
// libraries/frameworks.
// Example: Next.js (https://github.com/vercel/next.js/blob/master/errors/css-npm.md)
//
// Since rd3t's CSS is bare bones to begin with, we provide all required styles as a template string,
// which can be imported like any other TS/JS module and inlined into a `<style></style>` tag.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = "\n/* Tree */\n.rd3t-tree-container {\n  width: 100%;\n  height: 100%;\n}\n\n.rd3t-grabbable {\n  cursor: move; /* fallback if grab cursor is unsupported */\n  cursor: grab;\n  cursor: -moz-grab;\n  cursor: -webkit-grab;\n}\n.rd3t-grabbable:active {\n    cursor: grabbing;\n    cursor: -moz-grabbing;\n    cursor: -webkit-grabbing;\n}\n\n/* Node */\n.rd3t-node {\n  cursor: pointer;\n  fill: #777;\n  stroke: #000;\n  stroke-width: 2;\n}\n\n.rd3t-leaf-node {\n  cursor: pointer;\n  fill: transparent;\n  stroke: #000;\n  stroke-width: 1;\n}\n\n.rd3t-label__title {\n  fill: #000;\n  stroke: none;\n  font-weight: bolder;\n}\n\n.rd3t-label__attributes {\n  fill: #777;\n  stroke: none;\n  font-weight: bolder;\n  font-size: smaller;\n}\n\n/* Link */\n.rd3t-link {\n  fill: none;\n  stroke: #000;\n}\n";
