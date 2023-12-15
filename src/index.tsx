import { h, Helmet, renderSSR } from 'nano-jsx'
import { Application, Response } from 'oak'
import { extract, install } from 'twind-core'
import presetTailwind from 'twind-preset-tailwind'

install({
  presets: [
    presetTailwind(),
  ],
}, !Deno.args.includes('--dev'))

// BUG: should import App after twind install
const { App } = await import('./app.tsx')
const template = await Deno.readTextFile(`${Deno.cwd()}/src/app.html`)

function render(res: Response, pathname: string) {
  const start = performance.now()
  {
    if (pathname !== '/') {
      pathname = pathname.replace(/[\\\/]+$/, '')
    }

    const ssr = renderSSR(() => <App />, { pathname })
    const { head, body } = Helmet.SSR(ssr)
    const { html, css } = extract(body)

    const content = template
      .replace('@meta', head.join('\n'))
      .replace('@style', `<style data-twind>${css}</style>`)
      .replace('@body', html)

    res.status = 200
    res.body = content
    res.headers.set('Content-Type', 'text/html; charset=utf-8')
  }
  const ms = Math.round((performance.now() - start) * 100) / 100
  res.headers.set('X-Response-Time', `${ms}ms`)
}

const app = new Application()

app.use(async (ctx, next) => {
  try {
    const root = `${Deno.cwd()}/static`
    await ctx.send({ root, index: '/index.html' })
  } catch {
    if (ctx.request.method === 'GET') {
      const url = new URL(ctx.request.url)
      await render(ctx.response, url.pathname)
    } else {
      await next()
    }
  }
})

app.addEventListener('listen', ({ port }) => {
  console.log(`Listening on: http://localhost:${port}`)
})

await app.listen({ port: 5000, hostname: 'localhost' })
