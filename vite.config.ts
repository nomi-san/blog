import path from 'node:path'
import { defineConfig } from 'vite'
import vike from 'vike/plugin'
import vikeSolid from 'vike-solid/vite'
import tailwindcss from '@tailwindcss/vite'

const root = path.resolve(import.meta.dirname)

export default defineConfig({
  plugins: [
    vike(),
    vikeSolid(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '$blog-config': path.join(root, 'blog.config.ts'),
      '$components': path.join(root, 'src/components'),
      '$lib': path.join(root, 'src/lib'),
    },
  },
})