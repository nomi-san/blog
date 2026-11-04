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
