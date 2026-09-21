#!/usr/bin/env bash
# Verifies a published version: dist-tag, provenance, and a fresh consumer install.
# Usage: verify-published.sh <version> <dist-tag>
# Run from the repo root after the maintainer approves the staged version.
set -euo pipefail

version="$1"
dist_tag="$2"
name="$(node -p "require('./package.json').name")"
repo="$(node -p "require('./package.json').repository.url.replace(/^git\+/, '').replace(/\.git$/, '')")"
commit="$(git rev-list -n 1 "v$version")"
work="$(mktemp -d)"

echo "=== 1. dist-tags ==="
npm view "$name" dist-tags --json | tee "$work/dist-tags.json"

echo; echo "=== 2. Provenance ==="
curl -sf "https://registry.npmjs.org/-/npm/v1/attestations/$name@$version" > "$work/attestations.json" \
  || { echo "FAIL  no attestations found for $name@$version" >&2; exit 1; }
integrity="$(npm view "$name@$version" dist.integrity)"

node -e '
  const [file, tagsFile, name, version, distTag, repo, commit, integrity] = process.argv.slice(1);
  const fs = require("fs");
  const tags = JSON.parse(fs.readFileSync(tagsFile, "utf8"));
  const prov = JSON.parse(fs.readFileSync(file, "utf8")).attestations.find(a => a.predicateType.includes("slsa.dev/provenance"));
  const stmt = JSON.parse(Buffer.from(prov.bundle.dsseEnvelope.payload, "base64").toString());
  const def = stmt.predicate.buildDefinition;
  const wf = def.externalParameters.workflow;
  const hex = Buffer.from(integrity.replace(/^sha512-/, ""), "base64").toString("hex");
  const checks = {
    [`dist-tag ${distTag} points at ${version}`]: tags[distTag] === version,
    "subject is this package version": stmt.subject[0].name === `pkg:npm/${name}@${version}`,
    "subject digest equals the registry integrity": stmt.subject[0].digest.sha512 === hex,
    [`repository is ${repo}`]: wf.repository === repo,
    "workflow is .github/workflows/publish.yml": wf.path === ".github/workflows/publish.yml",
    [`ref is refs/tags/v${version}`]: wf.ref === `refs/tags/v${version}`,
    [`commit is ${commit.slice(0, 7)}`]: def.resolvedDependencies[0].digest.gitCommit === commit,
    "runner is GitHub-hosted": stmt.predicate.runDetails.builder.id.endsWith("/github-hosted"),
  };
  console.log("run:", stmt.predicate.runDetails.metadata.invocationId);
  let failed = 0;
  for (const [label, ok] of Object.entries(checks)) { console.log((ok ? "ok    " : "FAIL  ") + label); if (!ok) failed++; }
  process.exit(failed ? 1 : 0);
' "$work/attestations.json" "$work/dist-tags.json" "$name" "$version" "$dist_tag" "$repo" "$commit" "$integrity"

echo; echo "=== 3. Fresh install by dist-tag ==="
mkdir -p "$work/consumer"
cd "$work/consumer"
npm init -y > /dev/null 2>&1
npm install "$name@$dist_tag" react react-dom --silent --no-fund > /dev/null 2>&1
installed="$(node -p "require('./node_modules/$name/package.json').version")"
if [ "$installed" = "$version" ]; then echo "ok    $name@$dist_tag installs $installed"; else echo "FAIL  $name@$dist_tag installs $installed, expected $version"; exit 1; fi
# The d3 dependencies are ESM-only, so `require()` needs a Node version that can load ES modules.
if node -e "process.exit(process.features.require_module ? 0 : 1)"; then
  node -e "const m = require('$name'); if (!m.Tree) process.exit(1); console.log('ok    require() exports: ' + Object.keys(m).join(', '))"
else
  echo "skip  require() check: Node $(node --version) can't require ES modules"
fi
node --input-type=module -e "const m = await import('$name'); if (!m.Tree) process.exit(1); console.log('ok    import exports: ' + Object.keys(m).join(', '))"
npm audit signatures 2>&1 | grep -E "verified|invalid|missing" || true
