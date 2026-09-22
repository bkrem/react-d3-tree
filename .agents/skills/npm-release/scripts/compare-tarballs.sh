#!/usr/bin/env bash
# Compares a previously published version with a new tarball and prints every structural difference.
# Usage: compare-tarballs.sh <previous-version> <new-tarball.tgz>
# Every reported difference must trace to a merged change. Exits 1 on a finding that is never expected.
set -euo pipefail

prev_version="$1"
new_tgz="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
name="$(node -p "require('./package.json').name")"

work="$(mktemp -d)"
mkdir -p "$work/prev" "$work/new" "$work/dl"
(cd "$work/dl" && npm pack "$name@$prev_version" --silent > /dev/null)
tar -xzf "$work"/dl/*.tgz -C "$work/prev"
tar -xzf "$new_tgz" -C "$work/new"
P="$work/prev/package"
N="$work/new/package"
failed=0

mode() { stat -f '%Lp' "$1" 2>/dev/null || stat -c '%a' "$1"; }

echo "=== 1. File list ==="
(cd "$P" && find . -type f | sort) > "$work/prev.txt"
(cd "$N" && find . -type f | sort) > "$work/new.txt"
echo "previous: $(wc -l < "$work/prev.txt" | tr -d ' ') files, new: $(wc -l < "$work/new.txt" | tr -d ' ') files"
echo "--- removed ---"; comm -23 "$work/prev.txt" "$work/new.txt"
echo "--- added ---"; comm -13 "$work/prev.txt" "$work/new.txt"

echo; echo "=== 2. Changed files (identical files are omitted) ==="
identical=0
while read -r f; do
  if cmp -s "$P/$f" "$N/$f"; then
    identical=$((identical + 1))
  else
    echo "--- $f ($(wc -c < "$P/$f" | tr -d ' ') -> $(wc -c < "$N/$f" | tr -d ' ') bytes) ---"
    diff "$P/$f" "$N/$f" || true
  fi
  if [ "$(mode "$P/$f")" != "$(mode "$N/$f")" ]; then
    echo "MODE CHANGED: $f $(mode "$P/$f") -> $(mode "$N/$f")"
  fi
done < <(comm -12 "$work/prev.txt" "$work/new.txt")
echo "identical files: $identical"

echo; echo "=== 3. Build output checks on the new tarball ==="
check() { # label, count, expected
  if [ "$2" -eq "$3" ]; then echo "ok    $1"; else echo "FAIL  $1 (found $2, expected $3)"; failed=1; fi
}
# The package is ESM only, compiled for ES2020: one flat lib/ with .js and .d.ts side by side.
check "lib/ has the entry point at its root and no cjs, esm, or types-cjs subtree" "$(find "$N/lib" -maxdepth 1 \( -type d \( -name cjs -o -name esm -o -name types-cjs \) \) -o \( -maxdepth 1 -name index.js \) | grep -c index.js)" 1
check "build has no require( or exports." "$(grep -rlE 'require\(|exports\.' "$N/lib" --include='*.js' | wc -l | tr -d ' ')" 0
check "every module is ESM (has import or export)" "$(find "$N/lib" -name '*.js' | wc -l | tr -d ' ')" "$(grep -rlE '^(import|export) ' "$N/lib" --include='*.js' | wc -l | tr -d ' ')"
check "no ES2021+ syntax (??=, ||=, &&=)" "$(grep -rnE '\?\?=|\|\|=|&&=' "$N/lib" --include='*.js' | grep -vE ':\s*//' | wc -l | tr -d ' ')" 0
check "no CRLF line endings" "$(grep -rlI $'\r' "$N" | wc -l | tr -d ' ')" 0
check "no sourcemaps, tests, or specs" "$(find "$N" -name '*.map' -o -name '*.test.*' -o -name '*.spec.*' | wc -l | tr -d ' ')" 0

echo; echo "=== 4. Imports in lib/ against declared dependencies ==="
# Matches `from 'x'`, `require('x')`, and the bare side-effect form `import 'x'`.
grep -rhoE "(from |require\(|^import )['\"][^'\".][^'\"]*['\"]" "$N/lib" --include='*.js' --include='*.d.ts' \
  | sed -E "s/^(from |require\(|import )['\"]//; s/['\"]$//" | sed -E 's#^(@[^/]+/[^/]+|[^/]+).*#\1#' | sort -u > "$work/imports.txt"
node -e '
  const pkg = require(process.argv[1] + "/package.json");
  const declared = new Set([...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]);
  const used = require("fs").readFileSync(process.argv[2], "utf8").trim().split("\n").filter(Boolean);
  let missing = 0;
  for (const u of used) { const ok = declared.has(u); if (!ok) missing++; console.log((ok ? "ok      " : "MISSING ") + u); }
  for (const d of declared) if (!used.includes(d)) console.log("unused  " + d + " (expected for type-only and peer packages)");
  process.exit(missing ? 1 : 0);
' "$N" "$work/imports.txt" || failed=1

echo; echo "unpacked copies: $work"
exit "$failed"
