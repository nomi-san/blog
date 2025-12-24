import { basename, extname } from 'node:path'
import { renderToStringAsync, generateHydrationScript, getAssets } from 'solid-js/web'
import { getPreloader, getPrerenderRoutes } from './router'
import { Root } from './root'
import { themeScript } from '$lib/theme'

export { getPrerenderRoutes }

export async function render(url: string, manifest?: Record<string, string[]>) {
  const heads = Array<string>()
  const html = await renderToStringAsync(() => <Root url={url} />)
  let context: string = ''

  const preload = getPreloader(url)
  if (preload != null) {
    const data = await preload()
    if (data !== undefined) {
      const json = JSON.stringify(data)
      context = `export default ${json};`
    }
  }

  heads.push(getAssets().replace(/\>\</g, '>\n<'))
  heads.push(renderPreloadLinks(manifest || {}))
  heads.push(`<script>${themeScript}</script>`)
  heads.push(generateHydrationScript())

  return [html, heads.join('\n'), context]
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
      return `<link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
    default:
      return ''
  }
}