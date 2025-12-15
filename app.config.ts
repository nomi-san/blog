import path from 'node:path'
import { defineConfig } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'

const root = path.resolve(import.meta.dirname)

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '$blog-config': path.join(root, 'blog.config.ts'),
        '$components': path.join(root, 'src/components'),
        '$lib': path.join(root, 'src/lib'),
      },
    },
  },
  server: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
    },
  },
})