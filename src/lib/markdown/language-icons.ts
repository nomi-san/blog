import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const MANIFEST = createRequire(import.meta.url).resolve('material-icon-theme/dist/material-icons.json')

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))

// Fence names that the icon theme knows by another name.
const ALIASES: Record<string, string> = { batch: 'bat' }

const icons = new Map<string, string | undefined>()

function readIcon(lang: string) {
  const name = manifest.languageIds[lang] ?? manifest.fileExtensions[lang]
  const path = manifest.iconDefinitions[name]?.iconPath
  if (!path) {
    return
  }

  const id = `icon-${name}`
  const symbol = readFileSync(join(dirname(MANIFEST), path), 'utf8')
    // Several icons can end up in one page, so their ids have to stay apart.
    .replace(/\sid="/g, ` id="${id}-`)
    .replace(/(url\(#|href="#)/g, `$1${id}-`)
    .replace(' xmlns="http://www.w3.org/2000/svg"', '')
    .replace('<svg', `<symbol id="${id}"`)
    .replace(/<\/svg>\s*$/, '</symbol>')

  return `<svg width="16" height="16">${symbol}<use href="#${id}"/></svg>`
}

// The icon of a code fence language as inline svg, if the theme has one.
export function languageIcon(lang: string) {
  if (!icons.has(lang)) {
    icons.set(lang, readIcon(ALIASES[lang] ?? lang))
  }
  return icons.get(lang)
}

// Keeps the first definition of each icon in a post, where its other uses find it.
export function shareIcons(html: string) {
  const defined = new Set<string>()

  return html.replace(/<symbol id="(icon-[^"]+)".*?<\/symbol>/gs, (symbol, id) => {
    if (defined.has(id)) {
      return ''
    }
    defined.add(id)
    return symbol
  })
}
