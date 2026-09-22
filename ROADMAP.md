# react-d3-tree v4 roadmap

Status: draft for maintainer review, written 2026-09-22 against `master` at `905437b` (3.7.0-rc.0).
"Decided" items were settled by the maintainer on 2026-09-22. "Proposed" items are defaults that
the phase which implements them confirms or changes.

## Contents

- [Goals](#goals)
- [Decisions](#decisions)
- [Where the code stands today](#where-the-code-stands-today)
- [Phases](#phases)
- [The v4 API](#the-v4-api)
- [v3 to v4 parity table](#v3-to-v4-parity-table)
- [Consumer impact matrix](#consumer-impact-matrix)
- [Dependencies before and after](#dependencies-before-and-after)
- [Risks and open questions](#risks-and-open-questions)
- [Out of scope](#out-of-scope)

## Goals

v4 is the next major line of the library. It has five goals:

1. Ship ESM only. Remove the CommonJS build and every workaround it needs, and simplify the
   toolchain to match.
2. Move to function components and hooks without losing any feature v3 offers. Where parity would
   mean bending the design out of shape, say so and decide deliberately. One such gap exists
   (see [Transitions](#transitions)).
3. Remove dependencies that are unused, replaceable, or only exist to serve v3 internals.
4. Finish the move to TypeScript. Tests, fixtures, and repo scripts become `.ts` and `.tsx`, and
   `allowJs` goes. The only JavaScript left is the smoke-test consumers, which exist to load the
   package from plain JavaScript.
5. Simplify and extend the public API: stable node identity, controlled collapse state, and an
   imperative handle for the actions the issue tracker keeps asking for.
6. Later in 4.x, bring animations back as a supported feature with an implementation that scales
   to large trees.

## Decisions

| Topic | Decision | Status |
| --- | --- | --- |
| React peer range | `react` and `react-dom` at `^18.0.0 \|\| ^19.0.0`. Unlocks `useId`, automatic batching, and the automatic JSX runtime. React 16 and 17 users stay on v3. | Decided |
| `enableLegacyTransitions` | Removed in 4.0 together with `transitionDuration` and the `@bkrem/react-transition-group` fork. Animations return in a 4.x minor as a new opt-in prop. `centeringTransitionDuration` is unrelated and stays. | Decided |
| API scope | Full redesign: stable ids, controlled and uncontrolled collapse state, a ref handle, richer custom-node props. `__rd3t`, `dataKey`, and `addChildren` leave the public API. | Decided |
| v3 support | A `v3` branch takes security and critical fixes for 6 months from the 4.0.0 release date. The end date goes in the 4.0.0 release notes and the README. | Decided |
| Node identity | `RawNodeDatum` gains an optional `id`. Nodes without one get a deterministic id from their path in the tree. | Decided |
| `data` shape | A single root: `data: RawNodeDatum`. The array form goes. | Decided |
| Callback arguments | Handlers receive the live layout node. No cloning, so the `clone` dependency goes. | Decided |
| Centering | The tree measures its container with `ResizeObserver`. The `dimensions` prop goes. | Decided |
| Click-to-center | A `centerOnClick` prop, default `false`, replaces the implicit switch that `dimensions` was. `centerNode(id)` on the handle covers every other trigger. | Decided |
| `addChildren` | Removed from the custom-node renderer props. Consumers update `data`; collapse state keyed by id survives the update. | Decided |
| `onUpdate` | Replaced by `onTransformChange` (per zoom or pan tick) and `onCollapsedChange` (per toggle). | Decided |
| TypeScript everywhere | Tests, fixtures, and repo scripts move to TypeScript; `allowJs` is removed. The smoke-test consumers (`consumer-import.mjs`, `consumer-require.cjs`, `consumer-jest.test.mjs`) stay JavaScript because their job is to load the package the way a plain JavaScript app does. | Decided |
| Test type-checking | `tsconfig.test.json` extends the build config with `noEmit` and covers `src/**/*.test.ts(x)`, fixtures, and `test/`. A `pnpm typecheck` script runs it and CI runs the script. Tests import `describe`, `it`, `expect`, and `vi` from `vitest` instead of relying on `globals: true`. | Proposed |
| Script runtime | Repo scripts run as `.ts` through Node's built-in type stripping (on by default since Node 22.18.0 and 23.6.0, warning-free since 22.18.0 and 24.3.0). `tsconfig.scripts.json` type-checks them under `erasableSyntaxOnly`, which rejects the syntax type stripping can't handle. | Proposed |
| Module output | `lib/` holds one ESM build plus declarations. `exports` lists `types` then `default`; `main` and `types` point at the same files for resolvers that ignore `exports`; `sideEffects: false`. | Proposed |
| Compile settings | `target: ES2020`, `module: NodeNext`, `jsx: react-jsx`. One `tsconfig.json` for the library build; `tsconfig.test.json` and `tsconfig.scripts.json` extend it with `noEmit`. `strict: true` lands in Phase 4, after the hooks rewrite, so the Phase 2 `lib/` diff shows only the module-format change. | Proposed |
| TypeScript version | `~6.0` from Phase 2.3 on, pinned by TypeDoc 0.28's peer range; TypeScript 7 when TypeDoc supports it. | Decided |
| Entry points | Keep both `export default Tree` and `export { Tree }`. | Proposed |
| Prereleases | `4.0.0-next.N` on the `next` dist-tag. `publish.yml` already derives the tag from the version. | Proposed |
| Branching | Integration branch `feat/v4`, cut from `master` at `905437b` on 2026-09-23. Work lands on it in PR-sized commits, one per row of the phase tables, so any row can be split into its own PR on request. One final PR takes it to `master` at 4.0.0, after the `v3` branch is cut. | Decided |

## Where the code stands today

Everything in this section was checked in the worktree on 2026-09-22 unless marked unverified.

### Build and packaging

- Two `tsc` passes emit `lib/cjs` (`target: es5`, `module: commonjs`) and `lib/esm` (`target: es6`).
  `scripts/mark-cjs.js` then writes a `{"type":"commonjs"}` marker into `lib/cjs` and copies the
  declarations to `lib/types-cjs` with a second marker. The `exports` map has an `import` and a
  `require` condition, each with `types` before `default`.
- The CJS entry is only half a CJS artifact. `lib/cjs/Tree/index.js` contains
  `require("d3-selection")` and `require("d3-zoom")`, and both packages ship `"type": "module"`
  with no CommonJS entry. That `require()` works only on a Node version that can load ES modules
  through `require()`. `scripts/smoke-test.js` already skips its `require()` consumer on other
  versions for exactly this reason. Removing the CJS build removes an artifact that works in the
  same environments the ESM artifact works in, not a broader one.
- `build:docs` runs `rimraf ./docs` before TypeDoc, but TypeDoc writes to `demo/public/docs`.
  The `rimraf ./docs` step is stale, and it deletes any root `docs/` folder. This file lives at the
  repo root for that reason.
- TypeScript is pinned at `~5.9` because TypeScript 6 deprecates `target: es5` and 7 removes it.
  TypeScript 7.0.2 is the current release on npm. Dropping the CJS build removes the only reason
  for the pin.

### Transitions

`enableLegacyTransitions` is the one feature a hooks rewrite can't carry over:

- `Node` and `Link` implement `componentWillLeave`, a hook that only `TransitionGroup` from
  `@bkrem/react-transition-group` calls, and only on class instances.
- The fork calls `findDOMNode` in `CSSTransitionGroupChild.js`. `react-dom` 19 removed
  `findDOMNode`, so the flag already fails under React 19.
- With the flag on, every toggle locks node clicks for `transitionDuration + 10` ms and every
  node runs a d3 transition on its own `<g>`. Issue 506 reports the browser freezing on a large
  tree with the flag on; issue 528 reports freezing at about 10,000 nodes with it off.

Two earlier attempts to modernise this exist as `wip` commits on `origin/upgrade-transition-group`
(react-transition-group 4 plus a context-based animation registry). Neither landed.

### Identity, state, and cloning

- `Tree.assignInternalProperties` clones `props.data` and stamps every node with a random UUID in
  `__rd3t.id` on every data change. The `svg` and `g` elements get random instance classes
  (`rd3t-svg-<uuid>`) that `bindZoomListener` and `centerNode` look up with `d3.select`.
  Random ids make server and client markup differ (see [Server rendering](#server-rendering)).
- Collapse state lives inside the cloned data (`__rd3t.collapsed`). Any new `data` reference
  resets it unless `dataKey` stays the same. Issues 512, 507, 442, 402, 390, and 366 all ask for
  collapse state that survives data updates or can be set from outside.
- Every click, mouseover, and mouseout handler calls `clone()` on the `HierarchyPointNode`. The
  clone follows `parent` and `children` links, so each event walks the whole tree. Each toggle
  also clones the full `state.data`.
- `bindZoomListener` assigns to `this.state.d3` directly inside the d3 zoom handler (the code
  carries a `TODO` about it). The `feat/demo-vite` branch already learnt the same lesson on the
  demo side: keep drag and zoom ticks out of React state.

### Server rendering

- `renderToString` of a four-node tree through `lib/esm` (run here on React 16.14) emits every
  node `<g>` and link `<path>` with `style="opacity:0"`, and every node at its parent's
  coordinates (`translate(0,0)` for the root's children). `Node` and `Link` only apply the real
  transform and opacity in `componentDidMount` through `d3.select`. A server-rendered tree is
  invisible until the client mounts, and the random ids make the hydrated markup differ from the
  server markup on top of that. Unverified: that a Next.js app logs a hydration warning for the
  ids; it follows from how React hydrates but wasn't reproduced here.

### Types

- Neither tsconfig sets `strict`. Five `@ts-ignore` comments remain: three on `.transition()`
  calls, because `d3-transition` isn't declared and its types aren't installed, and two on the
  `d3-zoom` `.transform` calls.
- `RenderCustomNodeElementFn` returns the global `JSX.Element`. `@types/react` 19.3.0 declares
  `JSX` only inside the `React` namespace, with no `declare global` block (checked in the tarball).
  A React 19 consumer that types a custom node function against this type gets an error today.
- `TreeNodeEventCallback`, `TreeLinkEventCallback`, and `onUpdate` return `any`.
- `@types/d3-hierarchy` is a runtime dependency because `HierarchyPointNode` appears in the
  public types. It is at 1.x against a 1.x runtime; `d3-selection` and `d3-zoom` run 3.x against
  1.x type packages.

### Tests

- Vitest 5 with jsdom, enzyme 3, and `enzyme-adapter-react-16`, which pins the dev copy of React
  to 16. Across the suite: 48 `mount(`, 40 `shallow(`, 17 `.instance()`, 9 `.setState(`, and
  5 `.setProps(` calls. The `.instance()` and `.setState()` calls reach into class internals
  and can't survive a hooks rewrite.
- `pnpm test` passes on `905437b` with 98.95% statements, 94.24% branches, 98.73% functions,
  and 99.29% lines against thresholds of 90, 84, 90, and 88.
- Branch `test/v4-behavior-contracts` (one commit, `fffd25f`, CI green on 2026-09-22, no PR)
  adds `src/Tree/tests/behavior.test.jsx`: 36 test cases that drive the public behaviour through
  the DOM. They cover data replacement and `dataKey`, `initialDepth` on new data, no mutation of
  caller-owned data, collapse and expand, neighbour collapse, the class-name props, orientation,
  `nodeSize`, `separation`, `depthFactor`, default labels, unique node ids with links that
  reference them, every `pathFunc`, custom path and class functions, custom node renderers,
  cloned callback data, link hover callbacks, `onUpdate`, wheel zoom with `scaleExtent`,
  `zoomable`, `hasInteractiveNodes` with Shift, `zoom` and `translate` prop updates, isolation
  between instances, listener removal on unmount, and `draggable`. The harness is `react-dom`'s
  `render` and `unmountComponentAtNode` with `act` from `react-dom/test-utils`; no enzyme.
  `feat/v4` merged the branch at `e82c474`; the full suite is then 131 tests and passes with
  coverage.
- `render` and `unmountComponentAtNode` don't exist in react-dom 19.3.0 (checked against the
  package), so that harness has to change when the dev React moves to 19. Testing Library's
  `render` is the replacement (PR 1.1).
- The branch also fixes four v3 bugs, each pinned by one of its tests: links now carry
  `data-source-id` and `data-target-id` (on `master` both attributes are missing, because the
  code read `HierarchyPointNode.id`, which only `d3.stratify` sets; the `renderToString` run
  under [Server rendering](#server-rendering) shows paths without them); the zoom listeners are
  removed on unmount; `addChildren` works on a node without a `children` array; and
  `depthFactor: 0` is honoured, as the prop docs promise. These fixes belong in a 3.7.x release
  as well as in v4.
- Contracts that pin v3 behaviour v4 changes on purpose, with the PR that rewrites each: the two
  `dataKey` tests and the `addChildren` test (PR 5.2); the node `id` attribute test (PR 5.1);
  the cloned-callback-data test, the two `onUpdate` tests, and the six zoom cases that assert
  through `onUpdate` (PR 5.5). Every other contract passes unchanged through Phases 2 to 5.
- jsdom 30 doesn't implement `ResizeObserver` (no match in `node_modules/jsdom/lib`). The test
  setup needs a stub once Phase 5 lands.

### JavaScript inventory

`git ls-files` on `master` lists 11 JavaScript files outside `demo/`; `feat/v4` has a twelfth,
`src/Tree/tests/behavior.test.jsx`, from the contracts branch:

- Tests and fixtures: `src/generateId.test.js`, `src/Node/index.test.jsx`,
  `src/Link/tests/index.test.jsx`, `src/Tree/tests/index.test.jsx`,
  `src/Tree/tests/TransitionGroupWrapper.test.jsx`, `src/Tree/tests/behavior.test.jsx` (which
  imports `'../../index.ts'` with a `.ts` specifier that a NodeNext type-check rejects; the
  TypeScript version uses the `.js` convention), `src/Tree/tests/mockData.js`. The
  convention in `AGENTS.md` asks for tests in JavaScript, and both tsconfigs carry `allowJs` plus
  `exclude` entries for `*.test.js` and `*.test.jsx` so the build doesn't compile them into `lib/`.
- Scripts: `scripts/check-package.js`, `scripts/mark-cjs.js`, `scripts/smoke-test.js`.
- Smoke consumers: `scripts/smoke/consumer-import.mjs`, `scripts/smoke/consumer-require.cjs`.

`demo/` holds 12 more, all Create React App files that `feat/demo-vite` deletes; that branch has
no JavaScript under `demo/`.

Node runs `.ts` files directly through type stripping. Per the Node documentation, it is on by
default from 22.18.0 and 23.6.0, prints no experimental warning from 22.18.0 and 24.3.0, and is
stable from 24.12.0 and 25.2.0. The repo's documented floor (22.22.2 or 24.15) is above all of
those. Checked here: Node 24.16.0 and 24.9.0 run a `.ts` file unflagged; Node 22.13.1, the
version on this machine's `PATH`, fails with a syntax error unless `--experimental-strip-types`
is passed. TypeScript 5.9.3 has the `erasableSyntaxOnly` flag that rejects the syntax type
stripping can't handle (enums, namespaces, parameter properties).

### Demo and usage

- `demo/` is a Create React App project pinned to the published 3.6.7. Branch `feat/demo-vite`
  (six commits, no PR yet) replaces it with Vite 8, React 19, and TypeScript, adds `demo` to the
  pnpm workspace with a `workspace:*` dependency on the library, and deploys through GitHub
  Actions Pages. It is the natural v4 test bed and lands first.
- Downloads for the week ending 2026-09-21: 174,018 total, of which 147,637 were 3.6.6. The v1
  and v2 lines still total about 6,000 a week. The `next` dist-tag points at 3.3.3.
- Open issues cluster into: collapse-state control (above), imperative actions (332 programmatic
  zoom, 360 fit to view, 460 expand or collapse all, 484 and 493 center a node from outside, 45
  toggle depth remotely), centering without `dimensions` (476, 484, 493, 494), large-tree
  performance (22, 506, 528), and input gestures (453 trackpad pan and pinch, 356).

## Phases

The phases run in this order. Phases 1 and 2 touch different files and can run in parallel.
Every PR is small enough to review in one sitting, targets `feat/v4`, and passes the full CI
sequence (`lint`, `fmt:check`, `build`, `check:package`, `test`, `test:smoke`).

### Phase 0: groundwork

Goal: a place to land v4 work, a test bed, and a support story for v3.

| PR | Branch | Work |
| --- | --- | --- |
| 0.1 | `feat/demo-vite` (exists) | Open and land the demo rebuild on `master`. |
| 0.2 | `chore/v3-deprecations` | Optional. A final 3.x minor logs a one-time development-only warning for each feature 4.0 removes: `enableLegacyTransitions`, `dimensions`, the `data` array form, `dataKey`, `addChildren`. Gives consumers a migration signal before 4.0. |
| 0.3 | `chore/release-v4-branch` | Cut `feat/v4` from `master`. Add a README line that v4 work is in progress and where to follow it. |
| 0.4 | `docs/v3-support-policy` | README and release-notes text: v3 takes security and critical fixes for 6 months from the 4.0.0 release date. The `v3` branch itself is cut at the last 3.x release before 4.0.0 merges. |
| 0.5 | `test/v4-behavior-contracts` (exists) | Open and land on `master` as part of a 3.7.x release: 36 behaviour contracts plus the four bug fixes listed under Tests. `feat/v4` already carries the branch through merge commit `e82c474`, so the later merge of `master` into `feat/v4` changes nothing for these files. |

Exit: `master` has the Vite demo and the contracts, `feat/v4` holds this roadmap and the
contracts, and the demo builds against the local library through the workspace.

### Phase 1: behaviour test suite

Status (2026-09-23): 1.1 and the 1.3 gap tests landed on `feat/v4` in one commit (`test: move
the suite to Testing Library and TypeScript`); 80 tests, coverage 100/98.98/100/100. `lib/`
JavaScript is byte-identical to the baseline; the declarations changed because `@types/react` 18
emits `React.JSX.Element` where 16 emitted the global `JSX.Element`. `@testing-library/user-event`
wasn't needed: the contracts dispatch raw wheel and mouse events with coordinates, which
`user-event` doesn't model. 1.2 landed next (`test: add a mounted-DOM render oracle`): 15
snapshot cases in `oracle.test.tsx`. Phase 1 is complete.

Goal: a test suite that describes v3 behaviour from the outside, so every later phase has an
oracle that doesn't depend on class internals. This mirrors the `lib/` byte-level oracle that
gated the build-chain work. The contracts branch already does this for 36 cases; Phase 1 keeps
them, moves them onto a harness that survives React 19, and covers the rest.

| PR | Branch | Work |
| --- | --- | --- |
| 1.1 | `test/rtl-migration` | Replace enzyme and the React 16 adapter with `@testing-library/react` 16 and `@testing-library/dom` 10. Bump the dev copy of React to 18.3.1 (Testing Library 16 needs 18 or 19). The 36 contracts in `behavior.test.jsx` are the base: swap their `react-dom` harness for Testing Library's `render`, keep every assertion, and port what only the enzyme suites cover (`centerNode` through `dimensions`, `onUpdate` on zoom, `persist` on events, `addChildren` with an unknown id, the `enableLegacyTransitions` toggle lock, Node and Link rendering details, `generateId`) as DOM-level tests in the same style. Then delete the enzyme suites. Keep the coverage thresholds. Drop the `cheerio` override in `pnpm-workspace.yaml`; it exists only for enzyme. Tests that exercise `enableLegacyTransitions` stay until Phase 4 removes the flag. Every rewritten test is TypeScript: `*.test.ts` without JSX, `*.test.tsx` with it, and `mockData.ts` typed as `RawNodeDatum`. Tests import from `vitest` explicitly and `globals: true` goes. Add `tsconfig.test.json` (extends the build config, `noEmit`, includes `src/**/*.test.ts`, `src/**/*.test.tsx`, `src/**/tests/**`, `test/**`) and a `pnpm typecheck` script that CI runs after `lint`. Update the `exclude` lists in `tsconfig.json` and `typedoc.json`, the `include` pattern in `vitest.config.ts`, and the lint-staged globs to the new extensions. Remove `allowJs`. Untyped d3 or Testing Library edges surface here as type errors, not at runtime. |
| 1.2 | `test/render-oracle` | Add a rendered-markup oracle: mount each fixture (`mockData`, the org chart, `initialDepth` 0 and 1, each `pathFunc`, each `orientation`, `depthFactor`, `separation`) with Testing Library's `render`, let effects run, and snapshot `container.innerHTML` with random ids and instance classes masked. The oracle uses the mounted DOM, not `renderToString`: v3's server markup has every node and link at opacity 0 and at its parent's position until `componentDidMount` runs (see [Server rendering](#server-rendering)), which is v3 behaviour v4 fixes rather than preserves. Later phases update a snapshot only with a documented reason in the PR. |
| 1.3 | `test/zoom-gaps` | The contracts already cover wheel zoom, `zoomable`, `draggable`, `hasInteractiveNodes` with Shift, prop updates, instance isolation, and unmount. Fill the gaps: `scaleExtent.min` clamps zooming out, a `zoom` prop outside `scaleExtent` is clamped on mount, and a `scaleExtent` change rebinds. |

Exit: no enzyme in the repo, no JavaScript under `src/`, `pnpm typecheck` passes, coverage at or
above the thresholds, and the oracle snapshots checked in.

### Phase 2: ESM-only build

Status (2026-09-23): 2.1 landed on `feat/v4` (`build: emit an ESM-only package`), including the
smoke-test and package-check updates the new layout needs so the commit stays green. Against
the Phase 1 baseline, the JavaScript differs only by native object spread (the ES2020 target) and
the declarations are unchanged. 2.4 landed next (`build: compile JSX through the automatic
runtime`): `jsx: react-jsx` in the build, Vite's default runtime in tests, `build:docs` runs
`typedoc` alone (TypeDoc cleans its output directory itself), and the `.oxlintrc.json`
class-component rule downgrades wait for Phase 4. 2.5 landed after it (`build: run the repo
scripts as TypeScript`): `check-package.ts`, `smoke-test.ts`, and a `clean.ts` that replaces
`rimraf`; `tsconfig.scripts.json` under `erasableSyntaxOnly` joins `pnpm typecheck`;
`@types/node` is a dev dependency; `.nvmrc` and `engines.node` state the Node floor. The only
JavaScript left outside `demo/` is the smoke consumers. 2.3 landed after that (`build: move
to TypeScript 6`): TypeScript 6.0.3 with TypeDoc 0.28.20, `lib/` byte-identical to the 5.9
build; TypeScript 6 needed an explicit `rootDir` and an explicit `strict: false`. TypeScript 7
is blocked by TypeDoc's peer range (5.0.x to 6.0.x) and attw bundles its own compiler, so it
doesn't matter there. 2.2 landed last (`test: run a Jest consumer against the packed package`):
the smoke test installs Jest 30 and runs a test in ESM mode, which loads the package natively;
the smoke test takes about 23 seconds with it. Phase 2 is complete.

Goal: one build, one tsconfig, no CJS scaffolding.

| PR | Branch | Work |
| --- | --- | --- |
| 2.1 | `build/esm-only` | Delete `tsconfig.esm.json`, `scripts/mark-cjs.js`, and `lib/types-cjs`. One `tsconfig.json` with `target: ES2020`, `module: NodeNext`, `moduleResolution: NodeNext`, `jsx: react-jsx`, `declaration: true`, `outDir: lib`. `strict` stays off here so the `lib/` diff against the previous ESM output shows only the module-format change; it turns on in PR 4.3. `package.json`: `exports["."]` becomes `{ "types": "./lib/index.d.ts", "default": "./lib/index.js" }`, `main` and `types` point at the same files, `module` field removed, `sideEffects: false`. In `scripts/check-package.js`, allowlist attw's `CJSResolvesToESM at . (node16-cjs)` finding with the reason (the smoke test proves `require(esm)` works) and show the table with `--profile esm-only`; the JSON output ignores the profile, so the allowlist is the gate. |
| 2.2 | `test/smoke-esm-only` | The smoke test keeps both consumers. `consumer-import.mjs` is the main check. `consumer-require.cjs` now requires the ESM build and must pass on Node 22 and 24 in CI, which proves that CommonJS apps on a current Node keep working. The type-check consumers move from `node16` to `nodenext` for the CommonJS file and keep `node16` for the ES module file. Add a Jest consumer that renders the tree under Jest's default CommonJS transform, so the matrix row for Jest becomes evidence instead of a guess. |
| 2.3 | `chore/typescript-6` | Lift the `~5.9` cap. Try TypeScript 6 first; try 7 only if 6 passes. Validate with the build, `check:package`, the smoke test, and a diff of `lib/` against the 2.1 output. Unverified until run: TypeScript 7 is a new compiler and may change emitted declarations or reject config options. |
| 2.4 | `chore/toolchain-cleanup` | Remove the stale `rimraf ./docs` step. Update `AGENTS.md` (the Testing and Code style sections now say tests are `.test.ts` or `.test.tsx` and scripts are `.ts`), README, `.oxlintrc.json` (drop the class-component rule downgrades once Phase 4 lands; enable the hooks rules), `vitest.config.ts` (`jsx: automatic`), and the lint-staged config for the new file set. |
| 2.5 | `chore/scripts-typescript` | `scripts/check-package.js` and `scripts/smoke-test.js` become `.ts` (`mark-cjs.js` is already gone after 2.1). `package.json` scripts call `node scripts/<name>.ts`. Add `tsconfig.scripts.json` (extends the build config: `noEmit`, `module: NodeNext`, `types: ["node"]`, `erasableSyntaxOnly`) and add it to `pnpm typecheck`. Declare `@types/node` as a dev dependency; the library tsconfig keeps `types: []`, so the build stays unaffected. The two smoke consumers stay `.mjs` and `.cjs` with a comment saying why, and `scripts/smoke/consumer.ts` stays as the type-check consumer. Add a `.nvmrc` with the CI Node major and an `engines.node` range matching the documented floor, so a Node below 22.18 fails early instead of on a stripped-types syntax error. |

Exit: `lib/` contains one JavaScript tree plus declarations, `check:package` passes with empty
allowlists, the smoke test passes on Node 22 and 24, the consumer matrix below has evidence in
every row marked "Phase 2", and this command lists only the smoke consumers under `scripts/smoke/`:

```bash
git ls-files '*.js' '*.jsx' '*.mjs' '*.cjs'
```

### Phase 3: dependency pass

Status (2026-09-23): 3.3 landed first (`refactor: draw diagonal links without d3-shape`). A
comparison of `linkHorizontal` and `linkVertical` from `d3-shape` 1.3.7 against the local
formula over 28,561 coordinate pairs, including fractions and extreme magnitudes, found zero
mismatches, and `links.test.tsx` pins fractional-coordinate output for every `pathFunc` in both
orientations (the literals were run against `d3-shape` before the swap). `d3-shape` 3.x rounds
path coordinates to three decimals through `link.digits()`, so keeping it would have changed
output for non-integer layouts; the local formula keeps 1.3.7's exact strings. 3.1 landed next
(`chore(deps): move the d3 modules to 3.x and declare d3-transition`): `d3-hierarchy` 3.1.2
with types 3.1.7, `@types/d3-selection` 3.0.12, `@types/d3-zoom` 3.0.8, `d3-transition` 3.0.1
with types 3.0.9, typed selections and zoom events in place of the five `@ts-ignore` comments,
and the oracle snapshots unchanged. Gotcha recorded in `AGENTS.md`: the new `@types/d3-*`
packages resolved their `@types/d3-selection@*` range to the 1.4.3 left in the lockfile, which
split the `Selection` interface until `pnpm dedupe`. 3.2 (`dequal`) folds into 4.1.

Goal: every runtime dependency earns its place, and the types match the runtimes.

| PR | Branch | Work |
| --- | --- | --- |
| 3.1 | `chore/d3-v3` | Upgrade `d3-hierarchy` to 3.1.2 and `d3-shape` to 3.2.0 (both ESM-only, which the ESM-only build now permits). Align `@types/d3-hierarchy` (runtime dependency), `@types/d3-selection`, `@types/d3-shape`, `@types/d3-zoom` to 3.x. Declare `d3-transition` 3.0.1 and `@types/d3-transition`: `centerNode` calls `.transition()` through it today without declaring it, and the three `@ts-ignore` comments on those calls go away. |
| 3.2 | `chore/drop-dequal` | Remove `dequal`. The hooks rewrite compares primitives in effect dependency lists (`translate.x`, `translate.y`, `scaleExtent.min`, `scaleExtent.max`) instead of deep-comparing objects. This PR can fold into 4.1 if the ordering is easier. |
| 3.3 | `chore/drop-d3-shape` | Optional. `d3-shape` is used for two calls, `linkHorizontal` and `linkVertical`, that emit one cubic Bézier each. Replace them with a local function, gated by a test that compares its output with `d3-shape` for a grid of inputs before the dependency is removed. Skip this PR if the comparison shows any difference. |

`clone` goes in Phase 5 with the callback change. The `@bkrem/react-transition-group` fork goes in
Phase 4 with the flag.

Exit: zero `@ts-ignore` in `src/`, and the dependency table below matches `package.json`.

### Phase 4: hooks rewrite

Status (2026-09-23): the phase runs as five commits, legacy transitions first so the Tree
rewrite has one axis fewer. Commit 1 (`refactor: remove the legacy transitions`) landed:
`enableLegacyTransitions` and `transitionDuration` are gone from the props, together with
`TransitionGroupWrapper`, the `@bkrem/react-transition-group` dependency, `componentWillLeave`
on Node and Link, and the toggle lock; the four flag tests went with them; the oracle snapshots
are unchanged because the flag defaulted to off. Commit 2 (`refactor: rewrite Tree with hooks`)
landed: `Tree` is a function component; the internal tree is state derived from `data` and
`dataKey` with the v3 rule; the layout is a memo; zoom binds in an effect whose dependencies are
the primitive values of `translate`, `scaleExtent`, `zoom`, `zoomable`, and `draggable`, which
replaces `dequal`; the live transform lives in a ref; the random instance classes are gone and
refs replace the `d3.select` lookups. All 84 behaviour tests pass unchanged; the 15 oracle
snapshots changed only in the `svg` and `g` class strings. Two v3 quirks went with the class:
`initialDepth` now applies on the first render, so a server render with `initialDepth: 0`
emits one node where v3 emitted the whole tree, and `onUpdate` after a toggle reports the live
zoom instead of the prop values. `Tree.defaultProps` and the statics `assignInternalProperties`,
`collapseNode`, `expandNode`, and `calculateD3Geometry` are no longer reachable on the export.
Commit 3 (`refactor: rewrite Node and Link with hooks`) landed: both are memoised function
components that render their position and path as attributes, with no d3 writes after mount and
no inline opacity (the 15 snapshots changed only by that attribute); centering on click moved
into a Tree effect that runs after the layout for the click is in place; `server.test.tsx`
proves the server markup equals the mounted markup for three prop sets, which turns the
server-rendering matrix row into evidence; the default node label renders each attribute as one
string, which removes React's text-boundary comments from server output; the class-component
rule downgrades left `.oxlintrc.json`. No class components remain in `src/`.
Commit 4 (`refactor: turn on strict types`) landed: `strict: true` for the source, tests, and
scripts; `TreeNodeEventCallback`, `TreeLinkEventCallback`, and `onUpdate` return `void`;
`RenderCustomNodeElementFn` returns `ReactElement`; the components declare `ReactElement` return
types so the declarations don't reference `React.JSX`; a partial `scaleExtent` or `separation`
takes the default for a missing key; `@types/clone` is a dev dependency until Phase 5 removes
`clone`; the test query helpers throw instead of returning null. Commit 5 (`ci: test against
React 18 and 19`) landed: the peer range is `^18.0.0 || ^19.0.0`, the dev React is 19.3.0, and
CI runs the whole sequence for Node 22 and 24 with React 18 and React 19 (the React 18 legs swap
the dev copy after the frozen install; the smoke consumer follows `REACT_MAJOR`). Both legs were
run locally before the push. Phase 4 is complete.

Goal: the same v3 behaviour from function components, verified by the Phase 1 suite and oracle.
This phase keeps the v3 prop names. The API changes come in Phase 5, so each PR here has one
kind of change to review.

| PR | Branch | Work |
| --- | --- | --- |
| 4.1 | `refactor/tree-hooks` | `Tree` becomes a function component wrapped in `forwardRef` (React 18 needs it; React 19 accepts it). Layout moves into `useTreeLayout(data, options)`, a `useMemo` over `d3.hierarchy` and `d3.tree`. Zoom moves into `useZoom(svgRef, gRef, options)`: one effect binds the d3 zoom behaviour, writes the transform straight to the `g` element, and calls the change callback. The initial `g` transform is rendered as an attribute so server output is complete. Instance classes go; refs replace the `d3.select` lookups. `getDerivedStateFromProps` logic becomes memoised derivations. The contracts for listener removal on unmount and for isolation between instances pin the effect cleanup. |
| 4.2 | `refactor/node-link-hooks` | `Node` and `Link` become function components wrapped in `React.memo` with an explicit comparison that replaces the `subscriptions` object trick. Position and opacity are rendered as attributes, so server output shows the final layout instead of the invisible, parent-stacked markup v3 emits. `componentWillLeave` and the d3 transition branches go. `TransitionGroupWrapper` and the `@bkrem/react-transition-group` dependency go, with `enableLegacyTransitions` and `transitionDuration`. The Phase 1 tests for the flag are deleted in the same PR. The mounted-DOM oracle from PR 1.2 doesn't change; a `renderToString` comparison would, which is why the oracle isn't one. |
| 4.3 | `refactor/strict-types` | Turn on `strict: true` and fix what it surfaces. Callback return types become `void`. `RenderCustomNodeElementFn` returns `React.ReactElement`. Remove the remaining `any` on the d3 event handlers using the 3.x types from Phase 3. |
| 4.4 | `ci/react-matrix` | CI runs the test suite against React 18.3.1 and React 19.3.0. Two jobs, one install override each. Dev dependencies settle on React 19. |

Exit: no class components in `src/`, all Phase 1 tests pass unchanged except the deleted
transition tests, oracle snapshots unchanged, coverage at or above thresholds.

### Phase 5: public API

Status (2026-09-23): 5.1 landed (`feat: give nodes stable ids`): `RawNodeDatum.id`, path ids
(`"0"`, `"0.0"`, `"0.1"`) for nodes without one, a one-time development warning for duplicate
ids, `data-id` on node elements, React keys by id, single-root `data`, and `generateId.ts`
deleted. The 15 snapshots changed only in the ids. Two decisions taken while implementing: the
`svg` gets no `useId`-derived `id`, because nothing in the DOM contract references it and it
would put a React-generated token into every snapshot; and `dataKey` gets no replacement in
5.2, because with path ids a new dataset reuses the old ids, so the React answer is a `key`
remount (`<Tree key={datasetId} />`), which the migration guide will say. 5.2 landed
(`feat: own collapse state as a set of ids`): the internal tree is a memo over `data` (no deep
clone; caller data untouched), `__rd3t` is gone from `TreeNodeDatum` in favour of `id`, the
collapsed set is the only tree state with a controlled mode (`collapsed` + `onCollapsedChange`)
and an uncontrolled mode (seeded from `initialDepth`, kept across `data` updates for surviving
ids, `initialDepth` applied to new ids), `dataKey` and `addChildren` are gone, and `clone` no
longer runs on the toggle path. Snapshots unchanged. 5.3 landed (`feat: expose a ref handle`):
`Tree` is a `forwardRef` component exposing `TreeHandle` (`centerNode`, `toggleNode`,
`expandAll`, `collapseAll`, `expandToDepth`, `setTransform`, `getTransform`). Programmatic
transforms go through the bound zoom behaviour, so `centerNode` and `setTransform` update d3's
viewport, the `g` attribute, and the callbacks in one path; that also ends the v3 inconsistency
where the group was scaled by the live scale while d3's viewport got the `zoom` prop. A duration
of 0 applies at once, which the tests rely on. The handle's `toggleNode` isn't gated by
`collapsible`; user clicks are. 5.4 landed (`feat: measure the container instead of taking
dimensions`): the tree measures its container with `getBoundingClientRect` on mount and a
`ResizeObserver` afterwards, keeps the size in a ref, and centers from it; `dimensions` is gone
and `centerOnClick` (default off) gates centering on click; `test/setup.ts` stubs
`ResizeObserver` for jsdom and the centering tests mock `getBoundingClientRect`. 5.5 landed
(`feat: pass live nodes and split onUpdate`): callbacks receive the tree's own layout nodes, so
`clone` is no longer a dependency and the runtime dependencies are the four d3 modules plus
`@types/d3-hierarchy`; `onUpdate` is gone in favour of `onTransformChange` (every zoom, pan, and
programmatic transform; nothing on mount) and `onCollapsedChange`; `CustomNodeElementProps`
gains `id`, `depth`, `isRoot`, `isLeaf`, and `isCollapsed`; one leaf predicate (no children or
an empty array) serves the base class and the class-name props, where v3 gave a `children: []`
node the branch class name. The collapsed set only ever holds nodes with children: `initialDepth`,
subtree collapse, and the handle skip leaves, and a click on a leaf reports nothing (v3 marked
leaves collapsed too, which would have made `isCollapsed` true on a leaf). Snapshots unchanged.
Phase 5 is complete; the v4 API in this document is what `feat/v4` implements.

Goal: the API described in [The v4 API](#the-v4-api), one concern per PR.

| PR | Branch | Work |
| --- | --- | --- |
| 5.1 | `feat/stable-ids` | `RawNodeDatum.id?: string`. `useTreeLayout` builds an internal `TreeNodeDatum` tree once per `data` change, assigning `id ?? <path id>`. Duplicate ids log a development-only warning. `generateId.ts` is deleted. The React `key` of every node and link moves from the array index to the node id, so `React.memo` from PR 4.2 holds across toggles and the 4.1 exit animations have stable keys. The DOM carries `data-id` on each node `<g>` and keeps `data-source-id` and `data-target-id` on links. The `data` prop becomes `RawNodeDatum`. Oracle snapshots change in this PR (ids become deterministic), which is the documented reason. The contract that reads the node `id` attribute reads `data-id` instead. |
| 5.2 | `feat/collapse-state` | Collapse state becomes a set of ids held in `useCollapsedState`. Uncontrolled: seeded from `initialDepth`, kept across `data` changes, applied to nodes the tree hasn't seen before. Controlled: the `collapsed` prop is the source of truth and every toggle calls `onCollapsedChange`. `shouldCollapseNeighborNodes` and `collapsible` work on the set. `dataKey` and `addChildren` are removed; the README shows the replacement (update `data`; collapse state keyed by id survives). The two `dataKey` contracts and the `addChildren` contract become contracts for collapse state surviving a `data` update and for children added through `data`. |
| 5.3 | `feat/tree-handle` | `useImperativeHandle` exposes `TreeHandle`: `centerNode`, `toggleNode`, `expandAll`, `collapseAll`, `expandToDepth`, `setTransform`, `getTransform`. In controlled mode the collapse methods compute the next set and call `onCollapsedChange` instead of setting state. |
| 5.4 | `feat/resize-observer` | `useContainerSize(containerRef)` measures the container. `centerNode` uses it. The `dimensions` prop is removed; a new `centerOnClick` prop (default `false`) decides whether a node click centers it. The test setup gains a `ResizeObserver` stub for jsdom. |
| 5.5 | `feat/callback-references` | Handlers receive the live `HierarchyPointNode`. `clone` is removed. `onUpdate` is replaced by `onTransformChange` and `onCollapsedChange`. `CustomNodeElementProps` gains `id`, `depth`, `isCollapsed`, `isLeaf`, and `isRoot`. The cloned-callback-data contract inverts to assert live references; the two `onUpdate` contracts and the six zoom cases that assert through `onUpdate` move to `onTransformChange` and `onCollapsedChange`. |

Exit: the parity table below is true, the demo exercises every new prop and every handle method,
and `src/index.ts` exports every public type named in the API section.

### Phase 6: docs and 4.0.0

| PR | Branch | Work |
| --- | --- | --- |
| 6.1 | `docs/v4-migration` | `MIGRATION.md` (v3 to v4) with one entry per row of the parity table, each with a before and after snippet. README rewritten for the v4 API and the React 18 floor. TypeDoc comments stop linking to `Tree.defaultProps.*` (a function component has no `defaultProps`) and use `@default` tags instead. `AGENTS.md` updated for the new build, tests, and the v3 branch. |
| 6.2 | release | `4.0.0-next.0` from `feat/v4` through the existing release skill; the `next` dist-tag replaces the stale 3.3.3. Test the prerelease in the demo and in a fresh Vite app and a fresh Next.js app. Iterate `next.N` as needed. |
| 6.3 | `chore/v3-branch` | Cut `v3` from `master` at the last 3.x release. Merge `feat/v4` into `master`. Release 4.0.0 with the release notes and the v3 end-of-support date. |

### 4.x backlog

Ordered by the demand on the issue tracker and by what each item needs from the ones before it.

1. **Animations (4.1).** Ship as `animation?: { duration: number; easing?: string } | false`,
   off by default. Build in two steps. First, animate position changes of nodes that stay mounted
   with a CSS `transition` on `transform` (styles set through `style`, not the attribute; check
   Safari on `<g>` elements). Second, animate enter and exit: keep the previous layout in a ref,
   render leaving nodes from a short-lived list until their transition ends, and start entering
   nodes at their parent's position. Measure every step against `demo/src/examples/hugeTree.js`
   (1,871 nodes) with a benchmark page in the demo before choosing between CSS transitions and
   `d3-transition` on refs. Interruptions (toggle during a transition) must not lock the tree the
   way `isTransitioning` does in v3.
2. **Large-tree rendering (4.x).** Only run the layout for expanded nodes (already true), then
   virtualise: skip rendering nodes outside the viewport using the current transform and the
   container size from Phase 5. Issue 22 (throttle to animation frames) belongs here.
3. **`fitToView()` on the handle (4.x).** Needs node bounding boxes; issue 360.
4. **Input gestures (4.x).** A `gestures` prop with presets: `classic` (wheel zooms, drag pans)
   and `trackpad` (two-finger scroll pans, pinch zooms, drag selects nothing). Issue 453.
5. **Link labels (4.x).** `renderCustomLinkElement`, the link counterpart of the node renderer.
   Issues 353 and 464.

## The v4 API

This is the contract Phase 5 implements. Names follow v3 wherever the meaning is unchanged.

### Data

```ts
interface RawNodeDatum {
  /** Stable identity. Defaults to the node's path, for example "0.2.1". */
  id?: string;
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
}

/** The node object the layout hands to callbacks and renderers. */
interface TreeNodeDatum extends RawNodeDatum {
  id: string;
  children?: TreeNodeDatum[];
}
```

`__rd3t` is gone. Depth comes from `HierarchyPointNode.depth`; collapse state comes from the tree,
not the datum.

### Props

```ts
interface TreeProps {
  data: RawNodeDatum;

  // Layout (unchanged from v3)
  orientation?: 'horizontal' | 'vertical';
  nodeSize?: { x: number; y: number };
  separation?: { siblings?: number; nonSiblings?: number };
  depthFactor?: number;
  pathFunc?: PathFunctionOption | PathFunction;
  pathClassFunc?: PathClassFunction;

  // Collapse state
  collapsible?: boolean;
  initialDepth?: number;                  // uncontrolled seed, as in v3
  collapsed?: Iterable<string>;           // controlled: ids of collapsed nodes
  onCollapsedChange?: (collapsed: Set<string>, change: { id: string; collapsed: boolean } | null) => void;
  shouldCollapseNeighborNodes?: boolean;

  // Zoom and pan (unchanged from v3)
  zoomable?: boolean;
  draggable?: boolean;
  zoom?: number;
  translate?: { x: number; y: number };
  scaleExtent?: { min?: number; max?: number };
  hasInteractiveNodes?: boolean;
  onTransformChange?: (transform: { x: number; y: number; k: number }) => void;

  // Centering
  centerOnClick?: boolean;                // default false
  centeringTransitionDuration?: number;

  // Rendering and styling (unchanged from v3)
  renderCustomNodeElement?: RenderCustomNodeElementFn;
  svgClassName?: string;
  rootNodeClassName?: string;
  branchNodeClassName?: string;
  leafNodeClassName?: string;

  // Events (unchanged names, no cloning, `void` return)
  onNodeClick?: TreeNodeEventCallback;
  onNodeMouseOver?: TreeNodeEventCallback;
  onNodeMouseOut?: TreeNodeEventCallback;
  onLinkClick?: TreeLinkEventCallback;
  onLinkMouseOver?: TreeLinkEventCallback;
  onLinkMouseOut?: TreeLinkEventCallback;
}
```

Uncontrolled collapse state: when `collapsed` is absent, the tree owns the set. It seeds the set
from `initialDepth`, keeps it across `data` changes, and applies the `initialDepth` rule to nodes
it hasn't seen before. `onCollapsedChange` still fires, like `onChange` on an uncontrolled input.

Controlled collapse state: when `collapsed` is present, the tree renders exactly that set and
reports every requested change through `onCollapsedChange` without changing anything itself.

### Handle

```ts
interface TreeHandle {
  centerNode(id: string, options?: { duration?: number }): void;
  toggleNode(id: string): void;
  expandAll(): void;
  collapseAll(): void;
  expandToDepth(depth: number): void;
  setTransform(transform: { x: number; y: number; k: number }, options?: { duration?: number }): void;
  getTransform(): { x: number; y: number; k: number };
}
```

Usage: `const ref = useRef<TreeHandle>(null); <Tree ref={ref} … />`.

### Custom node renderer

```ts
interface CustomNodeElementProps {
  id: string;
  depth: number;
  isRoot: boolean;
  isLeaf: boolean;
  isCollapsed: boolean;
  nodeDatum: TreeNodeDatum;
  hierarchyPointNode: HierarchyPointNode<TreeNodeDatum>;
  toggleNode: () => void;
  onNodeClick: (event: React.MouseEvent) => void;
  onNodeMouseOver: (event: React.MouseEvent) => void;
  onNodeMouseOut: (event: React.MouseEvent) => void;
}

type RenderCustomNodeElementFn = (props: CustomNodeElementProps) => React.ReactElement;
```

### DOM contract

- The `svg` keeps the `rd3t-svg` class and carries no `id`. No random classes.
- Each node `<g>` keeps `rd3t-node` or `rd3t-leaf-node` plus the class-name props, and carries
  `data-id`. The `id` attribute is dropped: user-supplied ids would collide with the host page.
- Each link `<path>` keeps `rd3t-link` and `data-source-id` and `data-target-id`.
- `globalCss` is still injected through a `<style>` element for the Next.js reason documented in
  `src/globalCss.ts`.

### Exports

`Tree` (default and named), `TreeProps`, `TreeHandle`, `RawNodeDatum`, `TreeNodeDatum`,
`TreeLinkDatum`, `Point`, `Orientation`, `PathFunction`, `PathFunctionOption`,
`PathClassFunction`, `CustomNodeElementProps`, `RenderCustomNodeElementFn`,
`TreeNodeEventCallback`, `TreeLinkEventCallback`.

## v3 to v4 parity table

| v3 | v4 | Why |
| --- | --- | --- |
| `data: RawNodeDatum \| RawNodeDatum[]` | `data: RawNodeDatum` | Only `data[0]` was ever rendered. |
| `__rd3t.id` (random UUID) | `id` (user-supplied or path) | Stable identity for state, keys, and SSR. |
| `__rd3t.depth` | `hierarchyPointNode.depth`, `CustomNodeElementProps.depth` | d3 already computes it. |
| `__rd3t.collapsed` | `collapsed` set, `CustomNodeElementProps.isCollapsed` | State leaves the data. |
| `dataKey` | Removed | Collapse state keyed by id survives a `data` update. To reset it for a new dataset, remount with `key`: `<Tree key={datasetId} />`. |
| `addChildren` in the node renderer | Removed | Update `data` instead; state survives. Flagged as a parity change that needs a consumer-side edit. |
| `initialDepth` | Kept (uncontrolled seed) | |
| `collapsible`, `shouldCollapseNeighborNodes` | Kept | |
| (none) | `collapsed`, `onCollapsedChange` | Controlled collapse state. |
| `onUpdate({ node, zoom, translate })` | `onTransformChange({ x, y, k })` and `onCollapsedChange` | One callback per concern; `node` was a clone and often `null`. |
| `enableLegacyTransitions`, `transitionDuration` | Removed | See Transitions. Animations return in 4.1 under a new prop. The one parity gap. |
| `dimensions` | Removed; `ResizeObserver` | Centering works without measuring by hand. |
| Click centers a node when `dimensions` is set | `centerOnClick` prop (default `false`) and `centerNode(id)` on the handle | `dimensions` doubled as the switch; the new prop makes it explicit. |
| `centeringTransitionDuration` | Kept | |
| `zoom`, `translate`, `scaleExtent`, `zoomable`, `draggable`, `hasInteractiveNodes` | Kept, same semantics | |
| `orientation`, `nodeSize`, `separation`, `depthFactor`, `pathFunc`, `pathClassFunc` | Kept | |
| `svgClassName`, `rootNodeClassName`, `branchNodeClassName`, `leafNodeClassName` | Kept | |
| `renderCustomNodeElement` | Kept; renderer props gain `id`, `depth`, `isRoot`, `isLeaf`, `isCollapsed` | `isLeaf` is true for a node with no children or an empty `children` array, and the class-name props use the same rule (v3 gave a `children: []` node `branchNodeClassName`). |
| `onNode*` and `onLink*` callbacks | Kept; receive live nodes; return `void` | No per-event tree walk. Consumers that mutated the clone must copy first. |
| `RenderCustomNodeElementFn` returns `JSX.Element` | Returns `React.ReactElement` | The global `JSX` namespace is gone in `@types/react` 19. |
| Node `<g id={uuid}>` | `<g data-id={id}>` | User ids must not collide with host-page ids. |
| Link `data-source-id` and `data-target-id` | Present, holding the endpoint node ids | Missing on every 3.6.x release; the contracts branch fixes it for 3.7.x and v4. |
| Random `rd3t-svg-<uuid>` and `rd3t-g-<uuid>` classes | Removed; refs | |
| `require('react-d3-tree')` | Works only on Node with `require(esm)` | Same environments as today; see the matrix. |
| React 16 and 17 | v3 only | |

## Consumer impact matrix

Each row says what a consumer setup gets today and after v4, and where the evidence comes from.

| Consumer setup | v3 today | v4 | Evidence |
| --- | --- | --- | --- |
| ESM app through a bundler (Vite, webpack 5, Next.js) | Works | Works | `consumer-import.mjs` in the smoke test; the demo. |
| `require()` on Node 22 or 24 | Works, through `require(esm)` of the d3 packages | Works, through `require(esm)` of the package itself | `consumer-require.cjs` passes against the ESM-only build on Node 22.13.1 in this worktree (2026-09-23); CI runs 22 and 24. |
| `require()` on a Node version without `require(esm)` | Fails on `require("d3-selection")` | Fails on the package itself | Unverified: based on the d3 packages shipping `"type": "module"` only and on the smoke test's own skip logic. No such Node version was run here. |
| Jest, ESM mode (`node --experimental-vm-modules jest`) | Works | Works | The smoke test's Jest 30 consumer passes against the packed package (2026-09-23). |
| Jest with the default CommonJS transform | Needs `transformIgnorePatterns` for the d3 packages | Needs it for `react-d3-tree` too | Unverified: not exercised. The migration guide points at ESM mode. |
| Server rendering (Next.js, Remix) | Renders, but every node and link is at opacity 0 and at its parent's position until the client mounts; ids differ between server and client | Renders the final layout with deterministic ids | `renderToString` run in this worktree (see [Server rendering](#server-rendering)); the mounted-DOM oracle in PR 1.2 and a hydration test in PR 5.1. |
| TypeScript, `moduleResolution: bundler` | Works | Works | `check:package` (attw) today and after. |
| TypeScript, ES module file, `node16` | Works (fixed in 3.7.0) | Works | Smoke type-check consumer. |
| TypeScript, CommonJS file, `nodenext` | Works (fixed in 3.7.0) | Works | The smoke test's CommonJS consumer type-checks under `nodenext` with TypeScript 5.9.3 against the ESM-only build (2026-09-23). |
| TypeScript, CommonJS file, `node16` | Works (fixed in 3.7.0) | attw reports `CJSResolvesToESM` for this resolution and the `esm-only` profile marks it ignored | Unverified whether a `node16` CommonJS consumer gets a compile error; attw's finding and TypeScript's rule say so. The documented answer for such consumers is `nodenext`, which TypeScript 5.8 and later ship. |
| React 16 or 17 | Works | Not supported | Peer range. |
| `enableLegacyTransitions` on React 19 | Throws (`findDOMNode` removed) | Prop removed | `findDOMNode` call found in the fork's `CSSTransitionGroupChild.js`. Unverified: not run under React 19 here. |

## Dependencies before and after

| Package | v3 | v4 | Note |
| --- | --- | --- | --- |
| `d3-hierarchy` | 1.1.9 | 3.1.2 | ESM-only, fine once the build is ESM-only. |
| `d3-selection` | 3.0.0 | 3.x | Unchanged. |
| `d3-zoom` | 3.0.0 | 3.x | Unchanged. |
| `d3-shape` | 1.3.7 | Removed (PR 3.3) | A local Bézier reproduces `linkHorizontal` and `linkVertical` byte for byte. |
| `d3-transition` | Transitive only | 3.0.1, declared (PR 3.1) | Used by `centerNode` and by 4.1 animations. |
| `@types/d3-hierarchy` | 1.1.8 (runtime dep) | 3.1.7 (runtime dep) | Exported types reference `HierarchyPointNode`. |
| `@bkrem/react-transition-group` | 1.3.5 | Removed | With the flag. |
| `clone` | 2.1.2 | Removed | With callback cloning. |
| `dequal` | 2.0.2 | Removed | Effects compare primitives. |
| `@types/d3-selection`, `@types/d3-zoom` (dev) | 1.x | 3.0.12, 3.0.8 (PR 3.1) | Match the runtimes; `@types/d3-shape` went with `d3-shape`. |
| `@types/d3-transition` (dev) | Absent | 3.0.9 (PR 3.1) | Removes three `@ts-ignore`. |
| `enzyme`, `enzyme-adapter-react-16` (dev) | 3.x | Removed | Testing Library. |
| `@testing-library/react`, `/dom` (dev) | Absent | 16.3.3, 10.4.2 | Peer range needs React 18 or 19. `user-event` isn't used: the tests dispatch raw wheel and mouse events. |
| `react`, `react-dom` (dev) | 16.14 | 19.3.0, with an 18.3.1 CI job | |
| `@types/react` (dev) | 16.9 | 19.x | |
| `typescript` (dev) | ~5.9.3 | ~6.0.3 | TypeDoc 0.28.20 alongside; 7 waits for TypeDoc. |
| `@types/node` (dev) | Absent | Matching the CI Node floor | Only `tsconfig.scripts.json` references it; the library build keeps `types: []`. |
| `rimraf` (dev) | 3.0.0 | Bump or replace | Cosmetic; keep off the critical path. |

Peer dependencies: `react` and `react-dom` at `^18.0.0 || ^19.0.0`.

## Risks and open questions

- **Node below 22.18 on a developer machine.** Once the scripts are `.ts`, `pnpm build`,
  `pnpm check:package`, and `pnpm test:smoke` fail with a syntax error on any Node before
  22.18.0. This machine's `PATH` Node is 22.13.1, below the repo's documented floor already,
  while 24.16.0 is installed under nvm. The `.nvmrc` and `engines` range from PR 2.5 turn that
  into a clear message. Unverified: whether pnpm 12 can be told to enforce `engines` at install
  time; check its `engineStrict` setting in that PR.
- **TypeScript 7.** Not tried: TypeDoc 0.28.20 declares a peer range of 5.0.x to 6.0.x. Revisit
  when TypeDoc adds 7.
- **`useId` output.** React 18.3.1 emits ids like `:R0:` and React 19.3.0 like `_R_0_` (both
  checked with `renderToString`). The React 18 form needs escaping in CSS selectors. The `svg` id
  is for uniqueness, not for consumer selectors; document that and keep `rd3t-svg` as the class
  to target.
- **Path ids and reordering.** A node without an `id` changes identity when its siblings reorder.
  That is by design and documented; consumers who reorder supply ids.
- **Handlers receive live nodes.** A consumer that stores the node and reads it after the next
  layout sees updated coordinates. Document it; it's the same contract every d3-based React
  library uses.
- **Animations on SVG `<g>` through CSS.** Browser support for `transition: transform` on SVG
  elements is broad but Safari has had quirks. The 4.1 benchmark page settles CSS versus
  `d3-transition` with measurements, not assumptions.
- **`ResizeObserver` timing.** The first measurement arrives after mount; `centerNode` called
  before then must either queue or use the last known size. Decide in PR 5.4.
- **Coverage thresholds during the rewrite.** Each PR must hold the thresholds on its own, so
  large PRs that delete tested code (4.2) must add the replacement tests in the same PR.

## Out of scope

- A React Native or SolidJS port (issues 505, 509).
- Flat-data adapters (`d3.stratify` wrappers); the README keeps pointing at d3 for that.
- A minimap, PDF export, or a search API (issues 511, 515, 480). Each is a consumer-side feature
  that the handle and stable ids make possible without library changes.
- Changing the CSS class names or the `<style>` injection approach.
