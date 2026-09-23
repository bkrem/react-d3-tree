# react-d3-tree playground

The interactive demo at https://bkrem.github.io/react-d3-tree/. A Vite app in TypeScript that
renders `react-d3-tree` from this repository's `lib/` through the pnpm workspace link.

## Develop

From the repository root:

```bash
pnpm install
pnpm build          # emits lib/, which the demo imports
pnpm --filter rd3t-demo dev
```

To pick up library changes as you make them, run `pnpm build:watch` in a second terminal. It
emits the JavaScript and the declarations together, so the dev server and a type-check both
follow it.

## Scripts

```bash
pnpm --filter rd3t-demo dev        # Vite dev server
pnpm --filter rd3t-demo build      # production build into demo/dist
pnpm --filter rd3t-demo preview    # serve demo/dist locally
pnpm --filter rd3t-demo typecheck  # tsc --noEmit
pnpm --filter rd3t-demo test       # Vitest, pure modules only
```

The API docs that the top bar links to are TypeDoc output. `pnpm build:docs` at the repository
root writes them to `demo/public/docs`, which Vite copies into `demo/dist/docs`.

## Structure

- `src/state/playground.ts` holds the inspector state, its defaults (the library's documented
  defaults, spelled out), and the reducer.
- `src/state/url.ts` reads and writes the props that differ from the defaults as query
  parameters, so a configuration can be linked.
- `src/state/jsx.ts` renders the `<Tree />` snippet the code drawer shows.
- `src/data/` holds the datasets and the parser for pasted JSON.
- `src/nodes/renderers.tsx` holds the custom node renderers offered under Rendering.
- `src/components/` holds the layout: top bar, tree canvas, code drawer, inspector.

## Deploy

The `Pages` workflow (`.github/workflows/pages.yml`) builds the library, the docs, and the demo,
and deploys `demo/dist` to GitHub Pages. Run it from the Actions tab or with
`gh workflow run pages.yml`.
