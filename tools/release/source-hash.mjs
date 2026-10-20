// Fingerprint of everything that goes into a hosting build (Claude 1). predeploy-check.mjs writes it into its stamp
// after every test passes; guard.mjs recomputes it at deploy time, so a deploy is only allowed for exactly the code
// that was tested. Any edit to src/, public/, the config or .env.local changes it.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const DIRS = ['src', 'public'];
const FILES = ['index.html', 'vite.config.ts', 'tsconfig.json', 'package.json', 'package-lock.json', 'firebase.json', '.env.local'];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
}

export function sourceHash() {
  const files = [];
  for (const d of DIRS) if (existsSync(join(ROOT, d))) walk(join(ROOT, d), files);
  for (const f of FILES) if (existsSync(join(ROOT, f))) files.push(join(ROOT, f));
  const h = createHash('sha256');
  for (const p of files.map((f) => relative(ROOT, f).replace(/\\/g, '/')).sort()) {
    h.update(p); h.update('\0'); h.update(readFileSync(join(ROOT, p))); h.update('\0');
  }
  return { hash: h.digest('hex'), files: files.length };
}

export const STAMP = join(ROOT, 'tools/release/.predeploy-stamp.json');
