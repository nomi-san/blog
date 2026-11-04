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

  return readFileSync(join(dirname(MANIFEST), path), 'utf8')
    .replace('<svg', '<svg width="16" height="16"')
    // Several icons can end up in one page, so their ids have to stay apart.
    .replace(/\sid="/g, ` id="${name}-`)
    .replace(/(url\(#|href="#)/g, `$1${name}-`)
}

// The icon of a code fence language as inline svg, if the theme has one.
export function languageIcon(lang: string) {
  if (!icons.has(lang)) {
    icons.set(lang, readIcon(ALIASES[lang] ?? lang))
  }
  return icons.get(lang)
}
