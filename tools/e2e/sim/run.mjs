// Bundle a headless TS entry (Phaser-free) with esbuild and run it in Node. Usage: node tools/e2e/sim/run.mjs <name>
import { build } from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const name = process.argv[2] ?? 'validate';
const out = path.join(root, 'node_modules/.cache/sim', `${name}.mjs`);
await build({
  entryPoints: [path.join(root, 'tools/e2e/sim', `${name}.ts`)], bundle: true, platform: 'node', format: 'esm', outfile: out,
  alias: { '@': path.join(root, 'src') }, logLevel: 'warning', define: { 'import.meta.env.DEV': 'true' },
});
await import(pathToFileURL(out).href + `?t=${Date.now()}`);
