// Test-only dev server: no HMR, no file watching, so other agents' edits can't reload the page mid-test.
import { fileURLToPath } from 'node:url';

export default {
  // fileURLToPath, not URL.pathname: on Windows .pathname is '/C:/…' with %20 for spaces
  root: fileURLToPath(new URL('../..', import.meta.url)),
  define: { __BUILD__: JSON.stringify('test build') }, // vite.config.ts defines the real stamp
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  server: { port: 5199, strictPort: true, hmr: false, watch: { ignored: ['**/*'] } },
};
