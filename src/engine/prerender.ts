import fs from 'node:fs/promises'
import path, { join } from 'node:path'
import url from 'node:url'
import { createServer } from 'vite'
import { fillTemplate, stripAssetLinks } from './template'

// The output ships to readers, so render with Solid's production builds.
process.env.NODE_ENV = 'production'

const root = process.cwd()
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

console.log('\nStarting pre-rendering...')

// create vite server in middleware mode
const vite = await createServer({
  base: '/',
  root: process.cwd(),
  appType: 'custom',
  mode: 'production',
  server: { middlewareMode: true },
  // Nothing here runs in a browser, so there is nothing to pre-bundle for one.
  optimizeDeps: { noDiscovery: true },
  build: {
    ssr: true,
    minify: 'terser',
  }
})

const template = stripAssetLinks(await fs.readFile(path.join(root, 'dist/index.html'), 'utf-8'))
const ssrManifest = JSON.parse(await fs.readFile(path.join(root, 'dist/.vite/ssr-manifest.json'), 'utf-8')) as Record<string, string[]>
// Solid needs the client manifest to find the chunks of lazy() components.
const clientManifest = JSON.parse(await fs.readFile(path.join(root, 'dist/.vite/manifest.json'), 'utf-8'))

// load server entry module
const { render, getPrerenderRoutes } = (await vite.ssrLoadModule(join(__dirname, './entry-server'))) as typeof import('./entry-server')

// determine routes to pre-render from src/pages
const routes = await getPrerenderRoutes()

// pre-render each route...
for (const url of routes) {

  // template = await vite.transformIndexHtml(url, template)
  // render = (await vite.ssrLoadModule('/src/engine/entry-server.tsx')).render

  const [appHtml, appHead, context] = await render(url, ssrManifest, clientManifest)

  const html = fillTemplate(template, appHead, appHtml)

  // Static hosts look for /404.html when they serve an unknown url.
  const file = url === '/404' ? 'dist/404.html' : `dist/${url}/index.html`
  const filePath = path.join(root, file).replace(/\\/g, '/')

  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, html)

  if (context) {
    const ctxFile = `dist/${url}/index.ctx.js`
    await fs.writeFile(path.join(root, ctxFile), context)
  }

  console.log('pre-rendered:', filePath)
}

vite.close()

// done, delete .vite directory including ssr manifest
await fs.rm(path.join(root, 'dist/.vite'), { recursive: true })

try {
  await fs.rm(path.join(root, 'dist/index.html.gz'))
} catch { }