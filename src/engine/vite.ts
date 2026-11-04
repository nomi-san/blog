import fs from 'node:fs/promises'
import path from 'node:path'
import { type Plugin } from 'vite'
import solidPlugin from '@solidjs/vite-plugin'
import compressionPlugin from 'vite-plugin-compression2'
import { pagesResolver, preloadResolver } from './resolver'

const root = process.cwd()

function overrideConfig(): Plugin {
  return {
    name: 'blog-override-config',
    config: () => ({
      build: {
        manifest: true,
        ssrManifest: true,
      },
      ssr: {
        noExternal: [
          'solid-js',
          '@solidjs/web',
          '@solidjs/router',
          '@solidjs/meta',
        ],
      },
      resolve: {
        alias: {
          '~/src': path.join(root, 'src'),
        },
      }
    }),
  }
}

// Pages guard server code with `if (!import.meta.env.SSR) return`. That relies on the
// bundler dropping the code, so check the result: `readdir` only exists in $lib/posts.
function assertNoServerCode(): Plugin {
  return {
    name: 'blog-assert-no-server-code',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk' && file.code.includes('readdir')) {
          this.error(`Server code reached the client chunk ${file.fileName}`)
        }
      }
    },
  }
}

function copyPostAssets(): Plugin {
  let ourDir: string
  return {
    name: 'blog-post-assets',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      ourDir = config.build.outDir
    },
    async closeBundle() {
      // Copy posts assets to dist during build
      const postsDir = path.join(root, 'posts')
      const distDir = path.join(ourDir, 'posts')

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

      await copyDir(postsDir, distDir)
      console.log('Post assets copied to dist')
    },
  }
}

export default function blogPlugin(options?: {
  compression?: boolean
}): Plugin[] {
  options = options || {}

  return [
    assertNoServerCode(),
    pagesResolver(),
    preloadResolver(),
    solidPlugin({
      ssr: true,
      // prerender.ts renders through a dev server, which defaults to Solid's dev builds.
      ...(process.env.NODE_ENV === 'production' ? { dev: false } : {}),
    }),
    overrideConfig(),
    copyPostAssets(),
    
    options.compression ? compressionPlugin({
      algorithms: ['gz'],
    }) as any : null,
  ]
}