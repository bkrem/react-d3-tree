import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';

export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/index.esm.js',
      format: 'esm',
    },
  ],
  plugins: [
    commonjs(),
    resolve(),
    esbuild({
      tsconfig: './tsconfig.esm.json',
      loaders: {
        '.json': 'json',
      },
    }),
  ],
};
