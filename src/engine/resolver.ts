import path from 'node:path'
import { type Plugin } from 'vite'

const root = process.cwd()
const resolve = (p: string) => path.join(root, p).replace(/\\/g, '/')

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