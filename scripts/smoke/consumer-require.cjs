const assert = require('node:assert');
const React = require('react');
const { renderToString } = require('react-dom/server');
const Tree = require('react-d3-tree').default;

const html = renderToString(
  React.createElement(Tree, { data: { name: 'root', children: [{ name: 'leaf' }] } })
);

assert.ok(html.includes('rd3t-svg'), 'rendered markup contains the tree SVG');
assert.strictEqual((html.match(/class="rd3t-(leaf-)?node/g) || []).length, 2, 'renders two nodes');
console.log('require("react-d3-tree"): ok');
