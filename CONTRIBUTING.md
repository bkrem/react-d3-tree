# Contributing to React D3 Tree

## Prerequisites

- Node.js 22.22.2 or later, or 24.15 or later.
- [pnpm](https://pnpm.io/installation) 12. The `packageManager` field in `package.json` pins the exact version. If a global pnpm 10 fails with `Failed to switch pnpm to v12`, upgrade the global pnpm to version 12.

## Set up the repo

In the repo root, install the dependencies and build the library:

```bash
pnpm install
pnpm build
```

## Run the playground

The playground in `demo/` is a Vite app that imports the library from `lib/`, so it needs a `pnpm build` first. To start it, run:

```bash
pnpm --filter rd3t-demo dev
```

To pick up library changes as you make them, run `pnpm build:watch` in a second terminal. For more on the playground, see [demo/README.md](demo/README.md).

To try your changes in your own app instead, run `npm link` in the repo root, then `npm link react-d3-tree` in your app's root.

## Check your changes

CI runs these commands on every push and pull request. Run them before you push:

```bash
pnpm lint
pnpm typecheck        # the tests, fixtures, and scripts
pnpm fmt:check        # `pnpm fmt` fixes formatting
pnpm build
pnpm check:package
pnpm test
pnpm test:smoke
pnpm --filter rd3t-demo typecheck
pnpm --filter rd3t-demo test
pnpm --filter rd3t-demo build
```

`pnpm test` enforces coverage thresholds, so add tests with new code.

## Submit a pull request

Open pull requests against `master`. The library is published to npm, so a change must not break apps on the same major version: keep the exports, props, defaults, and shipped types backwards compatible.
