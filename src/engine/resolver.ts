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
  const suffix = '$page.ctx'
  let _server: ViteDevServer

  return {
    name: 'blog-preload-resolver',
    configureServer(server) {
      _server = server
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
          return `export default ${JSON.stringify(data)};`
        }
        catch (e) {
          console.error('preloadResolver error', e)
        }
      }
    }
  }
}