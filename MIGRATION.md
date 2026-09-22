# Migrating from v3 to v4

v4 is a rewrite of the internals (function components and hooks, an ESM-only package, four
runtime dependencies) with a smaller and more capable public API. This guide lists what
changes for a v3 app, ordered by what breaks first, and what replaces each removed feature.
Every claim here is pinned by a test in `src/Tree/tests/` or by the packaged-consumer smoke test
in `scripts/smoke/`.

## Requirements

- React 18 or 19. React 16 and 17 stay on v3.
- The package is ESM only.
  - `import Tree from 'react-d3-tree'` works in every bundler and in Node.
  - `require('react-d3-tree')` works on Node 22.12 or later, which loads ES modules through
    `require()`. `scripts/smoke/consumer-require.cjs` proves it in CI.
  - A TypeScript file compiled as CommonJS needs `module: "nodenext"` (TypeScript 5.8 or later);
    `node16` rejects an ES module from a CommonJS file.
  - Jest loads the package in ESM mode: `node --experimental-vm-modules node_modules/jest/bin/jest.js`,
    with the test file in a `"type": "module"` package. `scripts/smoke/consumer-jest.test.mjs` is
    the working setup. Jest's default CommonJS transform can't load an ESM-only package.
- Node ids are stable (see [Node ids](#node-ids)), so server-rendered markup hydrates without a
  mismatch. `src/Tree/tests/server.test.tsx` asserts that server and client markup are equal.

## Changes that fail a build

| v3 | v4 | What to do |
| --- | --- | --- |
| `data: RawNodeDatum \| RawNodeDatum[]` | `data: RawNodeDatum` | Pass the root object. v3 only ever rendered `data[0]`. |
| `RenderCustomNodeElementFn` returns `JSX.Element` | Returns `ReactElement` | Nothing, unless you annotated the return type. |
| Event callbacks return `any` | Return `void` | Nothing, unless you relied on a return value. |
| `nodeDatum.__rd3t.id`, `.depth`, `.collapsed` | `nodeDatum.id`; `hierarchyPointNode.depth`; `isCollapsed` from the renderer props | Read the new fields. `TreeNodeDatum` is `RawNodeDatum` with `id` filled in. |
| `dataKey` prop | Removed | See [Resetting collapse state](#resetting-collapse-state-datakey). |
| `addChildren` in the renderer props, `AddChildrenFunction` | Removed | See [Adding children](#adding-children-addchildren). |
| `onUpdate` prop | Removed | See [Reacting to changes](#reacting-to-changes-onupdate). |
| `dimensions` prop | Removed | See [Centering](#centering-dimensions). |
| `enableLegacyTransitions`, `transitionDuration` | Removed | See [Animations](#animations-enablelegacytransitions). |
| `Tree.defaultProps`, `Tree.assignInternalProperties`, `Tree.collapseNode`, `Tree.expandNode`, `Tree.calculateD3Geometry` | Gone with the class | Defaults are documented on each prop (`TreeProps`). |

## Changes in behaviour for the same code

- Callbacks receive the tree's own layout nodes, not deep clones. Read them; copy what you keep.
  After the next layout their coordinates are stale. (`behavior.test.tsx`, "passes the live
  layout nodes".)
- A node's `<g>` carries `data-id` instead of `id`, so a user-supplied id can't collide with an
  element id on your page. The random `rd3t-svg-<uuid>` and `rd3t-g-<uuid>` classes are gone;
  target `.rd3t-svg` and `.rd3t-g`.
- Links carry `data-source-id` and `data-target-id`. On 3.6.x both attributes were missing.
- A node with `children: []` is a leaf everywhere: it gets `rd3t-leaf-node` and
  `leafNodeClassName`, and `isLeaf` is true. v3 gave it `branchNodeClassName`.
- `initialDepth` applies on the first render. A server render with `initialDepth` emits the
  pruned tree; v3 emitted the whole tree and pruned it on the client.
- Clicking a node centers it only with `centerOnClick`. In v3, passing `dimensions` turned
  centering on.
- Collapse state is keyed by node id and survives `data` updates for the ids that survive them.
  A new dataset with the same shape keeps the state; see
  [Resetting collapse state](#resetting-collapse-state-datakey).
- A partial `scaleExtent` or `separation` takes the default for the missing key. v3 passed
  `undefined` through to d3.
- Only nodes with children collapse. A click on a leaf changes nothing and reports nothing.
- `onCollapsedChange` fires on every toggle, also when the tree owns the collapse state.

## Replacements

### Resetting collapse state (`dataKey`)

Collapse state lives in a set of node ids and survives a `data` update. To start fresh for a
new dataset, remount the tree with a `key`, the way React resets any component's state.

```tsx
// v3
<Tree data={data} dataKey={datasetId} />

// v4
<Tree key={datasetId} data={data} />
```

### Adding children (`addChildren`)

Update `data`. Ids survive the update, so the parent keeps its collapse state and the new
children appear under it (or stay hidden under a collapsed parent until it expands).

```tsx
// v3, inside renderCustomNodeElement
<circle onClick={() => addChildren([{ name: 'loaded' }])} />

// v4
const [data, setData] = useState(initial);
const load = (id: string) => setData(current => appendChildren(current, id, [{ name: 'loaded' }]));
<Tree data={data} renderCustomNodeElement={({ id }) => <circle onClick={() => load(id)} />} />
```

`appendChildren` is your own pure function over your data; the tree never mutates `data`.

### Reacting to changes (`onUpdate`)

`onUpdate` fired on every update with `{ node, zoom, translate }`. Two callbacks replace it,
one per concern.

```tsx
// v3
<Tree onUpdate={({ node, zoom, translate }) => { /* … */ }} />

// v4
<Tree
  onTransformChange={({ x, y, k }) => { /* every zoom, pan, and programmatic transform */ }}
  onCollapsedChange={(collapsed, change) => { /* every toggle; change is { id, collapsed } */ }}
/>
```

Nothing fires on mount. Read the initial transform with `getTransform()` on the ref handle.

### Centering (`dimensions`)

The tree measures its own container. Turn on centering on click with `centerOnClick`, or
center any node from your own code through the ref handle.

```tsx
// v3
<Tree dimensions={{ width, height }} />

// v4
<Tree centerOnClick />

// v4, from anywhere
const tree = useRef<TreeHandle>(null);
<Tree ref={tree} />;
tree.current?.centerNode('0.1', { duration: 300 });
```

### Animations (`enableLegacyTransitions`)

4.0 ships without enter and exit animations. The v3 implementation depended on class-only
lifecycle hooks and on `findDOMNode`, which React 19 removed, and it froze large trees. Animations
return in a 4.x minor as a new opt-in prop with an implementation that scales; `ROADMAP.md`
holds the plan. `centeringTransitionDuration` is unrelated and still works.

## New in v4

### Node ids

`RawNodeDatum` has an optional `id`. A node without one gets its path in the tree: `"0"` for the
root, `"0.0"` and `"0.1"` for its children, and so on. Path ids stay stable as long as the
structure does; supply ids when nodes move between updates. Two nodes sharing an id trigger a
one-time console warning outside production builds. (`behavior.test.tsx`, "uses the path of a
node as its id".)

### Controlled collapse state

Own the collapse state yourself when you need to drive it from outside: the tree renders
exactly the `collapsed` set and reports every requested change without changing anything itself.

```tsx
const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
<Tree data={data} collapsed={collapsed} onCollapsedChange={setCollapsed} />
```

Without `collapsed`, the tree owns the state: it seeds the state from `initialDepth`, keeps it
across `data` updates, and applies `initialDepth` to nodes that a `data` update introduces.

### The ref handle

`TreeHandle` exposes `centerNode`, `toggleNode`, `expandAll`, `collapseAll`, `expandToDepth`,
`setTransform`, and `getTransform`. `toggleNode` works even when `collapsible` is false.
Programmatic transforms report through `onTransformChange` like a user zoom; a duration of 0
applies at once, and any other duration animates. (`handle.test.tsx`.)

### Richer renderer props

`renderCustomNodeElement` receives `id`, `depth`, `isRoot`, `isLeaf`, and `isCollapsed` next to
`nodeDatum`, `hierarchyPointNode`, `toggleNode`, and the event handlers.

## Support for v3

v3 receives security and critical fixes for 6 months from the 4.0.0 release date, on the `v3`
branch. The end date is in the 4.0.0 release notes.
