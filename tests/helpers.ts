import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { extname, join } from 'node:path'
import { createServer } from 'vite'

// Loads app modules the way prerender.ts does, so JSX goes through the Solid compiler.
export function createTestServer() {
  return createServer({
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true },
  })
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
}

// A strict static host: folders redirect to a trailing slash, a double slash is not
// collapsed and anything unknown gets 404.html.
export function serveDist(root = 'dist') {
  const server = createHttpServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url!, 'http://host').pathname)
    let file = join(root, pathname)

    if (!pathname.includes('//') && existsSync(file) && statSync(file).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(307, { Location: `${pathname}/` }).end()
        return
      }
      file = join(file, 'index.html')
    }

    if (pathname.includes('//') || !existsSync(file)) {
      response.writeHead(404, { 'Content-Type': MIME['.html'] })
      response.end(readFileSync(join(root, '404.html')))
      return
    }

    response.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
    response.end(readFileSync(file))
  })

  return new Promise<{ origin: string; close: () => void }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo
      resolve({ origin: `http://127.0.0.1:${port}`, close: () => server.close() })
    })
  })
}
