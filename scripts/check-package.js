// Checks the package manifest and the built entry points the way consumers resolve them.
// Requires a prior `pnpm build`.
//
// publint validates `package.json` against the files in `lib/`. attw (Are the types wrong?)
// packs the package and resolves its types under every TypeScript module resolution mode.
//
// Every finding fails. To accept one deliberately, add it to the matching set below, pinned to
// its location, with a comment that says why; the same finding at another location still fails.
import { spawnSync } from 'node:child_process';
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { publint } from 'publint';
import { formatMessage, formatMessagePath } from 'publint/utils';

// Entries look like 'EXPORTS_TYPES_SHOULD_BE_FIRST at pkg.exports["."].types'.
const knownPublint = new Set([]);
// Entries look like 'FallbackCondition at . (node16-cjs)' or 'FalseESM at <types file>'.
const knownAttw = new Set([
  // The package is ESM-only, so a CommonJS `require()` resolves to an ES module. Node 22.12 and
  // later load it through `require(esm)`, which the smoke test's CommonJS consumer proves. attw's
  // `esm-only` profile ignores this finding in its table but still lists it in the JSON.
  'CJSResolvesToESM at . (node16-cjs)',
]);

// `npm pack` runs `prepare` despite `--ignore-scripts`; `HUSKY=0` keeps it from touching git config.
const env = { ...process.env, HUSKY: '0' };

const describePublint = message => `${message.code} at ${formatMessagePath(message.path)}`;
const describeAttw = problem =>
  problem.entrypoint !== undefined
    ? `${problem.kind} at ${problem.entrypoint} (${problem.resolutionKind})`
    : `${problem.kind} at ${problem.typesFileName}`;

let failed = false;
const report = (tool, findings, describe, format) => {
  let unexpected = 0;
  for (const finding of findings) {
    const known = tool === 'publint' ? knownPublint : knownAttw;
    const marker = known.has(describe(finding)) ? 'known' : 'NEW';
    if (marker === 'NEW') unexpected += 1;
    console.log(`${tool} (${marker}): ${format(finding)}`);
  }
  if (unexpected > 0) {
    console.error(`${tool}: ${unexpected} new finding(s)`);
    failed = true;
  }
};

const { messages, pkg } = await publint({ pack: false, level: 'warning' });
report('publint', messages, describePublint, message => formatMessage(message, pkg));

// attw exits 1 whenever it finds a problem, so the exit code says nothing about newness. It
// exits right after printing, which truncates a piped stdout at one chunk; a file gets it all.
const attwOut = path.join(mkdtempSync(path.join(tmpdir(), 'rd3t-attw-')), 'attw.json');
const attwFd = openSync(attwOut, 'w');
const attwRun = spawnSync('attw', ['--pack', '.', '--format', 'json'], {
  env,
  stdio: ['ignore', attwFd, 'inherit'],
});
closeSync(attwFd);
if (attwRun.error) {
  console.error('attw did not run', attwRun.error);
  process.exit(1);
}
const attw = JSON.parse(readFileSync(attwOut, 'utf8'));
rmSync(path.dirname(attwOut), { recursive: true, force: true });
report('attw', Object.values(attw.problems ?? {}).flat(), describeAttw, describeAttw);
// The table gives the per-resolution view for humans; the JSON above decides the exit code.
spawnSync('attw', ['--pack', '.', '--profile', 'esm-only'], { stdio: 'inherit', env });

if (failed) process.exit(1);
