import fs from 'node:fs/promises'
import path from 'node:path'
import express from 'express'
import type { ViteDevServer } from 'vite'
import { generateHydrationScript } from 'solid-js/web'

const root = process.cwd()
const resolve = (p: string) => path.join(root, p).replace(/\\/g, '/')

// Constants
const isProduction = process.argv.includes('--prod')
  || process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''

// Create http server
const app = express()

// Add Vite or respective production middlewares
// /** @type {import('vite').ViteDevServer | undefined} */
let vite: ViteDevServer
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv(resolve('dist/client'), { extensions: [] }))
}

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    let url = req.originalUrl.replace(base, '')
    if (!url.startsWith('/')) {
      url = '/' + url
    }

    let template: string
    let render: typeof import('./entry-server.tsx').render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/engine/entry-server.tsx')).render
    } else {
      template = templateHtml
      render = (await import(resolve('dist/server/entry-server.js'))).render
    }

    const [appHtml, appHead] = await render(url)

    const head = appHead + generateHydrationScript()

    const html = template
      .replace(`<!--app-head-->`, head)
      .replace(`<!--app-html-->`, appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e: any) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(Number(port), '127.0.0.1', () => {
  console.log(`Server started at http://localhost:${port}`)
})
