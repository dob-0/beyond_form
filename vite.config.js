import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Single-file build: the di.iiii linked-space sync (scripts/sync-space.mjs)
// uploads one entry HTML into the space's code presentation, so everything
// (JS, CSS, fonts, images) must inline into dist/index.html.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { assetsInlineLimit: 100000000, chunkSizeWarningLimit: 5000 },
})
