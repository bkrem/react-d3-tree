import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss'
import cleanup from 'rollup-plugin-cleanup';
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/react-d3-tree.js',
    format: 'umd',
    name: 'ReactD3Tree',
    exports: 'named',
    globals: {
      "react": "React",
      "prop-types": "PropTypes",
      'd3': 'd3',
      'clone': 'clone',
      'deep-equal': 'deepEqual',
      'uuid': 'uuid',
      'react-transition-group': 'reactTransitionGroup',
    },
  },
  plugins: [
    autoExternal(),
    resolve(),
    postcss({
      plugins: [],
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/d3/d3.js': ['layout', 'svg', 'select', 'behavior', 'event', 'csv', 'json'],
      },
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    cleanup({
      comments: [/#/], // Don't strip Babel optimization annotations, e.g. `/*#__PURE__*/`
    }),
  ],
}
