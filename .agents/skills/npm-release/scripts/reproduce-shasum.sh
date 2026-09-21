#!/usr/bin/env bash
# Rebuilds the checked-out release tag and prints the tarball shasum, to compare with the Publish run log.
# Usage: reproduce-shasum.sh [expected-shasum]
# Run from the repo root, on a clean checkout of the release tag, after `pnpm install --frozen-lockfile`.
set -euo pipefail

expected="${1:-}"

if [ -n "$(git status --porcelain)" ]; then
  echo "error: working tree is dirty; the tarball would not match the tag" >&2
  exit 1
fi

version="$(node -p "require('./package.json').version")"
tag="$(git describe --tags --exact-match 2>/dev/null || true)"
if [ "$tag" != "v$version" ]; then
  echo "error: HEAD is at '${tag:-no tag}', expected v$version. Check out the release tag first." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "error: node_modules is missing; run pnpm install --frozen-lockfile first" >&2
  exit 1
fi

out="$(mktemp -d)"
echo "node $(node --version), npm $(npm --version), pnpm $(pnpm --version), commit $(git rev-parse --short HEAD) ($tag)"
pnpm run build > "$out/build.log" 2>&1 || { echo "error: build failed, see $out/build.log" >&2; exit 1; }
# `npm pack` runs `prepare` despite `--ignore-scripts`; `HUSKY=0` keeps it from touching git config.
HUSKY=0 npm pack --ignore-scripts --pack-destination "$out" > /dev/null 2>&1

tarball="$(ls "$out"/*.tgz)"
actual="$(shasum -a 1 "$tarball" | cut -d' ' -f1)"
echo "tarball: $tarball"
echo "files:   $(tar -tzf "$tarball" | wc -l | tr -d ' ')"
echo "shasum:  $actual"

if [ -n "$expected" ]; then
  if [ "$actual" = "$expected" ]; then
    echo "MATCH: the local rebuild is byte-identical to the staged tarball"
  else
    echo "MISMATCH: expected $expected" >&2
    exit 1
  fi
fi
