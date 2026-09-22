// Checks the package manifest and the built entry points the way consumers resolve them.
// Requires a prior `pnpm build`.
//
// publint validates `package.json` against the files in `lib/`. attw (Are the types wrong?)
// packs the package and resolves its types under every TypeScript module resolution mode.
//
// Findings that predate these checks are allowed by name. Fixing them means changing the
// `exports` map, which is a compatibility contract; see AGENTS.md. Everything else fails.
import { execFileSync } from 'node:child_process';
import { publint } from 'publint';
import { formatMessage, formatMessagePath } from 'publint/utils';

// The `types` condition is listed after `import` and `require`, and one ESM `.d.ts` set serves
// both entry points. Both are visible to consumers today and stay as they are within v3.
// Each entry names one diagnostic at one manifest location, so the same code at another
// location (for example a new export subpath) still fails.
const knownPublint = new Set([
  'EXPORTS_TYPES_SHOULD_BE_FIRST at pkg.exports["."].types',
  'TYPES_NOT_EXPORTED at pkg.exports["."].import',
  'TYPES_NOT_EXPORTED at pkg.exports["."].require',
]);
const knownAttwRules = ['fallback-condition', 'false-esm'];

const describe = message => `${message.code} at ${formatMessagePath(message.path)}`;

const { messages, pkg } = await publint({ pack: false, level: 'warning' });
const unexpected = messages.filter(message => !knownPublint.has(describe(message)));
for (const message of messages) {
  const marker = knownPublint.has(describe(message)) ? 'known' : 'NEW';
  console.log(`publint ${message.type} (${marker}): ${formatMessage(message, pkg)}`);
}
if (unexpected.length > 0) {
  console.error(`publint: ${unexpected.length} new finding(s)`);
  process.exit(1);
}

// `npm pack` runs `prepare` despite `--ignore-scripts`; `HUSKY=0` keeps it from touching git config.
execFileSync('attw', ['--pack', '.', '--ignore-rules', ...knownAttwRules], {
  stdio: 'inherit',
  env: { ...process.env, HUSKY: '0' },
});
