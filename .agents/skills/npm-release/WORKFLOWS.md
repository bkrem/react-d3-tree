# npm release workflows

Command sequences for each step in [SKILL.md](./SKILL.md). Run everything from the repo root. `<version>` has no `v` prefix; `<prev>` is the version you compare against.

## 1. Preflight

```bash
git fetch origin --tags
git switch -c chore/release-<version> origin/master --no-track
gh run list --branch master --limit 1      # expect: completed, success
pnpm install --frozen-lockfile && pnpm test && pnpm build && pnpm test:smoke
```

The smoke test prints `import "react-d3-tree": ok` and `require("react-d3-tree"): ok`.

## 2. Bump

```bash
npm version <version> --no-git-tag-version            # stable, or an explicit prerelease
npm version prerelease --preid=rc --no-git-tag-version # next release candidate
git add package.json
git commit -m "chore(release): <version>"
git tag -a v<version> -m "<version>"
```

The diff must contain only the version field: one line in `package.json`. `pnpm-lock.yaml` doesn't record the package's own version, so it stays unchanged.

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
pnpm install --frozen-lockfile
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

The demo is a Vite app in the pnpm workspace that imports the library from `lib/` through `workspace:*`. It builds from the repository source, so nothing in `demo/` changes for a release. Deploy it from `master` once the release commit is there.

Build it locally first, the way the workflow does:

```bash
pnpm build:demo                 # pnpm build, pnpm build:docs, then the Vite build into demo/dist
```

Verify the build before deploying:

```bash
grep -ohE '"[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?"' demo/dist/assets/index-*.js | sort -u   # "<version>"
grep -ohE 'react-d3-tree - v[^<"]*' demo/dist/docs/index.html | sort -u                        # v<version>
```

Check the built demo in a browser (`pnpm --filter rd3t-demo preview`, then `http://localhost:4173/react-d3-tree/`): the top bar shows `v<version>`, the tree renders, a node collapses and expands, and the console has no errors.

After the maintainer's yes, deploy with the `Pages` workflow, which runs the same build on the dispatched ref and deploys `demo/dist`:

```bash
gh workflow run pages.yml --ref master
gh run watch "$(gh run list --workflow pages.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```

The workflow's deploy job needs the repository's Pages source set to **GitHub Actions** (Settings → Pages → Build and deployment); it fails with a clear error otherwise. The site is live when the run succeeds and `https://bkrem.github.io/react-d3-tree/` references the new `assets/index-*.js`. The old Create React App build registered a service worker; `demo/index.html` unregisters it, so returning visitors get the new bundle on their next load.
