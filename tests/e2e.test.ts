// Browser checks against the prerendered site in dist/. Needs Chrome to be installed.
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { after, before, describe, it, type TestContext } from 'node:test'
import { chromium, type Browser, type BrowserContextOptions, type Page } from 'playwright-core'
import { serveDist } from './helpers'

const source = (id: string) => readFileSync(join('posts', id, 'index.md'), 'utf8')
const postIds = readdirSync('posts').filter((id) => existsSync(join('posts', id, 'index.md')))
const withDiagram = postIds.find((id) => source(id).includes('```mermaid'))!
const withoutDiagram = postIds.find((id) => !source(id).includes('```mermaid'))!
const withImage = postIds.find((id) => /!\[[^\]]*\]\(/.test(source(id)))!

let browser: Browser
let site: Awaited<ReturnType<typeof serveDist>>

before(async () => {
  site = await serveDist()
  browser = await chromium.launch({ channel: 'chrome' })
})

after(async () => {
  await browser?.close()
  site?.close()
})

async function open(t: TestContext, options: BrowserContextOptions = {}) {
  const context = await browser.newContext(options)
  t.after(() => context.close())

  // tsx wraps named functions in this helper, also in the ones that run in the page.
  await context.addInitScript('globalThis.__name = (fn) => fn')

  // Local site only, so that test runs never reach analytics or other hosts.
  await context.route('**/*', (route) => {
    return route.request().url().startsWith(site.origin) ? route.continue() : route.abort()
  })

  const page = await context.newPage()
  const errors: string[] = []
  const logged: string[] = []
  const requests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      logged.push(message.text())
    }
  })
  page.on('request', (request) => requests.push(request.url().replace(site.origin, '')))
  return { page, errors, logged, requests }
}

async function visit(page: Page, path: string) {
  const response = await page.goto(site.origin + path, { waitUntil: 'networkidle' })
  // The theme button sets this on mount, so hydration has finished.
  await page.waitForSelector('[data-view-transition="true"]')
  return response!
}

const openPost = (page: Page, id: string) => page.locator(`main a[href^="/posts/${id}"]`).first().click()
const postTitle = (page: Page) => page.locator('article h1').first()
const progressGone = (page: Page) => page.waitForFunction(() => !document.querySelector('.bprogress'))

async function addLink(page: Page, href: string) {
  await page.evaluate((target) => {
    const link = document.createElement('a')
    link.href = target
    link.id = 'test-link'
    link.textContent = 'test link'
    document.querySelector('.markdown-body')!.prepend(link)
  }, href)
  await page.locator('#test-link').click()
}

const diagramsRendered = (page: Page) =>
  page.waitForFunction(() => {
    const diagrams = document.querySelectorAll('.mermaid:not(.drawing)')
    return diagrams.length > 0 && document.querySelectorAll('.mermaid:not(.drawing) svg').length === diagrams.length
  }, null, { timeout: 20_000 })

const clickThemeButton = (page: Page) =>
  page.evaluate(() => document.querySelector<HTMLElement>('button[role=switch]')!.click())

const nodeFill = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.querySelector('.mermaid g.node rect')!).fill)

async function nodeFillChanged(page: Page, from: string) {
  await page.waitForFunction((fill) => getComputedStyle(document.querySelector('.mermaid g.node rect')!).fill !== fill, from)
  return nodeFill(page)
}

// Clicks the theme button, then clicks it again as many times as told once the new
// diagrams are being drawn. Returns the height of the page at that moment.
const clickThemeButtonWhileDrawing = (page: Page, clicks = 0) =>
  page.evaluate((clicks) => new Promise<number>((resolve, reject) => {
    // Evaluate has no timeout of its own, so this would hang when nothing is drawn.
    setTimeout(() => reject(new Error('The diagrams were not drawn again')), 5_000)

    const button = document.querySelector<HTMLElement>('button[role=switch]')!
    const observer = new MutationObserver(() => {
      if (document.querySelector('.mermaid.drawing')) {
        observer.disconnect()
        const height = document.documentElement.scrollHeight
        for (let i = 0; i < clicks; i++) {
          button.click()
        }
        resolve(height)
      }
    })
    observer.observe(document.querySelector('.markdown-body')!, { childList: true, subtree: true })
    button.click()
  }), clicks)

const themeState = (page: Page) =>
  page.evaluate(() => {
    const button = document.querySelector('button[role=switch]')!
    const [sun, moon] = Array.from(button.querySelectorAll('svg'))
    return {
      dark: document.documentElement.classList.contains('dark'),
      ariaChecked: button.getAttribute('aria-checked'),
      sun: getComputedStyle(sun).display !== 'none',
      moon: getComputedStyle(moon).display !== 'none',
      gradient: getComputedStyle(document.querySelector('.h-screen.opacity-25')!).display !== 'none',
    }
  })

// Runs in the page. Lists the text of the article under AA, against what is really behind it.
function lowContrastText() {
  type Color = { r: number; g: number; b: number; a: number }

  const parse = (css: string): Color | null => {
    const match = css.match(/rgba?\(([^)]+)\)/)
    if (!match) {
      return null
    }
    const [r, g, b, a = 1] = match[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return { r, g, b, a }
  }
  const over = (top: Color, bottom: Color): Color => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  })
  const luminance = ({ r, g, b }: Color) => {
    const [x, y, z] = [r, g, b].map((value) => {
      const channel = value / 255
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * x + 0.7152 * y + 0.0722 * z
  }

  const page = parse(getComputedStyle(document.documentElement).backgroundColor)!
  const gradientElement = document.querySelector('.h-screen.opacity-25')
  const gradient = gradientElement && getComputedStyle(gradientElement).display !== 'none'
    ? parse(getComputedStyle(gradientElement).backgroundImage)
    : null

  const backgroundOf = (element: Element) => {
    const layers: Color[] = []
    for (let current: Element | null = element; current && current !== document.documentElement; current = current.parentElement) {
      const color = parse(getComputedStyle(current).backgroundColor)
      if (color?.a) {
        layers.push(color)
        if (color.a === 1) {
          break
        }
      }
      if (current.localName === 'foreignObject') {
        const shape = current.closest('g.node')?.querySelector('rect, polygon, circle, path')
        const fill = shape && parse(getComputedStyle(shape).fill)
        if (fill) {
          layers.push(fill)
        }
      }
    }

    let result = page
    const top = element.getBoundingClientRect().top + window.scrollY
    if (gradient && top < window.innerHeight) {
      result = over({ ...gradient, a: 0.25 * (1 - top / window.innerHeight) }, result)
    }
    return layers.reverse().reduce((bottom, layer) => over(layer, bottom), result)
  }

  const failures = new Set<string>()
  const check = (element: Element, style: CSSStyleDeclaration, text: string) => {
    const color = parse(style.color)
    if (!color) {
      return
    }
    const background = backgroundOf(element)
    const [lighter, darker] = [luminance(over(color, background)), luminance(background)].sort((a, b) => b - a)
    const ratio = (lighter + 0.05) / (darker + 0.05)
    const size = parseFloat(style.fontSize)
    const large = size >= 24 || (size >= 18.66 && parseInt(style.fontWeight) >= 700)
    if (ratio < (large ? 3 : 4.5)) {
      failures.add(`${ratio.toFixed(2)} ${style.color} on ${JSON.stringify(background)}: ${text.slice(0, 30)}`)
    }
  }

  const walker = document.createTreeWalker(document.querySelector('article')!, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement!
    const text = node.textContent!.trim()
    const inSvg = element.closest('svg') && !element.closest('foreignObject')
    if (text && !inSvg && !element.closest('.drawing, nav, style, script') && element.getBoundingClientRect().width) {
      check(element, getComputedStyle(element), text)
    }
  }
  for (const [selector, pseudo] of [['.added', '::before'], ['.deleted', '::before'], ['a[target=_blank]', '::after']]) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      check(element, getComputedStyle(element, pseudo), selector + pseudo)
    }
  }

  return Array.from(failures)
}

const LIGHT = { dark: false, ariaChecked: 'false', sun: true, moon: false, gradient: false }
const DARK = { dark: true, ariaChecked: 'true', sun: false, moon: true, gradient: true }

describe('home page', () => {
  it('lists every post and has working social links', async (t) => {
    const { page, errors } = await open(t)
    await visit(page, '/')

    assert.equal(await page.locator('main a[href^="/posts/"]').count(), postIds.length)
    assert.match(await page.locator('nav a[title=Email]').getAttribute('href') ?? '', /^mailto:/)
    assert.equal(await page.locator('nav a[title=LinkedIn]').count(), 1)
    assert.deepEqual(errors, [])
  })

  it('does not fetch its data again when hydrating', async (t) => {
    const { page, requests } = await open(t)
    await visit(page, '/')
    assert.deepEqual(requests.filter((url) => url.includes('.ctx.js')), [])
  })

  it('loads every asset once', async (t) => {
    const { page, requests } = await open(t)
    await visit(page, `/posts/${withImage}/`)
    await page.waitForLoadState('networkidle')

    const assets = requests.filter((url) => url.startsWith('/assets/'))
    assert.deepEqual(assets.filter((url, index) => assets.indexOf(url) !== index), [])
  })
})

describe('document head', () => {
  const titles = (page: Page) =>
    page.evaluate(() => Array.from(document.querySelectorAll('title')).map((title) => title.textContent))

  it('keeps one title, updated on navigation', async (t) => {
    const { page } = await open(t)
    await visit(page, '/')
    const home = await page.title()
    assert.deepEqual(await titles(page), [home])

    await openPost(page, withoutDiagram)
    await postTitle(page).waitFor()
    await page.waitForFunction((title) => document.title !== title, home)
    const post = await page.title()
    assert.deepEqual(await titles(page), [post])
    assert.ok(post.includes(await postTitle(page).innerText()))

    await page.locator('header a[href="/"]').click()
    await page.waitForFunction((title) => document.title === title, home)
    assert.deepEqual(await titles(page), [home])
  })

  it('replaces the page metadata on navigation', async (t) => {
    const { page } = await open(t)
    await visit(page, '/')
    const ogUrl = () => page.locator('meta[property="og:url"]').getAttribute('content')
    const homeUrl = await ogUrl()

    await openPost(page, withoutDiagram)
    await postTitle(page).waitFor()
    await page.waitForFunction((url) => document.querySelector('meta[property="og:url"]')?.getAttribute('content') !== url, homeUrl)

    assert.match(await ogUrl() ?? '', new RegExp(`/posts/${withoutDiagram}$`))
    assert.equal(await page.locator('meta[property="og:url"]').count(), 1)
  })
})

describe('small screens', () => {
  it('never scrolls the page sideways', async (t) => {
    const { page } = await open(t, { viewport: { width: 320, height: 640 } })

    for (const path of ['/', ...postIds.map((id) => `/posts/${id}/`)]) {
      await visit(page, path)
      if (await page.locator('.mermaid').count()) {
        await diagramsRendered(page)
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      assert.equal(overflow, 0, `${path} scrolls sideways`)
    }
  })

  it('fills diff rows to the full width of their scrolling block', async (t) => {
    const { page } = await open(t, { viewport: { width: 320, height: 640 } })
    let scrolling = 0

    for (const id of postIds) {
      await visit(page, `/posts/${id}/`)
      const rows = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('code.diff .added, code.diff .deleted')).map((row) => {
          const block = row.closest('pre')!
          return { row: row.getBoundingClientRect().width, block: block.scrollWidth, scrolls: block.scrollWidth > block.clientWidth }
        }))

      for (const { row, block, scrolls } of rows) {
        assert.ok(Math.abs(row - block) <= 1, `${id}: a ${row}px row in a ${block}px block`)
        scrolling += Number(scrolls)
      }
    }

    assert.ok(scrolling > 0, 'no diff block scrolls at this width, so this checked nothing')
  })
})

describe('post styles', () => {
  // This post exists to show every Markdown feature.
  const demoPost = '/posts/the-first-post/'

  const luminance = (color: string) => {
    const [r, g, b] = color.match(/[\d.]+/g)!.map((value) => {
      const channel = Number(value) / 255
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  it('keeps the text of every post at AA contrast in both themes', async (t) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      const { page } = await open(t, { colorScheme })

      for (const id of postIds) {
        await visit(page, `/posts/${id}/`)
        if (await page.locator('.mermaid').count()) {
          await diagramsRendered(page)
        }
        assert.deepEqual(await page.evaluate(lowContrastText), [], `${id} in ${colorScheme}`)
      }
    }
  })

  it('keeps selected text readable in both themes', async (t) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      const { page } = await open(t, { colorScheme })
      await visit(page, demoPost)

      // Links are the worst case, being colored text.
      const { color, backgroundColor } = await page.evaluate(() => {
        const { color, backgroundColor } = getComputedStyle(document.querySelector('.markdown-body > p a')!, '::selection')
        return { color, backgroundColor }
      })
      const [lighter, darker] = [luminance(color), luminance(backgroundColor)].sort((a, b) => b - a)
      const ratio = (lighter + 0.05) / (darker + 0.05)

      assert.ok(ratio >= 4.5, `${colorScheme}: selected links have a contrast of ${ratio.toFixed(2)}`)
    }
  })

  it('sets h4 larger than body text', async (t) => {
    const { page } = await open(t)
    await visit(page, `/posts/${postIds.find((id) => /^#### /m.test(source(id)))}/`)

    const [h4, paragraph] = await page.evaluate(() =>
      ['.markdown-body h4', '.markdown-body > p'].map((selector) => parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize)))
    assert.ok(h4 > paragraph, `h4 is ${h4}px and body text ${paragraph}px`)
  })

  it('sets lists and code blocks like the blocks around them', async (t) => {
    const { page } = await open(t)
    await visit(page, demoPost)

    const [ordered, unordered, paragraph, terminal, diff] = await page.evaluate((selectors) =>
      selectors.map((selector) => {
        const { fontSize, marginTop } = getComputedStyle(document.querySelector(selector)!)
        return { fontSize, marginTop }
      }), [
      '.markdown-body > ol > li',
      '.markdown-body > ul > li',
      '.markdown-body > p',
      '.markdown-body > pre[data-lang=terminal]',
      '.markdown-body > pre.highlight',
    ])
    const taskMarker = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.markdown-body li > input[type=checkbox]')!.closest('li')!).listStyleType)

    assert.equal(ordered.fontSize, paragraph.fontSize)
    assert.equal(unordered.fontSize, paragraph.fontSize)
    assert.equal(terminal.marginTop, diff.marginTop)
    assert.equal(taskMarker, 'none')
  })
})

describe('theme', () => {
  it('matches the page on a light first load', async (t) => {
    const { page } = await open(t, { colorScheme: 'light' })
    await visit(page, '/')
    assert.deepEqual(await themeState(page), LIGHT)
  })

  it('matches the page on a dark first load', async (t) => {
    const { page } = await open(t, { colorScheme: 'dark' })
    await visit(page, '/')
    assert.deepEqual(await themeState(page), DARK)
  })

  it('toggles both ways', async (t) => {
    const { page, errors } = await open(t, { colorScheme: 'dark' })
    await visit(page, '/')

    await page.locator('button[role=switch]').click()
    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'))
    assert.deepEqual(await themeState(page), LIGHT)

    await page.locator('button[role=switch]').click()
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
    assert.deepEqual(await themeState(page), DARK)
    assert.deepEqual(errors, [])
  })

  it('follows the os theme for a visitor without a preference', async (t) => {
    const { page } = await open(t, { colorScheme: 'dark' })
    await visit(page, '/')

    await page.emulateMedia({ colorScheme: 'light' })
    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'))
    assert.deepEqual(await themeState(page), LIGHT)
  })
})

describe('diagrams', () => {
  it('does not load mermaid for a post without diagrams', async (t) => {
    const { page, requests } = await open(t)
    await visit(page, `/posts/${withoutDiagram}/`)
    await page.waitForLoadState('networkidle')
    assert.deepEqual(requests.filter((url) => url.includes('mermaid')), [])
  })

  it('renders diagrams when a post is opened directly', async (t) => {
    const { page, errors } = await open(t)
    await visit(page, `/posts/${withDiagram}/`)
    await diagramsRendered(page)
    assert.deepEqual(errors, [])
  })

  it('sets diagram labels in the article font and inside their boxes', async (t) => {
    const { page } = await open(t)
    // Boxes are sized from the measured text, which a late font would outgrow.
    await page.route('**/*.woff2', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fallback()
    })
    await visit(page, `/posts/${withDiagram}/`)
    await diagramsRendered(page)

    const labels = await page.evaluate(() => {
      const article = getComputedStyle(document.querySelector('.markdown-body')!)
      return Array.from(document.querySelectorAll('.mermaid foreignObject p')).map((label) => {
        const style = getComputedStyle(label)
        const text = document.createRange()
        text.selectNodeContents(label)
        const { width, height } = text.getBoundingClientRect()
        const box = label.closest('foreignObject')!.getBoundingClientRect()
        return {
          label: label.textContent,
          font: style.fontFamily === article.fontFamily,
          size: style.fontSize === getComputedStyle(label.closest('svg')!).fontSize,
          fits: width <= box.width + 1 && height <= box.height + 1,
        }
      })
    })

    assert.ok(labels.length > 0)
    for (const { label, ...checks } of labels) {
      assert.deepEqual(checks, { font: true, size: true, fits: true }, label ?? '')
    }
  })

  it('follows the theme button without moving the page', async (t) => {
    const { page, errors } = await open(t, { colorScheme: 'light' })
    await visit(page, `/posts/${withDiagram}/`)
    await diagramsRendered(page)
    await page.evaluate(() => {
      const { bottom } = document.querySelector('.mermaid')!.getBoundingClientRect()
      window.scrollTo({ top: window.scrollY + bottom, behavior: 'instant' })
    })

    const layout = () => page.evaluate(() => ({
      scrollY: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      diagrams: document.querySelectorAll('.mermaid').length,
    }))
    const before = await layout()
    const light = await nodeFill(page)

    assert.equal(await clickThemeButtonWhileDrawing(page), before.scrollHeight)
    const dark = await nodeFillChanged(page, light)
    assert.deepEqual(await layout(), before)

    await clickThemeButton(page)
    assert.equal(await nodeFillChanged(page, dark), light)
    assert.deepEqual(await layout(), before)
    assert.deepEqual(errors, [])
  })

  it('follows the os theme for a visitor without a preference', async (t) => {
    const { page } = await open(t, { colorScheme: 'light' })
    await visit(page, `/posts/${withDiagram}/`)
    await diagramsRendered(page)
    const light = await nodeFill(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    await nodeFillChanged(page, light)
  })

  it('ends up in the last theme when toggled during a redraw', async (t) => {
    const { page, errors } = await open(t, { colorScheme: 'light' })
    await visit(page, `/posts/${withDiagram}/`)
    await diagramsRendered(page)
    const count = await page.locator('.mermaid').count()
    const light = await nodeFill(page)

    // Light to dark, and back and forth once the first redraw has started.
    await clickThemeButtonWhileDrawing(page, 2)
    await nodeFillChanged(page, light)
    await page.waitForFunction(() => !document.querySelector('.mermaid.drawing'))
    assert.equal(await page.locator('.mermaid').count(), count)
    assert.deepEqual(errors, [])
  })

  it('draws a post opened after a theme change in that theme', async (t) => {
    const { page } = await open(t, { colorScheme: 'light' })
    await visit(page, `/posts/${withDiagram}/`)
    await diagramsRendered(page)
    const light = await nodeFill(page)

    await visit(page, `/posts/${withoutDiagram}/`)
    await clickThemeButton(page)
    await addLink(page, `/posts/${withDiagram}`)
    await diagramsRendered(page)
    assert.notEqual(await nodeFill(page), light)
  })

  it('renders diagrams when opened from the home page', async (t) => {
    const { page } = await open(t)
    await visit(page, '/')
    await openPost(page, withDiagram)
    await page.waitForURL(`**/posts/${withDiagram}/`)
    await diagramsRendered(page)
  })

  it('renders diagrams when moving from post to post', async (t) => {
    const { page } = await open(t)
    await visit(page, `/posts/${withoutDiagram}/`)
    await addLink(page, `/posts/${withDiagram}`)
    await page.waitForURL(`**/posts/${withDiagram}`)
    await diagramsRendered(page)

    await page.goBack()
    await page.waitForURL(`**/posts/${withoutDiagram}/`)
    await page.goForward()
    await page.waitForURL(`**/posts/${withDiagram}`)
    await diagramsRendered(page)
  })
})

describe('navigation', () => {
  it('opens a post from the home page with one clean data request', async (t) => {
    const { page, errors, requests } = await open(t)
    await visit(page, '/')
    await openPost(page, withoutDiagram)
    await page.waitForURL(`**/posts/${withoutDiagram}/`)
    await postTitle(page).waitFor()
    await progressGone(page)

    assert.deepEqual(requests.filter((url) => url.includes('.ctx.js')), [`/posts/${withoutDiagram}/index.ctx.js`])
    assert.deepEqual(errors, [])
  })

  it('shows the 404 view for a link to a missing post, then recovers', async (t) => {
    const { page, errors, logged } = await open(t)
    await visit(page, `/posts/${withoutDiagram}/`)

    await addLink(page, '/posts/missing-post')
    await page.waitForURL('**/posts/missing-post')
    await page.locator('h1', { hasText: '404' }).waitFor()
    await progressGone(page)
    assert.deepEqual(errors, [])
    assert.equal(logged.length, 1, 'the failure should be logged once')

    await page.locator('main a[href="/"]').first().click()
    await page.locator('main a[href^="/posts/"]').first().waitFor()
    await openPost(page, withoutDiagram)
    await postTitle(page).waitFor()
    await progressGone(page)
  })

  for (const path of ['/missing/page/', '/posts/missing-post/']) {
    it(`serves the 404 page for ${path}`, async (t) => {
      const { page, errors } = await open(t)
      const response = await visit(page, path)

      assert.equal(response.status(), 404)
      assert.equal(await page.locator('h1').first().innerText(), '404')
      assert.deepEqual(errors, [])

      await page.locator('main a[href="/"]').first().click()
      await page.locator('main a[href^="/posts/"]').first().waitFor()
    })
  }

  it('releases the scroll lock when leaving with the image viewer open', async (t) => {
    const { page } = await open(t)
    await visit(page, '/')
    await openPost(page, withImage)
    await page.waitForURL(`**/posts/${withImage}/`)

    // ImageView is lazy, so keep clicking until its listeners are attached.
    await page.waitForFunction(() => {
      document.querySelector<HTMLElement>('.markdown-body figure img')?.click()
      return document.documentElement.style.overflowY === 'hidden'
    })

    await page.goBack()
    await page.locator('main a[href^="/posts/"]').first().waitFor()
    await page.waitForFunction(() => document.documentElement.style.overflowY === '')
  })

  it('shows the same date in any time zone', async (t) => {
    const { page } = await open(t, { timezoneId: 'America/Los_Angeles' })
    await visit(page, `/posts/${withoutDiagram}/`)
    const onLoad = await page.locator('article time').first().innerText()

    await page.locator('header a[href="/"]').click()
    await openPost(page, withoutDiagram)
    await page.waitForURL(`**/posts/${withoutDiagram}/`)
    await page.locator('article time').first().waitFor()
    assert.equal(await page.locator('article time').first().innerText(), onLoad)
  })
})

describe('every post', () => {
  for (const id of postIds) {
    it(`${id} is clean`, async (t) => {
      const { page, errors } = await open(t)
      await visit(page, `/posts/${id}/`)

      const report = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.markdown-body a'))
        return {
          rawMarkdown: links
            .map((link) => link.textContent ?? '')
            .filter((text) => /\*\*|^`|`$/.test(text)),
          brokenAnchors: links
            .map((link) => link.getAttribute('href') ?? '')
            .filter((href) => href.startsWith('#') && !document.getElementById(decodeURIComponent(href.slice(1)))),
        }
      })

      assert.deepEqual(report, { rawMarkdown: [], brokenAnchors: [] })
      assert.deepEqual(errors, [])
    })
  }
})
