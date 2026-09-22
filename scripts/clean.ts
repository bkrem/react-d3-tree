// Removes each path given on the command line, recursively and without complaint if it is
// missing. Used by the build and test scripts instead of a dependency.
import { rmSync } from 'node:fs';

for (const target of process.argv.slice(2)) {
  rmSync(target, { recursive: true, force: true });
}
