// Pre-render the app into static HTML.
// run `npm run generate` and then `dist/static` can be served as a static site.

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const toAbsolute = (p: string) => path.resolve(__dirname, p).replace(/\\/g, '/')

const vite = await createServer({
  base: '/',
  root: process.cwd(),
  appType: 'custom',
  server: { middlewareMode: true },
})

const template = await fs.readFile('./index.html', 'utf-8')
// const manifest = await fs.readFile(toAbsolute('dist/.vite/ssr-manifest.json'), 'utf-8')

const { getPrerenderRoutes } = (await vite.ssrLoadModule('/src/engine/entry-server.tsx')) as typeof import('./router.tsx')

// determine routes to pre-render from src/pages
const routes = await getPrerenderRoutes()

console.log('pre-render routes:', routes)

process.exit();

// pre-render each route...
for (const url of routes) {

  template = await vite.transformIndexHtml(url, template)
  render = (await vite.ssrLoadModule('/src/engine/entry-server.tsx')).render

  const [appHtml, appHead] = await render(url, manifest)

  const html = template
    .replace(`<!--app-head-->`, appHead)
    .replace(`<!--app-html-->`, appHtml)

  const file = `dist/static${url}/index.html`
  const filePath = toAbsolute(file)

  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, html)
  console.log('pre-rendered:', filePath)
}

// done, delete .vite directory including ssr manifest
await fs.rm(toAbsolute('dist/static/.vite'), { recursive: true })

// copy post assets from dist/client/posts to dist/static/posts
// await fs.cp(
//   toAbsolute('dist/client/posts'),
//   toAbsolute('dist/static/posts'),
//   { recursive: true },
// )