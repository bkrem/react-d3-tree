import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Tree from 'react-d3-tree';

const html = renderToString(
  React.createElement(Tree, { data: { name: 'root', children: [{ name: 'leaf' }] } })
);

assert.ok(html.includes('rd3t-svg'), 'rendered markup contains the tree SVG');
assert.strictEqual((html.match(/class="rd3t-(leaf-)?node/g) || []).length, 2, 'renders two nodes');
console.log('import "react-d3-tree": ok');
