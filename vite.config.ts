import path from 'node:path'
import { defineConfig } from 'vite'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import blogEngine from './src/engine/vite.ts'

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
    blogEngine({
      compression: true,
    }),
  ],
  resolve: {
    alias: {
      '$blog-config': path.join(import.meta.dirname, 'blog.config.ts'),
      '$components': path.join(import.meta.dirname, 'src/components'),
      '$lib': path.join(import.meta.dirname, 'src/lib'),
      '@engine': path.join(import.meta.dirname, 'src/engine'),
    },
  },
})