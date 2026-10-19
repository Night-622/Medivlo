// Test-only dev server for tools/e2e: no HMR and no file watching, so other agents' edits can't reload the
// page mid-run. Restart it to pick up code changes:  npx vite --config tools/e2e/vite.e2e.config.mjs
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
export default {
  root,
  define: { __BUILD__: JSON.stringify('test build') }, // vite.config.ts defines the real stamp
  resolve: { alias: { '@': `${root}src` } },
  server: { port: 5198, strictPort: true, hmr: false, watch: { ignored: ['**/*'] } },
};
