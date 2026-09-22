# AGENTS.md

This file provides guidance to AI coding agents working with this repository.

## Repository purpose

`react-d3-tree` is a React component that renders hierarchical data (org charts, family trees, file directories) as an interactive SVG tree graph, built on D3's `tree` layout from `d3-hierarchy`. It ships to npm as a library consumed by other React apps. The `demo/` directory holds a Create React App playground deployed to GitHub Pages.

## Backwards compatibility

This library is published to npm, so anything a consuming app relies on is a contract. Keep minor and patch releases backwards compatible — a developer bumping within the same major version must not have their build, types, or app break. Introduce a breaking change only when the task is explicitly about one, and land it in a major version.

Beyond obvious source-level API changes, a change is breaking if it affects any of these:

- Public API: renaming, removing, or changing the behavior of the `src/index.ts` exports (`Tree`, its props, its defaults, or the exported types).
- Peer dependencies: narrowing the supported `react`/`react-dom` range (16.x–19.x) or adding a new required peer dependency.
- Build output: changing which files the `exports` map or the `main`, `module`, and `types` fields resolve to for a consumer that works today, dropping a module format, or raising the compile target (CJS `es5`, ESM `es6`) so runtimes or bundlers that work today stop working. Restructuring `exports` is fine when every existing consumer keeps resolving the same runtime file and equivalent types; `pnpm check:package` and the consumer type-checks in `pnpm test:smoke` are the evidence.
- Shipped types: raising the minimum TypeScript version the `.d.ts` files need, or changing emitted types so existing consumer code stops type-checking.

When a change might break consumers, don't assume either way. Research and validate it: build the package before and after and compare the output, run the smoke test and any package checks the repo has, and test the specific consumer setup the change could affect (module format, resolution mode, TypeScript version). Record what you verified and what stays unverified. If the evidence still leaves a judgement call, for example a fix that changes what some consumers see, give the maintainer the evidence and let them decide; don't classify the change as breaking or safe on an untested assumption.

## Architecture

The library source lives in `src/`. Everything else supports building, testing, docs, or the demo.

- `src/index.ts` — public API entry point. Exports `Tree` (default and named) and re-exports the public types.
- `src/Tree/index.tsx` — the `Tree` component, a class component that owns layout state, zoom, pan, and collapse/expand. Computes the layout with `d3-hierarchy` and wires zoom with `d3-zoom`/`d3-selection`.
- `src/Tree/TransitionGroupWrapper.tsx` — animation wrapper around `@bkrem/react-transition-group`.
- `src/Tree/types.ts` — `Tree` prop and callback types.
- `src/Node/index.tsx` — renders a single node; `src/Node/DefaultNodeElement.tsx` is the default node renderer used when no custom renderer is supplied.
- `src/Link/index.tsx` — renders the path between two nodes; supports the built-in `pathFunc` variants and a caller-supplied function.
- `src/types/common.ts` — shared data types (`RawNodeDatum`, `TreeNodeDatum`, `Point`, event handler types).
- `src/generateId.ts` — generates the v4 UUIDs that `Tree` uses for its SVG and group class references and for node IDs. Not part of the public API.
- `src/globalCss.ts` — injected base styles.

The build emits four artifacts under `lib/`: CommonJS (`lib/cjs`), ES modules (`lib/esm`), type declarations (`lib/types`), and a copy of the declarations for CommonJS consumers (`lib/types-cjs`). Because the root `package.json` sets `"type": "module"`, `scripts/mark-cjs.js` writes a `package.json` with `"type": "commonjs"` into `lib/cjs` and `lib/types-cjs`; without the second marker TypeScript reads the declarations as ESM and rejects them from a CommonJS file under `node16` resolution. The `package.json` `exports` map lists `types` before `default` under both the `import` and the `require` condition.

## Tech stack

- pnpm 12 as the package manager, pinned through `packageManager` in `package.json`. Development needs Node 22.22.2 or later, or 24.15 or later: the highest `engines.node` floor among the dev dependencies (`jsdom`). pnpm doesn't enforce engine ranges by default, so an older Node installs with no error but runs tooling outside its supported range. When a dev dependency raises its floor, update this line and the README. The `demo/` app is a separate npm project.
- TypeScript 5.9 (source), compiled with `tsc`. Keep the `~5.9` range: TypeScript 6 deprecates `target: es5` and TypeScript 7 removes it, and the CJS build must keep that target within v3.
- React 16–19 (peer dependency). Dev and test dependencies pin React 16 for the enzyme adapter.
- D3 modules: `d3-hierarchy`, `d3-selection`, `d3-shape`, `d3-zoom`.
- Other runtime dependencies: `@bkrem/react-transition-group`, `clone`, `dequal`.
- Vitest with jsdom, enzyme with `enzyme-adapter-react-16`.
- oxlint for linting and oxfmt for formatting.
- TypeDoc for API documentation.

## Commands

Run these from the repo root.

```bash
# Install dependencies
pnpm install

# Build the library (cleans lib/, then emits CJS + type declarations, then ESM)
pnpm build

# Build CJS + declarations only / ESM only
pnpm build:cjs
pnpm build:esm

# Rebuild ESM on change (used for local development)
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

# Generate API docs into demo/public/docs
pnpm build:docs
```

`pnpm fmt` formats the repo with oxfmt and `pnpm fmt:check` reports unformatted files; CI runs the check.

## Dependencies

pnpm settings live in `pnpm-workspace.yaml`:

- `minimumReleaseAge: 4320` (minutes) blocks versions published less than 3 days ago. An install fails when the lockfile holds a younger version, so add or update dependencies only to versions past that age.
- `allowBuilds` lists every dependency that has an install script, with `true` to run it or `false` to deny it. pnpm fails the install when a dependency with an install script is missing from the list.
- `overrides` pins transitive versions. pnpm ignores an `overrides` field in `package.json`.

pnpm links only declared dependencies into `node_modules`. Declare every imported package, and every `@types/*` package the build needs, in `package.json`. The tsconfigs set `types: []` and an explicit `lib`, so the build doesn't pick up ambient types from packages that happen to be installed.

## Testing

- The test runner is Vitest (`vitest.config.ts`) with the `jsdom` environment and `globals: true`, so `describe`, `it`, `expect`, and `vi` need no imports. Test setup lives in `test/setup.ts`, which configures enzyme with `enzyme-adapter-react-16` and polyfills the SVG animated properties (`transform`, `width`, `height`) that d3 reads and jsdom lacks.
- Vite parses JSX by file extension, so a test that contains JSX takes the `.test.jsx` extension; a test without JSX keeps `.test.js`. Both tsconfigs and `typedoc.json` exclude `*.test.jsx`; without that, `allowJs` would compile a test into `lib/`.
- Two test placements coexist: a `tests/` subfolder (for example `src/Tree/tests/index.test.jsx`) and colocated tests (`src/Node/index.test.jsx`). Shared fixtures live in `src/Tree/tests/mockData.js`.
- `pnpm test` runs with `--coverage` (v8) and enforces thresholds: statements 90, branches 84, functions 90, lines 88. Coverage counts library source only (`src/**/*.{ts,tsx}` minus tests and fixtures). Additions that drop coverage below these thresholds fail the run, so add tests alongside new code. Vitest fails the run on an uncaught exception during a test, so a jsdom gap shows up as an error, not as a silently passing test.
- Tests import `src/` and never load `lib/`. `pnpm test:smoke` (`scripts/smoke-test.js`) covers the published package: it packs the build with npm, the way the publish workflow does, installs the tarball plus React into a temporary npm project, and renders a tree through both `exports` entry points with the consumers in `scripts/smoke/`. On Node versions that can't `require()` ES modules, it skips the `require()` check, because the d3 dependencies are ESM-only. It also asserts that the tarball holds only `lib/`, `package.json`, `README.md`, and `LICENSE`.
- `pnpm check:package` (`scripts/check-package.js`) runs publint and attw (Are the types wrong?) against the build. Every finding fails CI. To accept one deliberately, add it to the script's allowlist pinned to its location, with the reason; the same finding at another location still fails.

## Code style and conventions

- In-repo imports use explicit `.js` extensions even from `.ts`/`.tsx` files (for example `import Node from '../Node/index.js'`). This keeps the emitted ESM valid. `tsc` resolves a `./x.js` import to `./x.ts` or `./x.tsx` without extra config, and Vite does the same during testing. Don't add `baseUrl` or a `paths` mapping to the tsconfigs: under pnpm's symlinked `node_modules` they make `tsc` emit a broken `import("node_modules/@types/…")` specifier into `lib/types`. Keep the `.js` extension on every relative import; omitting it produces ESM output whose imports fail to resolve at runtime in native ESM consumers.
- oxfmt settings (`.oxfmtrc.json`): 100-character line width, single quotes, ES5 trailing commas, two-space indent, `arrowParens: avoid`. Markdown, `package.json`, `pnpm-lock.yaml`, `demo/`, and build output are excluded. The reformat commit is listed in `.git-blame-ignore-revs`; run `git config blame.ignoreRevsFile .git-blame-ignore-revs` to hide it from `git blame`.
- oxlint (`.oxlintrc.json`) lints `src/`, `scripts/`, and `test/`, TypeScript included. The `correctness` category is an error; the `react`, `jsx-a11y`, `import`, `typescript`, and `vitest` plugins are on. `pnpm lint` runs in CI and must exit 0; warnings are allowed. Don't change library behavior to satisfy a lint rule: downgrade or disable the rule instead. The React class-component rules (`no-did-mount-set-state`, `no-did-update-set-state`, `no-direct-mutation-state`) are warnings because `Tree` and `Node` use those patterns.
- oxlint reads ignore files from parent directories. In a worktree nested inside a checkout that still has an `.eslintignore` with `*.ts`, a directory walk skips every TypeScript file; pass `--ignore-path <empty file>` or name the files explicitly to lint them.
- Source is TypeScript; keep new components and modules in `.ts`/`.tsx` and write their tests as `.js` or `.test.jsx` (see Testing).
- The pre-commit hook (`.husky/pre-commit`, configured in `.lintstagedrc.json`) runs oxlint, oxfmt, and `vitest related --run` on staged files under `src/`, oxlint and oxfmt on staged files under `scripts/` and `test/`, and oxfmt on staged JSON and YAML files. The `prepare` script runs `husky`, which points git's `core.hooksPath` at `.husky/_`. That setting is per repository, so it applies to every worktree of the clone. `npm pack` also runs `prepare`; set `HUSKY=0` to stop husky from changing the git config.

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

CI (`.github/workflows/build.yml`) runs on every push and pull request against Node 22 and 24 with `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm fmt:check`, `pnpm build`, `pnpm check:package`, `pnpm test`, and `pnpm test:smoke`. Match that sequence locally before pushing.

Feature work lands through pull requests against `master`.

## Releases

Publishing a GitHub release runs `.github/workflows/publish.yml`, which stages the version on npm through trusted publishing (OIDC, no token). The maintainer approves the staged version with 2FA before it goes live. To cut, verify, or follow up on a release, follow `.agents/skills/npm-release/SKILL.md`.

## Agent skills

Repo-local skills live in `.agents/skills/`, one directory per skill with a `SKILL.md`. `.claude/skills` is a symlink to that directory, so add and edit skills under `.agents/skills/` only.
