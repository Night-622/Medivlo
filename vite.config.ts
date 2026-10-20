import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
// the short commit ties an error report to one exact build (several deploys can share a date)
const commit = ((): string => { try { return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(); } catch { return 'nogit'; } })();

export default defineConfig({
  // build stamp shown on the title and attached to error reports
  define: { __BUILD__: JSON.stringify(`v${pkg.version} · ${new Date().toISOString().slice(0, 10)} · ${commit}`) },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    target: 'es2022',
    // maps for triaging minified error stacks: written to dist but never linked from the JS and never deployed
    // (firebase.json hosting.ignore **/*.map); tools/e2e/triage-errors.mjs reads them
    sourcemap: 'hidden',
    // engine and SDKs change rarely: their own chunks stay cached across game updates
    chunkSizeWarningLimit: 4500,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/phaser') ? 'phaser' : id.includes('node_modules/firebase') || id.includes('node_modules/@firebase') ? 'firebase' : undefined),
      },
    },
  },
  server: { port: 5173 },
});
