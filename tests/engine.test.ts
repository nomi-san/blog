import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { ViteDevServer } from 'vite'
import { fillTemplate } from '../src/engine/template'
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

describe('PageBoundary', () => {
  let vite: ViteDevServer
  let web: Record<string, any>
  let boundary: Record<string, any>

  before(async () => {
    vite = await createTestServer()
    web = await vite.ssrLoadModule('solid-js/web')
    boundary = await vite.ssrLoadModule('/src/engine/boundary.tsx')
  })

  after(() => vite.close())

  const renderPage = (children: () => unknown) =>
    web.renderToStringAsync(() =>
      web.createComponent(boundary.PageBoundary, {
        fallback: () => 'fallback view',
        get children() {
          return children()
        },
      }),
    )

  it('records nothing when the page renders', async () => {
    const html = await renderPage(() => 'page view')
    assert.ok(html.includes('page view'))
    assert.equal(boundary.renderErrors.length, 0)
  })

  it('records a render error so that the build can fail', async () => {
    const html = await renderPage(() => {
      throw new Error('boom')
    })
    assert.ok(html.includes('fallback view'))
    assert.equal(boundary.renderErrors.length, 1)
    assert.equal(boundary.renderErrors[0].message, 'boom')
  })
})
