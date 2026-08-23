// Copy src/templates -> dist/templates so the built CLI can resolve templates.
// dist/templates is cleared first so stale compiled artifacts (e.g. from when
// tsc previously emitted template .ts into dist) never leak into the payload.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, 'src', 'templates');
const dest = path.join(root, 'dist', 'templates');

mkdirSync(path.dirname(dest), { recursive: true });
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`Copied templates -> ${dest}`);
