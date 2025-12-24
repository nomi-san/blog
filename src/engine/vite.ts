import fs from 'node:fs/promises'
import path from 'node:path'
import { type Plugin } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import compressionPlugin from 'vite-plugin-compression2'
import { pagesResolver, preloadResolver } from './resolver'

const root = process.cwd()

function overrideConfig(): Plugin {
  return {
    name: 'blog-override-config',
    config: () => ({
      build: {
        ssrManifest: true,
      },
      ssr: {
        noExternal: [
          'solid-js',
          'solid-js/web',
          '@solidjs/router'
        ],
      },
      resolve: {
        alias: {
          '~/src': path.join(root, 'src'),
          '~/node_modules': path.join(root, 'node_modules'),
        },
      }
    }),
  }
}

function useServerDirective(): Plugin {
  return {
    name: 'blog-remove-use-server',
    enforce: 'pre',
    transform(code, id, options) {
      // ignore the server code in client build
      if (!options?.ssr && id.match(/\.(js|ts|jsx|tsx)$/)) {
        return code.replace(
          /(['"])use\s+server\1;*/gm,
          '}; if (false) async () => {'
        )
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
      try {
        await copyDir(postsDir, distDir)
        console.log('✓ Post assets copied to dist')
      } catch (error) {
        console.error('Failed to copy post assets:', error)
      }
    },
  }
}

export default function blogPlugin(options?: {
  compression?: boolean
}): Plugin[] {
  options = options || {}

  return [
    useServerDirective(),
    pagesResolver(),
    preloadResolver(),
    solidPlugin({
      ssr: true,
      solid: {
        hydratable: true,
      },
    }),
    overrideConfig(),
    copyPostAssets(),
    
    options.compression ? compressionPlugin() as any : null,
  ]
}