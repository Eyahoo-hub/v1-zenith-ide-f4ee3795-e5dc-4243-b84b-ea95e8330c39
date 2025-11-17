import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import path from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      // Configuration for the Cloudflare plugin
    }),
    monacoEditorPlugin({
      // Plugin options if needed
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Optional: configure server options if needed
  },
  optimizeDeps: {
    exclude: ['agents'],
  },
})