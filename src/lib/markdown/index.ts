import { marked } from 'marked'
import { parse } from 'yaml'

export let __base = ''
export const __slugs = new Map<string, number>()

import './md-code'
import './md-images'
import './md-links'
import './md-tables'

export function matter<T>(content: string) {
  const pattern = /^\uFEFF?---\r?\n([\s\S]+?)\r?\n---[ \t]*(?:\r?\n|$)/
  const match = content.match(pattern)

  if (match && match[1]) {
    const yaml = match[1].trim()
    const data = parse(yaml)

    return {
      data: data as T,
      content: content.substring(match[0].length),
    }
  } else {
    return {
      data: null as T,
      content,
    }
  }
}

export async function toHtml(markdown: string, base: string) {
  __base = base
  __slugs.clear()
  return await marked.parse(markdown, {
    async: true,
    gfm: true,
    breaks: false
  })
}