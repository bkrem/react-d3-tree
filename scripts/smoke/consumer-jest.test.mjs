// Run by Jest in ESM mode (`node --experimental-vm-modules jest`), which loads the ESM-only
// package natively. Jest's default CommonJS transform can't load it without extra config.
import React from 'react';
import server from 'react-dom/server';
import Tree from 'react-d3-tree';

test('renders a tree through Jest in ESM mode', () => {
  const html = server.renderToString(
    React.createElement(Tree, { data: { name: 'root', children: [{ name: 'leaf' }] } })
  );

  expect(html).toContain('rd3t-svg');
  expect(html.match(/class="rd3t-(leaf-)?node/g)).toHaveLength(2);
});
