import { extname } from 'node:path'
import { generateHydrationScript, renderToStream, ssr, type AssetManifest, type JSX } from '@solidjs/web'
import { getPreloader, getPrerenderRoutes } from './router'
import { Root } from './root'
import { themeScript } from '$lib/theme'

export { getPrerenderRoutes }

// Solid only writes a real <title> when the output has a </head>. With the onHead option
// the title is set by an inline script, which crawlers don't run. So render an empty head
// first, let Solid fill it, then split it off for the template.
export async function renderApp(code: () => JSX.Element, manifest?: AssetManifest) {
  let failure: unknown
  const html = await renderToStream(() => [ssr(['<head></head>']), code()], {
    manifest,
    // Also hears what a boundary contained: a broken page must fail the build
    // instead of being published with the fallback in place.
    onError: (error) => {
      failure ??= error
    },
  })
  if (failure) {
    throw failure
  }

  const headEnd = html.indexOf('</head>')
  return {
    head: html.slice('<head>'.length, headEnd),
    body: html.slice(headEnd + '</head>'.length),
  }
}

export async function render(
  url: string,
  ssrManifest?: Record<string, string[]>,
  clientManifest?: AssetManifest,
) {
  const { head, body } = await renderApp(() => <Root url={url} />, clientManifest)

  let context: string = ''

  const preload = getPreloader(url)
  if (preload != null) {
    const data = await preload()
    if (data !== undefined) {
      const json = JSON.stringify(data)
      context = `export default ${json};`
    }
  }

  const heads = [
    head,
    renderPreloadLinks(ssrManifest || {}),
    `<script>${themeScript}</script>`,
    generateHydrationScript(),
  ]

  return [body, heads.join('\n'), context]
}

function renderPreloadLinks(manifest: Record<string, string[]>) {
  let links = ''
  const seen = new Set()
  for (const files of Object.values(manifest)) {
    for (const file of files) {
      if (!seen.has(file)) {
        seen.add(file)
        const link = renderPreloadLink(file)
        if (link) {
          links += link + '\n'
        }
      }
    }
  }
  return links
}

function renderPreloadLink(file: string) {
  switch (extname(file)) {
    // case '.js':
    //   return `<link rel="modulepreload" crossorigin href="${file}">`
    // case '.css':
    //   return `<link rel="stylesheet" href="${file}">`
    case '.woff':
      return `<link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`
    case '.woff2':
      // Not every page has italic text, the ones that do load these when they need them.
      return file.includes('-italic')
        ? ''
        : `<link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
    default:
      return ''
  }
}
