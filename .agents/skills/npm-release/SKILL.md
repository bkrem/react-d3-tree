---
name: npm-release
description: Releases react-d3-tree to npm through the staged trusted-publishing flow - version bump, tag, GitHub release, tarball verification, maintainer 2FA approval, post-publish checks, and the optional demo deploy. Use when asked to cut, publish, or ship a release or release candidate, bump the package version for publishing, verify or approve a staged version, or point the demo at a released version. Do not use for the build tooling, CI changes, or changes to the publish workflow itself.
---

# npm release

## Goal

Publish a version of `react-d3-tree` to npm without an npm token, and prove the published tarball is what the tagged source builds.

## How publishing works

Publishing a GitHub release runs `.github/workflows/publish.yml`. The workflow authenticates to npm over OIDC (trusted publishing) and runs `npm stage publish`. The staged version is private until the maintainer approves it with 2FA. Provenance is attached automatically.

Three parts of the setup live outside this repo, on npmjs.com:

- A trusted publisher for `bkrem/react-d3-tree`, workflow filename `publish.yml`, no environment, stage-only. Renaming the workflow file breaks publishing.
- Publishing access set to require 2FA and disallow bypass tokens.
- The approval itself. Only the maintainer can approve, and npm sends no notification for a staged version.

## When to use

- "Cut a release", "publish 3.7.0", "ship a release candidate".
- "Verify the staged package", "is the staged version safe to approve?"
- "Update the demo to the new version."

## When not to use

- Changing `publish.yml`, the build, or CI. Treat those as normal code changes.
- Publishing with a token or `npm publish` from a laptop. That path is closed by the package's publishing access setting.

## Rules

- Confirm with the maintainer before every push to `master`, before publishing the GitHub release, and before deploying the demo. State exactly what gets pushed.
- Never approve, reject, or log in to npm on the maintainer's behalf. Hand over the stage id and the command.
- Report only what you observed. The OIDC exchange can't be dry-run; the workflow run is the test.
- Follow the backwards-compatibility contract in `AGENTS.md` when you pick the version number.

## Decision points

- **Stable or prerelease?** A prerelease needs an identifier made of lowercase letters, digits, and hyphens, starting with a letter: `3.7.0-rc.0`, `3.7.0-next.1`. The identifier becomes the dist-tag. `3.7.0-0` and `3.7.0-RC.1` fail the workflow. Stable versions publish under `latest`.
- **Deploy the demo?** Only when asked. The demo consumes the published package, so deploy after approval.

## Default workflow

Full commands and expected output are in [WORKFLOWS.md](./WORKFLOWS.md). Run everything from the repo root.

1. **Preflight.** Start from an up-to-date `master` with a clean tree and green CI. Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, and `pnpm test:smoke`.
2. **Bump.** Run `npm version <version> --no-git-tag-version`. Commit `package.json` as `chore(release): <version>`. Create the annotated tag `v<version>` with the bare version as its message.
3. **Push.** After the maintainer confirms, push the commit and the tag in one atomic push. The tag must equal `v` plus the `package.json` version, or the workflow fails.
4. **Release.** After the maintainer confirms, create the GitHub release for the tag. Mark prereleases with `--prerelease`. Notes are short bullets that link the PRs, then a full changelog compare link.
5. **Watch.** Find the `Publish` run, wait for it, and read the stage id and shasum from its log.
6. **Verify the staged tarball.** Run `.agents/skills/npm-release/scripts/reproduce-shasum.sh` on the tag. The shasum must equal the one in the run log. Run `.agents/skills/npm-release/scripts/compare-tarballs.sh` against the previous version and explain every difference from the merged changes.
7. **Hand over for approval.** Give the maintainer the stage id, the shasum to match on the **Staged Packages** tab, and the approve command. Stop until they confirm.
8. **Verify the published version.** Run `.agents/skills/npm-release/scripts/verify-published.sh <version> <dist-tag>`. On a Node version that can't `require()` ES modules, the script skips the `require()` check, as `pnpm test:smoke` does.
9. **Optional: deploy the demo.** Pin the demo to the exact version, build the docs and the demo, verify the build, commit, deploy, and check the live site.

## Validation checklist

- [ ] Tests, build, and smoke test passed on the release commit before the push.
- [ ] Tag is annotated, equals `v<version>`, and points at the version commit.
- [ ] The `Publish` run succeeded and its log shows `staged with id` and the expected dist-tag.
- [ ] Local rebuild shasum equals the run log shasum.
- [ ] Every file difference against the previous version traces to a merged change. No new syntax level, no missing dependency, no stray files.
- [ ] After approval: the dist-tag points at the version, other dist-tags are unchanged, provenance names this repo, `publish.yml`, the tag, and the release commit.
- [ ] A fresh install by dist-tag loads through `require` and `import`, and `npm audit signatures` passes.
- [ ] Demo only: the built bundle and docs show the version, and the live site serves the new bundle.

## Troubleshooting

- **Workflow fails at "Resolve version and dist-tag".** The tag and `package.json` disagree, or the prerelease identifier is invalid. Fix the version, delete the release and tag after the maintainer agrees, and start again.
- **Wrong dist-tag staged.** A staged tag is immutable. The maintainer rejects the staged version with `npm stage reject <id>`, then you re-run the release.
- **Shasum mismatch.** Do not hand over for approval. Rebuild from a clean checkout of the tag with `pnpm install --frozen-lockfile`. If it still differs, compare the run log's file list with `npm pack --dry-run` and report the difference. Local rebuilds under Node 22 with npm 10 and under Node 24 with npm 11 both reproduce the CI tarball (Node 24); other Node majors are untested.
- **`npm stage` or `npm trust` fails locally.** They need npm 11.15.0 or later and an `npm login` session. Use `npx -y npm@^11.15.0 <command>`.
- **`401` from `npm stage download`.** No npm session on this machine. Use the local rebuild for inspection; the matching shasum proves it is byte-identical.

## Examples

### Example 1: release candidate

Input: "Cut an rc for the next patch."

Output: version `3.6.7-rc.0` from `npm version prerelease --preid=rc --no-git-tag-version`, commit `chore(release): 3.6.7-rc.0`, tag `v3.6.7-rc.0`, GitHub release marked as a prerelease. The workflow stages it under `rc`. After approval, `rc` points at `3.6.7-rc.0` and `latest` is unchanged.

### Example 2: stable release

Input: "Ship 3.6.7."

Output: `npm version 3.6.7 --no-git-tag-version`, commit, tag `v3.6.7`, GitHub release without `--prerelease`. The workflow stages it under `latest`. Compare the tarball against `3.6.6`, the previous stable version, and also against the last release candidate if one exists.

### Example 3: verify only

Input: "There's a staged version waiting. Is it safe to approve?"

Output: skip steps 1 to 4. Read the stage id and shasum from the latest `Publish` run, run steps 6 and 7, and report each difference with the change that explains it.

## Evaluations

1. Activation: "Publish a new release candidate of react-d3-tree." The skill triggers, bumps to the next `-rc.N`, and asks for confirmation before the push.
2. Non-activation: "Bump `d3-zoom` to the latest version." A dependency bump is not a release; respond normally.
3. Edge case: "Release 3.7.0-RC.1." The skill rejects the identifier before tagging, explains the dist-tag rule, and proposes `3.7.0-rc.1`.
4. Edge case: the local shasum differs from the run log. The skill stops before the approval handover and reports the difference.
