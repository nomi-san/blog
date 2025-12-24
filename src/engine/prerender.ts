import fs from 'node:fs/promises'
import path, { join } from 'node:path'
import url from 'node:url'
import { createServer } from 'vite'

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
  build: {
    ssr: true,
    minify: 'terser',
  }
})

const template = await fs.readFile(path.join(root, 'dist/index.html'), 'utf-8')
const manifest = JSON.parse(await fs.readFile(path.join(root, 'dist/.vite/ssr-manifest.json'), 'utf-8')) as Record<string, string[]>

// load server entry module
const { render, getPrerenderRoutes } = (await vite.ssrLoadModule(join(__dirname, './entry-server'))) as typeof import('./entry-server')

// determine routes to pre-render from src/pages
const routes = await getPrerenderRoutes()

// pre-render each route...
for (const url of routes) {

  // template = await vite.transformIndexHtml(url, template)
  // render = (await vite.ssrLoadModule('/src/engine/entry-server.tsx')).render

  const [appHtml, appHead, context] = await render(url, manifest)

  const html = template
    .replace(`<!--app-head-->`, appHead)
    .replace(`<!--app-html-->`, appHtml)

  const file = `dist/${url}/index.html`
  const filePath = path.join(root, file).replace(/\\/g, '/')

  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, html)

  if (context) {
    const ctxFile = `dist/${url}/index$ctx.js`
    await fs.writeFile(path.join(root, ctxFile), context)
  }

  console.log('pre-rendered:', filePath)
}

// done, delete .vite directory including ssr manifest
await fs.rm(path.join(root, 'dist/.vite'), { recursive: true })

vite.close()