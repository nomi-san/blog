import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { ViteDevServer } from 'vite'
import { fillTemplate, stripAssetLinks } from '../src/engine/template'
import { createTestServer } from './helpers'

describe('fillTemplate', () => {
  const template = '<head><!--app-head--></head><body><!--app-html--></body>'

  it('puts head and html in their slots', () => {
    assert.equal(fillTemplate(template, 'H', 'B'), '<head>H</head><body>B</body>')
  })

  for (const pattern of ['$&', "$'", '$`', '$$']) {
    it(`keeps ${pattern} from page content literal`, () => {
      const page = fillTemplate(template, 'H', `price ${pattern} end`)
      assert.equal(page, `<head>H</head><body>price ${pattern} end</body>`)
    })
  }
})

describe('stripAssetLinks', () => {
  it('keeps the entry script and other links, drops styles and preloads', () => {
    const template = [
      '  <link rel="icon" href="/favicon.ico">',
      '  <script type="module" crossorigin src="/assets/index.js"></script>',
      '  <link rel="modulepreload" crossorigin href="/assets/web.js">',
      '  <link rel="stylesheet" crossorigin href="/assets/index.css">',
      '</head>',
    ].join('\r\n')

    assert.equal(stripAssetLinks(template), [
      '  <link rel="icon" href="/favicon.ico">',
      '  <script type="module" crossorigin src="/assets/index.js"></script>',
      '</head>',
    ].join('\r\n'))
  })
})

describe('renderApp', () => {
  let vite: ViteDevServer
  let solid: Record<string, any>
  let web: Record<string, any>
  let meta: Record<string, any>
  let renderApp: (code: () => unknown) => Promise<{ head: string; body: string }>

  before(async () => {
    vite = await createTestServer()
    solid = await vite.ssrLoadModule('solid-js')
    web = await vite.ssrLoadModule('@solidjs/web')
    meta = await vite.ssrLoadModule('@solidjs/meta')
    renderApp = (await vite.ssrLoadModule('/src/engine/entry-server.tsx')).renderApp
  })

  after(() => vite.close())

  it('splits head tags from the body and writes a real title', async () => {
    const { head, body } = await renderApp(() => [
      web.createComponent(meta.Title, { children: 'A & B' }),
      web.createComponent(meta.Meta, { name: 'description', content: 'About' }),
      'page view',
    ])

    assert.match(head, /<title[^>]*>A &amp; B<\/title>/)
    assert.match(head, /<meta name="description" content="About"/)
    assert.doesNotMatch(head, /<\/?head|<script/)
    assert.ok(body.includes('page view'))
    assert.doesNotMatch(body, /<\/?head>|<title/)
  })

  it('fails on a render error inside a boundary', async () => {
    const render = renderApp(() =>
      web.createComponent(solid.Errored, {
        fallback: 'fallback view',
        get children() {
          throw new Error('boom')
        },
      }),
    )
    await assert.rejects(render, /boom/)
  })

  it('fails on a render error without a boundary', async () => {
    const render = renderApp(() =>
      web.createComponent(() => {
        throw new Error('boom')
      }, {}),
    )
    await assert.rejects(render, /boom/)
  })
})
