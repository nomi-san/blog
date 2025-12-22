import { basename, extname } from 'node:path'
import { renderToStringAsync } from 'solid-js/web'
import { getPreloader, getPrerenderRoutes } from './router'
import { Root } from './root'

export { getPrerenderRoutes }

export async function render(url: string, manifest?: Record<string, string[]>) {
  let preloadData: any | undefined

  const preloader = getPreloader(url)
  if (typeof preloader === 'function') {
    preloadData = await preloader()
  }

  const heads = Array<string>()
  const html = await renderToStringAsync(() => <Root url={url} preloadData={preloadData} />)

  if (preloadData != null) {
    const json = JSON.stringify(preloadData)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
    heads.push(`<script>window.__PRELOAD_DATA__ = ${json}</script>`)
  }

  return [html, heads.join('\n')]
}

function renderPreloadLinks(modules: Set<string>, manifest: Record<string, string[]>) {
  let links = ''
  const seen = new Set()
  modules.forEach((id) => {
    const files = manifest[id]
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file)
          const filename = basename(file)
          if (manifest[filename]) {
            for (const depFile of manifest[filename]) {
              links += renderPreloadLink(depFile)
              seen.add(depFile)
            }
          }
          links += renderPreloadLink(file)
        }
      })
    }
  })
  return links
}

function renderPreloadLink(file: string) {
  switch (extname(file)) {
    case '.js':
      return ` <link rel="modulepreload" crossorigin href="${file}">`
    case '.css':
      return ` <link rel="stylesheet" href="${file}">`
    case '.woff':
      return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`
    case '.woff2':
      return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
    case '.gif':
      return ` <link rel="preload" href="${file}" as="image" type="image/gif">`
    case '.jpg':
    case '.jpeg':
      return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`
    case '.png':
      return ` <link rel="preload" href="${file}" as="image" type="image/png">`
    default:
      // TODO
      return ''
  }
}