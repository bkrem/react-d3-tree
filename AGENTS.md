# AGENTS.md

This file provides guidance to AI coding agents working with this repository.

## Repository purpose

`react-d3-tree` is a React component that renders hierarchical data (org charts, family trees, file directories) as an interactive SVG tree graph, built on D3's `tree` layout from `d3-hierarchy`. It ships to npm as a library consumed by other React apps. The `demo/` directory holds a Create React App playground deployed to GitHub Pages.

## Architecture

The library source lives in `src/`. Everything else supports building, testing, docs, or the demo.

- `src/index.ts` — public API entry point. Exports `Tree` (default and named) and re-exports the public types.
- `src/Tree/index.tsx` — the `Tree` component, a class component that owns layout state, zoom, pan, and collapse/expand. Computes the layout with `d3-hierarchy` and wires zoom with `d3-zoom`/`d3-selection`.
- `src/Tree/TransitionGroupWrapper.tsx` — animation wrapper around `@bkrem/react-transition-group`.
- `src/Tree/types.ts` — `Tree` prop and callback types.
- `src/Node/index.tsx` — renders a single node; `src/Node/DefaultNodeElement.tsx` is the default node renderer used when no custom renderer is supplied.
- `src/Link/index.tsx` — renders the path between two nodes; supports the built-in `pathFunc` variants and a caller-supplied function.
- `src/types/common.ts` — shared data types (`RawNodeDatum`, `TreeNodeDatum`, `Point`, event handler types).
- `src/globalCss.ts` — injected base styles.

The build emits three artifacts under `lib/`: CommonJS (`lib/cjs`), ES modules (`lib/esm`), and type declarations (`lib/types`). The `package.json` `exports` map points consumers at the matching entry.

## Tech stack

- TypeScript (source), compiled with `tsc`.
- React 16–19 (peer dependency). Dev and test dependencies pin React 16 for the enzyme adapter.
- D3 modules: `d3-hierarchy`, `d3-selection`, `d3-shape`, `d3-zoom`.
- Other runtime dependencies: `@bkrem/react-transition-group`, `clone`, `dequal`, `uuid`.
- Jest with `ts-jest` and `babel-jest`, enzyme with `enzyme-adapter-react-16`.
- ESLint (airbnb config) and Prettier.
- TypeDoc for API documentation.

## Commands

Run these from the repo root.

```bash
# Install dependencies
npm i

# Build the library (cleans lib/, then emits CJS + type declarations, then ESM)
npm run build

# Build CJS + declarations only / ESM only
npm run build:cjs
npm run build:esm

# Rebuild ESM on change (used for local development)
npm run build:watch

# Run the test suite with coverage
npm test

# Watch tests
npm run test:watch

# Lint (see the note under Code style — this covers .js files only)
npm run lint

# Generate API docs into demo/public/docs
npm run build:docs
```

There's no separate format script. Prettier runs through the pre-commit hook and can be run directly (`npx prettier --write <path>`).

## Testing

- The test runner is Jest, configured in `jest.config.json` with the `ts-jest` preset and the `jsdom` environment. Test setup lives in `jest/setup.ts`, which configures enzyme with `enzyme-adapter-react-16`.
- TypeScript source is transformed by `ts-jest`; test files are written in `.js` and transformed by `babel-jest`.
- Two test placements coexist: a `tests/` subfolder (for example `src/Tree/tests/index.test.js`) and colocated tests (`src/Node/index.test.js`). Shared fixtures live in `src/Tree/tests/mockData.js`.
- CSS imports are mapped to `jest/mocks/cssModule.js`. The `moduleNameMapper` also strips the `.js` suffix from relative imports so they resolve against the `.ts`/`.tsx` source (see Code style).
- `npm test` runs with `--coverage` and enforces thresholds: statements 90, branches 84, functions 90, lines 88. Additions that drop coverage below these thresholds fail the run, so add tests alongside new code.

## Code style and conventions

- In-repo imports use explicit `.js` extensions even from `.ts`/`.tsx` files (for example `import Node from '../Node/index.js'`). This keeps the emitted ESM valid. The `tsconfig` `paths` mapping (`"*.js": ["*"]`) and the Jest `moduleNameMapper` exist to resolve these during type-checking and testing. Keep the `.js` extension on every relative import; omitting it produces ESM output whose imports fail to resolve at runtime in native ESM consumers.
- Prettier settings (`.prettierrc`): 100-character line width, single quotes, ES5 trailing commas, two-space indent, `arrowParens: avoid`.
- ESLint (`.eslintrc.js`) extends `airbnb` plus `prettier`. The `lint` script targets `src/**/*.js`, which matches the test files and `mockData.js` — the TypeScript source is not covered by `npm run lint`. Prettier formatting (and, for `.js` files, ESLint) runs through the pre-commit hook.
- Source is TypeScript; keep new components and modules in `.ts`/`.tsx` and write their tests as `.js`.
- The pre-commit hook (`husky` + `lint-staged`) runs Prettier and `jest --findRelatedTests` on staged `.ts`/`.tsx` files, and additionally ESLint on staged `.js` files.

## Development workflow

To develop the library against the demo playground, symlink the local build into the demo (the demo otherwise depends on the published package):

```bash
# In the repo root
npm i
npm link

# In demo/
cd demo
npm i
npm link react-d3-tree
```

For hot reloading, run `npm run build:watch` in the repo root and `npm start` in `demo/` in a second terminal. To develop against your own app instead of the demo, run `npm link react-d3-tree` in that app's root.

CI (`.github/workflows/build.yml`) runs on every push and pull request against Node 20.x with `npm ci`, `npm run build`, and `npm test`. Match that sequence locally before pushing.

Feature work lands through pull requests against `master`.
