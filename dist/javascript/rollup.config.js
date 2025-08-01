import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  // Main build - JavaScript output
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: 'dist/index.esm.js',
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        exclude: ['**/*.test.ts', '**/*.spec.ts'],
      }),
    ],
    external: [
      // Exclude all WASM-related files
      /\.wasm$/,
      /wasm\/.*$/,
      '../wasm/fastgeotoolkit.js',
      '../wasm/fastgeotoolkit_bg.wasm',
      '../wasm/fastgeotoolkit_bg.js',
      // Pattern matching for dynamic imports
      (id) => id.includes('wasm/') || id.endsWith('.wasm')
    ],
  },
  // Type declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
