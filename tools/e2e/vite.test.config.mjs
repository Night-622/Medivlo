// Test-only dev server: no HMR, no file watching, so other agents' edits can't reload the page mid-test.
import { fileURLToPath } from 'node:url';
// Tests never touch the live Firebase project unless they opt in with E2E_FIREBASE=1: every headless profile
// would otherwise sign in anonymously and write saves to production (found by Claude 7). Without Firebase the game
// runs local-only: co-op uses LocalSignaling between tabs, public realms use dev tokens (DEV_AUTH test server).
const offline = process.env.E2E_FIREBASE === '1' ? {} : { 'import.meta.env.VITE_FIREBASE_API_KEY': '""', 'import.meta.env.VITE_FIREBASE_PROJECT_ID': '""' };

export default {
  // fileURLToPath, not URL.pathname: on Windows .pathname is '/C:/…' with %20 for spaces
  root: fileURLToPath(new URL('../..', import.meta.url)),
  define: { __BUILD__: JSON.stringify('test build'), ...offline }, // vite.config.ts defines the real stamp
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  server: { port: 5199, strictPort: true, hmr: false, watch: { ignored: ['**/*'] } },
};
