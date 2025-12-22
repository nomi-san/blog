// Pre-render the app into static HTML.
// run `npm run generate` and then `dist/static` can be served as a static site.

import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const toAbsolute = (p: string) => path.resolve(__dirname, p)

const manifest = JSON.parse(
  await fs.readFile(toAbsolute('dist/static/.vite/ssr-manifest.json'), 'utf-8'),
)
const template = await fs.readFile(toAbsolute('dist/static/index.html'), 'utf-8')
const { render, getPrerenderRoutes } = (await import('./dist/server/entry-server.js')) as typeof import('./entry-server')

// determine routes to pre-render from src/pages
const routes = await getPrerenderRoutes()

// pre-render each route...
for (const url of routes) {
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