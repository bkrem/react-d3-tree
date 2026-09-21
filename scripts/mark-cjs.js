// The root package.json sets `"type": "module"`, so Node treats `lib/cjs/*.js` as ES modules
// unless a closer package.json marks them as CommonJS.
import { writeFileSync } from 'node:fs';

writeFileSync('lib/cjs/package.json', `${JSON.stringify({ type: 'commonjs' })}\n`);
