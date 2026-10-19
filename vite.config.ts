import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  // build stamp shown on the title and attached to error reports
  define: { __BUILD__: JSON.stringify(`v${pkg.version} · ${new Date().toISOString().slice(0, 10)}`) },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    target: 'es2022',
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
