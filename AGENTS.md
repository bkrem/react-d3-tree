# AGENTS.md

This file provides guidance to AI coding agents working with this repository.

## Repository purpose

`react-d3-tree` is a React component that renders hierarchical data (org charts, family trees, file directories) as an interactive SVG tree graph, built on D3's `tree` layout from `d3-hierarchy`. It ships to npm as a library consumed by other React apps. The `demo/` directory holds a Create React App playground deployed to GitHub Pages.

## Backwards compatibility

This library is published to npm, so anything a consuming app relies on is a contract. Keep minor and patch releases backwards compatible — a developer bumping within the same major version must not have their build, types, or app break. Introduce a breaking change only when the task is explicitly about one, and land it in a major version.

Beyond obvious source-level API changes, a change is breaking if it affects any of these:

- Public API: renaming, removing, or changing the behavior of the `src/index.ts` exports (`Tree`, its props, its defaults, or the exported types).
- Peer dependencies: narrowing the supported `react`/`react-dom` range (18.x–19.x) or adding a new required peer dependency.
- Build output: changing which files the `exports` map or the `main` and `types` fields resolve to for a consumer that works today, adding or dropping a module format, or raising the compile target (`ES2020`) so runtimes or bundlers that work today stop working. Restructuring `exports` is fine when every existing consumer keeps resolving the same runtime file and equivalent types; `pnpm check:package` and the consumer type-checks in `pnpm test:smoke` are the evidence.
- Shipped types: raising the minimum TypeScript version the `.d.ts` files need, or changing emitted types so existing consumer code stops type-checking.

When a change might break consumers, don't assume either way. Research and validate it: build the package before and after and compare the output, run the smoke test and any package checks the repo has, and test the specific consumer setup the change could affect (module format, resolution mode, TypeScript version). Record what you verified and what stays unverified. If the evidence still leaves a judgement call, for example a fix that changes what some consumers see, give the maintainer the evidence and let them decide; don't classify the change as breaking or safe on an untested assumption.

## Architecture

The library source lives in `src/`. Everything else supports building, testing, docs, or the demo.

- `src/index.ts` — public API entry point. Exports `Tree` (default and named) and re-exports the public types.
- `src/Tree/index.tsx` — the `Tree` component, a function component. The internal tree is a memo over `data` (node-by-node copies with ids filled in, plus lookups by id; caller data is never mutated). The collapsed set of node ids is the only tree state: the caller's `collapsed` prop when given, otherwise the tree's own, seeded from `initialDepth` and kept across `data` updates for the ids that survive. The layout is a memo over the tree, the set, and the layout props. Zoom and pan bind `d3-zoom` to the `svg` in an effect; d3 owns the `g` transform after mount and the live transform lives in a ref, never in React state. The bound zoom behaviour sits in a ref, and every programmatic transform (`centerNode`, `setTransform`, centering on click) goes through it, so it updates d3's viewport, the `g` attribute, and the callbacks in one path. `Tree` is a `forwardRef` component whose `TreeHandle` (`src/Tree/types.ts`) exposes those methods plus the collapse-state ones. Callbacks and d3 handlers read the latest props and state through a ref that an effect keeps current.
- `src/Tree/types.ts` — `Tree` prop and callback types.
- `src/Node/index.tsx` — renders a single node as a memoised function component; `src/Node/DefaultNodeElement.tsx` is the default node renderer used when no custom renderer is supplied.
- `src/Link/index.tsx` — renders the path between two nodes as a memoised function component; supports the built-in `pathFunc` variants and a caller-supplied function.
- `src/types/common.ts` — shared data types (`RawNodeDatum`, `TreeNodeDatum`, `Point`, event handler types).
- `src/warn.ts` — a development-only, once-per-message `console.warn`, used for duplicate node ids. Node ids come from `RawNodeDatum.id` or, when absent, from the node's path in the tree (`"0"`, `"0.0"`, `"0.1"`).
- `src/globalCss.ts` — injected base styles.

The build is ESM only: one `tsc` pass (`module: NodeNext`, `target: ES2020`) emits the JavaScript and the declarations side by side under `lib/`. The `package.json` `exports` map has a single `.` entry with `types` before `default`; `main` and `types` point at the same files for resolvers that ignore `exports`, and `sideEffects` is `false`. A CommonJS consumer loads the package through Node's `require(esm)`, so `require()` needs Node 22.12 or later; the smoke test covers both entry styles.

## Tech stack

- pnpm 12 as the package manager, pinned through `packageManager` in `package.json`. Development needs Node 22.22.2 or later, or 24.15 or later: the highest `engines.node` floor among the dev dependencies (`jsdom`). pnpm doesn't enforce engine ranges by default, so an older Node installs with no error but runs tooling outside its supported range. When a dev dependency raises its floor, update this line, `engines.node` in `package.json`, and the README. The `demo/` app is a separate npm project.
- The scripts under `scripts/` are TypeScript that Node runs directly through type stripping, on by default since Node 22.18.0 and 23.6.0. On an older Node, `pnpm build`, `pnpm check:package`, and `pnpm test:smoke` fail with a syntax error; `.nvmrc` names the CI major. `tsconfig.scripts.json` type-checks them under `erasableSyntaxOnly`, which rejects the syntax type stripping can't handle (enums, namespaces, parameter properties). The smoke-test consumers in `scripts/smoke/` stay JavaScript on purpose: they load the package the way a plain JavaScript app does.
- TypeScript 6.0 (source), compiled with `tsc`, pinned to `~6.0` because TypeDoc 0.28 supports 6.0.x only; TypeScript 7 waits for TypeDoc. TypeScript 6 makes `strict` the default and no longer infers `rootDir`, so `tsconfig.json` sets both explicitly (`strict: true`, `rootDir: ./src`); the source, tests, and scripts all type-check under `strict`. The extending configs set `rootDir: .` because they include files outside `src/`.
- React 18–19 (peer dependency). Dev and test dependencies use React 19; CI also runs the whole sequence against React 18.
- D3 modules: `d3-hierarchy`, `d3-selection`, `d3-transition`, `d3-zoom`, all 3.x with matching `@types/d3-*` packages. `d3-transition` is imported for its side effect (it adds `transition()` to selections); the diagonal link path is a local Bézier, not `d3-shape`.
- Other runtime dependencies: `clone`.
- Vitest with jsdom and `@testing-library/react`.
- oxlint for linting and oxfmt for formatting.
- TypeDoc for API documentation.

## Commands

Run these from the repo root.

```bash
# Install dependencies
pnpm install

# Build the library (cleans lib/, then emits ESM and type declarations)
pnpm build

# Rebuild on change (used for local development)
pnpm build:watch

# Run the test suite with coverage
pnpm test

# Watch tests
pnpm test:watch

# Load the packed tarball as a consumer through `require()` and `import` (needs a prior build)
pnpm test:smoke

# Check package.json and the type entry points with publint and attw (needs a prior build)
pnpm check:package

# Lint src/, scripts/, and test/
pnpm lint

# Type-check the tests, fixtures, and source through tsconfig.test.json
pnpm typecheck

# Generate API docs into demo/public/docs
pnpm build:docs
```

`pnpm fmt` formats the repo with oxfmt and `pnpm fmt:check` reports unformatted files; CI runs the check.

## Dependencies

pnpm settings live in `pnpm-workspace.yaml`:

- `minimumReleaseAge: 4320` (minutes) blocks versions published less than 3 days ago. An install fails when the lockfile holds a younger version, so add or update dependencies only to versions past that age.
- `allowBuilds` lists every dependency that has an install script, with `true` to run it or `false` to deny it. pnpm fails the install when a dependency with an install script is missing from the list.
- `overrides` pins transitive versions. pnpm ignores an `overrides` field in `package.json`.

When a `@types/d3-*` package is added or bumped, run `pnpm dedupe` and check `pnpm why @types/d3-selection` reports one version: the `@types/d3-*` packages depend on each other through `*` ranges, which pnpm satisfies with whatever version the lockfile already holds, and two copies of `@types/d3-selection` split the `Selection` interface so the `d3-transition` augmentation lands on the wrong one.

pnpm links only declared dependencies into `node_modules`. Declare every imported package, and every `@types/*` package the build needs, in `package.json`. The tsconfigs set `types: []` and an explicit `lib`, so the build doesn't pick up ambient types from packages that happen to be installed.

## Testing

- The test runner is Vitest (`vitest.config.ts`) with the `jsdom` environment. Tests import `describe`, `it`, `expect`, and `vi` from `vitest`; there are no test globals. Components render through `@testing-library/react`, and tests assert on the DOM and on the public callbacks, never on component internals. Test setup lives in `test/setup.ts`, which registers Testing Library's cleanup and polyfills the SVG animated properties (`transform`, `width`, `height`) that d3 reads and jsdom lacks.
- Tests are TypeScript: `.test.tsx` when the file contains JSX, `.test.ts` otherwise. Both build tsconfigs and `typedoc.json` exclude `*.test.ts`, `*.test.tsx`, and `tests/` folders, so nothing test-related lands in `lib/`. `pnpm typecheck` type-checks the tests, fixtures, and source through `tsconfig.test.json`; CI runs it. Type every `vi.fn()` (`vi.fn<TreeNodeEventCallback>()`), which the lint config requires.
- Tests live in a `tests/` subfolder (for example `src/Tree/tests/index.test.tsx`) or next to the module (`src/generateId.test.ts`). Shared fixtures live in `src/Tree/tests/mockData.ts`; the render and DOM query helpers in `src/Tree/tests/helpers.tsx`. `src/Tree/tests/behavior.test.tsx` holds the public behaviour contracts: a change to the library keeps them passing or updates them with the reason stated in the commit. `src/Tree/tests/oracle.test.tsx` snapshots the mounted markup of a fixture and prop matrix with the random ids masked (`src/Tree/tests/__snapshots__/`); a snapshot changes only when the rendered markup changes on purpose, and the commit that runs `pnpm exec vitest run -u` says why.
- `pnpm test` runs with `--coverage` (v8) and enforces thresholds: statements 90, branches 84, functions 90, lines 88. Coverage counts library source only (`src/**/*.{ts,tsx}` minus tests and fixtures). Additions that drop coverage below these thresholds fail the run, so add tests alongside new code. Vitest fails the run on an uncaught exception during a test, so a jsdom gap shows up as an error, not as a silently passing test.
- Tests import `src/` and never load `lib/`. `pnpm test:smoke` (`scripts/smoke-test.ts`) covers the published package: it packs the build with npm, the way the publish workflow does, installs the tarball plus React into a temporary npm project, renders a tree through `import` and through `require()` with the consumers in `scripts/smoke/`, runs a Jest test in ESM mode (`node --experimental-vm-modules`, the documented way for Jest to load an ESM-only package), and type-checks a CommonJS consumer under `nodenext` and an ES module consumer under `node16`. On Node versions that can't `require()` ES modules, it skips the `require()` check, because the package is ESM-only. It also asserts that the tarball holds only `lib/`, `package.json`, `README.md`, and `LICENSE`.
- `pnpm check:package` (`scripts/check-package.ts`) runs publint and attw (Are the types wrong?) against the build. Every finding fails CI. To accept one deliberately, add it to the script's allowlist pinned to its location, with the reason; the same finding at another location still fails.

## Code style and conventions

- In-repo imports use explicit `.js` extensions even from `.ts`/`.tsx` files (for example `import Node from '../Node/index.js'`). This keeps the emitted ESM valid. `tsc` resolves a `./x.js` import to `./x.ts` or `./x.tsx` without extra config, and Vite does the same during testing. Don't add `baseUrl` or a `paths` mapping to the tsconfigs: under pnpm's symlinked `node_modules` they make `tsc` emit a broken `import("node_modules/@types/…")` specifier into `lib/types`. Keep the `.js` extension on every relative import; omitting it produces ESM output whose imports fail to resolve at runtime in native ESM consumers.
- oxfmt settings (`.oxfmtrc.json`): 100-character line width, single quotes, ES5 trailing commas, two-space indent, `arrowParens: avoid`. Markdown, `package.json`, `pnpm-lock.yaml`, `demo/`, and build output are excluded. The reformat commit is listed in `.git-blame-ignore-revs`; run `git config blame.ignoreRevsFile .git-blame-ignore-revs` to hide it from `git blame`.
- oxlint (`.oxlintrc.json`) lints `src/`, `scripts/`, and `test/`, TypeScript included. The `correctness` category is an error; the `react`, `jsx-a11y`, `import`, `typescript`, and `vitest` plugins are on. `pnpm lint` runs in CI and must exit 0; warnings are allowed. Don't change library behavior to satisfy a lint rule: downgrade or disable the rule instead. The React hooks rules (`react-hooks/exhaustive-deps`, `react/refs`) are errors; effects and memos list primitive dependencies, and refs are read and written in effects and handlers, not during render.
- oxlint reads ignore files from parent directories. In a worktree nested inside a checkout that still has an `.eslintignore` with `*.ts`, a directory walk skips every TypeScript file; pass `--ignore-path <empty file>` or name the files explicitly to lint them.
- Source and tests are TypeScript; keep new components and modules in `.ts`/`.tsx` and their tests in `.test.ts`/`.test.tsx` (see Testing).
- JSX compiles through the automatic runtime (`jsx: react-jsx`), so a file imports `React` only when it uses the `React` namespace (for example `React.Component` or `React.ReactNode`).
- The pre-commit hook (`.husky/pre-commit`, configured in `.lintstagedrc.json`) runs oxlint, oxfmt, and `vitest related --run` on staged files under `src/`, oxlint and oxfmt on staged files under `scripts/` and `test/`, and oxfmt on staged JSON and YAML files. The JSON and YAML task passes `--no-error-on-unmatched-pattern`: `package.json` and `pnpm-lock.yaml` are on oxfmt's ignore list, and a commit that stages only those two would otherwise fail the hook with "Expected at least one target file". The `prepare` script runs `husky`, which points git's `core.hooksPath` at `.husky/_`. That setting is per repository, so it applies to every worktree of the clone. `npm pack` also runs `prepare`; set `HUSKY=0` to stop husky from changing the git config.

## Development workflow

To develop the library against the demo playground, symlink the local build into the demo (the demo otherwise depends on the published package):

```bash
# In the repo root
pnpm install
npm link

# In demo/ (an npm project)
cd demo
npm i
npm link react-d3-tree
```

For hot reloading, run `pnpm build:watch` in the repo root and `npm start` in `demo/` in a second terminal. To develop against your own app instead of the demo, run `npm link react-d3-tree` in that app's root.

CI (`.github/workflows/build.yml`) runs on every push and pull request against Node 22 and 24, each with React 18 and React 19, with `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm fmt:check`, `pnpm build`, `pnpm check:package`, `pnpm test`, and `pnpm test:smoke`. The React 18 legs swap the dev copy of React and its types after the frozen install, and the smoke test's consumer follows the `REACT_MAJOR` environment variable. Match that sequence locally before pushing.

Feature work lands through pull requests against `master`.

## Releases

Publishing a GitHub release runs `.github/workflows/publish.yml`, which stages the version on npm through trusted publishing (OIDC, no token). The maintainer approves the staged version with 2FA before it goes live. To cut, verify, or follow up on a release, follow `.agents/skills/npm-release/SKILL.md`.

## Agent skills

Repo-local skills live in `.agents/skills/`, one directory per skill with a `SKILL.md`. `.claude/skills` is a symlink to that directory, so add and edit skills under `.agents/skills/` only.
