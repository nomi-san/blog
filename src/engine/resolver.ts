import { join } from 'node:path'
import { ViteDevServer, type Plugin } from 'vite'

const root = process.cwd()
const resolve = (p: string) => join(root, p).replace(/\\/g, '/')

export function pagesResolver(): Plugin {
  return {
    name: 'blog-pages-resolver',
    resolveId(id) {
      if (id.startsWith('virtual:$pages/')) {
        return id
      }
    },
    load(id) {
      if (id.startsWith('virtual:$pages/')) {
        const path = id.replace('virtual:$pages/', resolve('src/pages/'))
        return `export { default } from '${path}';`
      }
    }
  }
}

export function preloadResolver(): Plugin {
  const suffix = '/index.ctx.js'
  const postsDir = resolve('posts/')
  let _server: ViteDevServer

  return {
    name: 'blog-preload-resolver',
    configureServer(server) {
      _server = server

      // Posts are cached in $lib/posts and in the data modules, drop both on edit.
      server.watcher.on('all', (_event, file) => {
        const path = file.replace(/\\/g, '/')
        if (!path.startsWith(postsDir) || !path.endsWith('.md')) {
          return
        }

        for (const { moduleGraph } of Object.values(server.environments)) {
          for (const mod of moduleGraph.idToModuleMap.values()) {
            if (mod.id?.endsWith(suffix) || mod.file?.endsWith('/src/lib/posts.ts')) {
              moduleGraph.invalidateModule(mod)
            }
          }
        }
        server.ws.send({ type: 'full-reload' })
      })
    },
    resolveId(id) {
      if (id.endsWith(suffix)) {
        return id
      }
    },
    async load(id) {
      if (id.endsWith(suffix)) {
        const path = id.replace(suffix, '')
        try {
          const { getPreloader } = (await _server.ssrLoadModule(join(__dirname, './router'))) as typeof import('./router')
          const preloader = getPreloader(path)
          const data = await preloader?.()
          // Otherwise fail to load, as in production where no file is written for it.
          if (data !== undefined) {
            return `export default ${JSON.stringify(data)};`
          }
        }
        catch (e) {
          console.error('preloadResolver error', e)
        }
      }
    }
  }
}