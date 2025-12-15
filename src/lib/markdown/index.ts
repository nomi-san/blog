import { marked } from 'marked'
import { parse } from 'yaml'

export let __base = ''

import './md-code'
import './md-images'
import './md-links'

export function matter<T>(content: string) {
  const pattern = /^---\r?\n([\s\S]+?)\r?\n---/
  const match = content.match(pattern)

  if (match && match[1]) {
    const yaml = match[1].trim()
    const data = parse(yaml)

    const second = content.indexOf('---', 4)
    const third = content.indexOf('\n', second)
    const markdown = content.substring(third + 1)

    return {
      data: data as T,
      content: markdown,
    }
  } else {
    return {
      data: null as T,
      content,
    }
  }
}

export function toHtml(markdown: string, base: string) {
  __base = base
  return marked.parse(markdown, {
    async: false,
  })
}