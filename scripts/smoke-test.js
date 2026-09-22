// Installs the packed tarball into a throwaway project and loads it through both entry points
// of the `exports` map, the way a consuming app does. Requires a prior `pnpm build`.
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = path.join(repoRoot, 'scripts', 'smoke');

if (!existsSync(path.join(repoRoot, 'lib', 'cjs', 'index.js'))) {
  console.error('lib/ is missing. Run `pnpm build` first.');
  process.exit(1);
}

// Lives outside the repo so module resolution can't reach the repo's node_modules.
const project = mkdtempSync(path.join(tmpdir(), 'rd3t-smoke-'));
// The consumer side uses npm on purpose. With an npm shim installed, Corepack rejects npm in a
// project whose `packageManager` is pnpm unless strict mode is off.
// `npm pack` runs `prepare` despite `--ignore-scripts`; `HUSKY=0` keeps it from touching git config.
const env = { ...process.env, COREPACK_ENABLE_STRICT: '0', HUSKY: '0' };
const run = (command, cwd) => execSync(command, { cwd, env, stdio: ['ignore', 'pipe', 'inherit'] });

try {
  const [{ filename }] = JSON.parse(
    run(`npm pack --json --ignore-scripts --pack-destination "${project}"`, repoRoot)
  );
  writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({ name: 'rd3t-smoke', private: true })
  );
  run(
    `npm install --no-audit --no-fund --no-package-lock "./${filename}" react@18 react-dom@18`,
    project
  );

  const consumers = ['consumer-import.mjs'];
  // The d3 dependencies are ESM-only, so `require()` needs a Node version that can load ES modules.
  if (process.features.require_module) {
    consumers.push('consumer-require.cjs');
  } else {
    console.warn(`Skipping the require() check: Node ${process.version} can't require ES modules.`);
  }

  consumers.forEach(consumer => {
    copyFileSync(path.join(fixtures, consumer), path.join(project, consumer));
    process.stdout.write(run(`"${process.execPath}" ${consumer}`, project));
  });
} finally {
  rmSync(project, { recursive: true, force: true });
}
