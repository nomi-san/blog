import fs from 'node:fs/promises'
import path from 'node:path'
import { defineConfig, Plugin } from 'vite'
import vike from 'vike/plugin'
import vikeSolid from 'vike-solid/vite'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression2'

const root = path.resolve(import.meta.dirname)

export default defineConfig({
  plugins: [
    vike(),
    vikeSolid(),
    tailwindcss(),
    compression() as Plugin,
    postAssetsPlugin(),
  ],
  resolve: {
    alias: {
      '$blog-config': path.join(root, 'blog.config.ts'),
      '$components': path.join(root, 'src/components'),
      '$lib': path.join(root, 'src/lib'),
    },
  },
})

function postAssetsPlugin(): Plugin {
  return {
    name: 'post-assets',
    enforce: 'post',
    apply: 'build',
    async closeBundle() {
      // Copy posts assets to dist during build
      const postsDir = path.join(root, 'posts')
      const distDir = path.join(root, 'dist/client/posts')

      async function copyDir(src: string, dest: string) {
        await fs.mkdir(dest, { recursive: true })
        const entries = await fs.readdir(src, { withFileTypes: true })

        for (const entry of entries) {
          const srcPath = path.join(src, entry.name)
          const destPath = path.join(dest, entry.name)

          if (entry.isDirectory()) {
            await copyDir(srcPath, destPath)
          } else if (entry.isFile() && !entry.name.endsWith('.md')) {
            // Copy all files except markdown
            await fs.copyFile(srcPath, destPath)
          }
        }
      }
      try {
        await copyDir(postsDir, distDir)
        console.log('✓ Post assets copied to dist')
      } catch (error) {
        console.error('Failed to copy post assets:', error)
      }
    },
  }
}