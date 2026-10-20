// Test-only dev server for tools/e2e: no HMR and no file watching, so other agents' edits can't reload the
// page mid-run. Restart it to pick up code changes:  npx vite --config tools/e2e/vite.e2e.config.mjs
import { fileURLToPath } from 'node:url';
// Tests never touch the live Firebase project unless they opt in with E2E_FIREBASE=1: every headless profile
// would otherwise sign in anonymously and write saves to production (found by Claude 7). Without Firebase the game
// runs local-only: co-op uses LocalSignaling between tabs, public realms use dev tokens (DEV_AUTH test server).
const offline = process.env.E2E_FIREBASE === '1' ? {} : { 'import.meta.env.VITE_FIREBASE_API_KEY': '""', 'import.meta.env.VITE_FIREBASE_PROJECT_ID': '""' };
const root = fileURLToPath(new URL('../../', import.meta.url));
export default {
  root,
  define: { __BUILD__: JSON.stringify('test build'), ...offline }, // vite.config.ts defines the real stamp
  resolve: { alias: { '@': `${root}src` } },
  server: { port: 5198, strictPort: true, hmr: false, watch: { ignored: ['**/*'] } },
};
