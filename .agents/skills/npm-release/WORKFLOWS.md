# npm release workflows

Command sequences for each step in [SKILL.md](./SKILL.md). Run everything from the repo root. `<version>` has no `v` prefix; `<prev>` is the version you compare against.

## 1. Preflight

```bash
git fetch origin --tags
git switch -c chore/release-<version> origin/master --no-track
gh run list --branch master --limit 1      # expect: completed, success
npm ci && npm test && npm run build && npm run test:smoke
```

The smoke test prints `import "react-d3-tree": ok` and `require("react-d3-tree"): ok`.

## 2. Bump

```bash
npm version <version> --no-git-tag-version            # stable, or an explicit prerelease
npm version prerelease --preid=rc --no-git-tag-version # next release candidate
git add package.json package-lock.json
git commit -m "chore(release): <version>"
git tag -a v<version> -m "<version>"
```

The diff must contain only the version fields: one line in `package.json` and two in `package-lock.json`.

## 3. Push

Show the maintainer the commit, the tag, and the diff stat, and wait for a yes.

```bash
git fetch origin master
git rev-list --count HEAD..origin/master   # expect 0, so the push is a fast-forward
git push --atomic origin HEAD:master v<version>
```

## 4. Release

Write the notes to a file. Follow the format of earlier releases:

```markdown
* <What changed for consumers>: https://github.com/bkrem/react-d3-tree/pull/<n>

**Full Changelog**: https://github.com/bkrem/react-d3-tree/compare/v<prev>...v<version>
```

Wait for the maintainer's yes, then:

```bash
gh release create v<version> --verify-tag --title "v<version>" --notes-file <notes.md>               # stable
gh release create v<version> --verify-tag --prerelease --title "v<version>" --notes-file <notes.md>  # prerelease
```

Create the release with a user token, as `gh` does. A release created with a workflow's `GITHUB_TOKEN` doesn't trigger the `Publish` workflow.

## 5. Watch

```bash
gh run list --workflow publish.yml --limit 1 --json databaseId,status,event,headBranch
gh run watch <run-id> --exit-status
gh run view <run-id> --log | grep -E "shasum:|total files:|staged with id|has been staged with tag|provenance"
```

Expected lines:

```text
npm notice shasum: <40 hex characters>
npm notice stage Signed provenance statement with source and build information from GitHub Actions
+ react-d3-tree@<version> (staged with id <stage-id>)
npm notice stage package react-d3-tree@<version> has been staged with tag <dist-tag>
```

The registry must not show the version yet: `npm view react-d3-tree@<version> version` returns a 404, and `npm view react-d3-tree dist-tags` is unchanged.

## 6. Verify the staged tarball

```bash
git checkout --detach v<version>
npm ci
.agents/skills/npm-release/scripts/reproduce-shasum.sh <shasum-from-run-log>
.agents/skills/npm-release/scripts/compare-tarballs.sh <prev> <tarball-path-printed-above>
```

`reproduce-shasum.sh` prints `MATCH` when the local rebuild is byte-identical to the staged tarball. The rebuild then stands in for the staged tarball, so no npm login is needed.

In the comparison, explain every added, removed, and changed file from the changes merged since `<prev>`. Unchanged `.d.ts` files mean the public types are unchanged. Section 3 of the output must show only `ok` lines.

## 7. Hand over for approval

Give the maintainer:

- The stage id and the shasum. The **Staged Packages** tab on npmjs.com shows the same shasum; it must match.
- The summary of differences from step 6.
- The approve command: `npx -y npm@^11.15.0 stage approve <stage-id>`, or the **Approve** button on the tab. Both prompt for 2FA.

To discard a staged version, the maintainer runs `npx -y npm@^11.15.0 stage reject <stage-id>`.

## 8. Verify the published version

```bash
.agents/skills/npm-release/scripts/verify-published.sh <version> <dist-tag>
```

The script checks the dist-tag, decodes the provenance attestation and compares the repository, workflow path, ref, commit, and digest, then installs the package by dist-tag into an empty project and loads it through `require` and `import`. Also confirm the other dist-tags didn't move.

## 9. Optional: deploy the demo

The demo is a Create React App 3 project (webpack 4) that installs the published package. Compiling it is a useful consumer check in its own right.

```bash
git switch -c chore/demo-use-<version> origin/master --no-track
npm --prefix demo install react-d3-tree@<version> --save-exact --no-audit --no-fund
npm run build:docs              # typedoc writes to demo/public/docs, which is gitignored
npm --prefix demo run build
```

Use an exact version. A caret range such as `^3.6.3` never resolves to a prerelease of a later patch version.

Verify the build before deploying:

```bash
grep -ohE '[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?' demo/build/static/js/2.*.chunk.js | sort | uniq -c   # includes <version>
grep -ohE 'react-d3-tree - v[^<"]*' demo/build/docs/index.html | sort -u                                   # v<version>
```

Check the built demo in a browser with the `visual-test` skill or the Playwright tools: the heading shows `v<version>`, the tree renders, a node collapses and expands, and the console has no errors.

Commit `demo/package.json` and `demo/package-lock.json` as `chore(demo): use react-d3-tree <version>`, and land the commit through a pull request. After the maintainer's yes, deploy:

```bash
npm --prefix demo run deploy    # pushes demo/build to the gh-pages branch
gh api repos/bkrem/react-d3-tree/pages/builds/latest --jq '{status, commit: .commit[0:7]}'
```

The Pages deployment can take several minutes after the push. The site is live when the status is `built` and `https://bkrem.github.io/react-d3-tree/` references the new `static/js/2.*.chunk.js`. Returning visitors might see the old version until a hard refresh, because the demo registers a service worker.

The root script `npm run deploy:demo` runs the same build and deploy, and also rebuilds `lib/` first. The demo doesn't consume `lib/`, so that rebuild is harmless and unnecessary. The script has no verification step, so prefer the sequence above.
