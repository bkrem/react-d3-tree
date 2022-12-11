import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';

export default {
  input: './src/index.ts',
  output: [
    {
      dir: './dist/esm',
      format: 'esm',
      exports: 'named',
      sourcemap: true,
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
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
