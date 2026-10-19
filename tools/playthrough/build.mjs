// Bundles the integrated playthrough bot (Claude 2) for Node: the real authorities (world, systems, narrative)
// and the real content Registry. import.meta.glob is expanded at build time, as in server/build.mjs.
//   node tools/playthrough/build.mjs   → prints the bundle path   (ENTRY=tools/playthrough/spread.ts for the beat-spread report)
import { build } from 'esbuild';
import { globSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out = process.env.OUT ?? join(tmpdir(), `playthrough-${process.pid}.mjs`);

const globPlugin = {
  name: 'import-meta-glob',
  setup(b) {
    b.onLoad({ filter: /\.(ts|js)$/ }, (args) => {
      let src = readFileSync(args.path, 'utf8');
      if (!src.includes('import.meta.glob')) return undefined;
      const dir = dirname(args.path);
      let n = 0;
      const imports = [];
      src = src.replace(/import\.meta\.glob(?:<[^>]*>)?\(\s*['"]([^'"]+)['"]\s*,\s*\{\s*eager:\s*true\s*\}\s*\)/g, (_m, pattern) => {
        const files = globSync(pattern, { cwd: dir });
        const entries = files.map((f) => {
          const id = `__glob${n++}`;
          const rel = './' + relative(dir, join(dir, f)).split('\\').join('/');
          imports.push(`import * as ${id} from ${JSON.stringify(rel)};`);
          return `${JSON.stringify(rel)}: ${id}`;
        });
        return `({ ${entries.join(', ')} })`;
      });
      return { contents: imports.join('\n') + '\n' + src, loader: args.path.endsWith('.ts') ? 'ts' : 'js', resolveDir: dir };
    });
  },
};

await build({
  entryPoints: [resolve(root, process.env.ENTRY ?? 'tools/playthrough/run.ts')], outfile: out, bundle: true, platform: 'node', format: 'esm',
  target: 'node20', alias: { '@': join(root, 'src') }, plugins: [globPlugin], logLevel: 'error',
  define: { 'import.meta.env.DEV': 'false', 'import.meta.env': '{"DEV":false}' },
  external: ['phaser'],
});
console.log(out);
