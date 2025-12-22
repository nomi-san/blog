import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { blogPlugin } from './src/engine'

export default defineConfig({
  plugins: [
    blogPlugin(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '$blog-config': path.join(__dirname, 'blog.config.ts'),
      '$components': path.join(__dirname, 'src/components'),
      '$lib': path.join(__dirname, 'src/lib'),
    },
  },
})