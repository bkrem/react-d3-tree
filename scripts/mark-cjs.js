// The root package.json sets `"type": "module"`, so Node and TypeScript treat `lib/cjs/*.js`
// and `lib/types/*.d.ts` as ES modules unless a closer package.json marks them as CommonJS.
//
// `lib/cjs/package.json` does that for the runtime. For the types, `lib/types-cjs/` is a copy
// of `lib/types/` with its own marker: the `require` condition points at it, so a CommonJS
// consumer gets declarations that TypeScript reads as CommonJS.
import { cpSync, rmSync, writeFileSync } from 'node:fs';

const marker = `${JSON.stringify({ type: 'commonjs' })}\n`;

writeFileSync('lib/cjs/package.json', marker);

rmSync('lib/types-cjs', { recursive: true, force: true });
cpSync('lib/types', 'lib/types-cjs', { recursive: true });
writeFileSync('lib/types-cjs/package.json', marker);
