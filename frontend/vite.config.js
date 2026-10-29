import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    // Frontend selalu memanggil /api di domainnya sendiri. Saat dev diteruskan
    // ke backend lokal; di Vercel diteruskan oleh rewrite di vercel.json.
    proxy: {
      '/api': 'http://localhost:4100',
    },
  },
})
