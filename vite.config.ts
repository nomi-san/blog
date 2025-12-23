import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import blogEngine from './src/engine/vite'

export default defineConfig({
  plugins: [
    blogEngine(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '$blog-config': path.join(__dirname, 'blog.config.ts'),
      '$components': path.join(__dirname, 'src/components'),
      '$lib': path.join(__dirname, 'src/lib'),
      '@engine': path.join(__dirname, 'src/engine'),
    },
  },
})