import path from 'node:path'
import { defineConfig } from 'vite'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import blogEngine from './src/engine/vite'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        autoprefixer,
        tailwindcss
      ]
    }
  },
  plugins: [
    blogEngine(),
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