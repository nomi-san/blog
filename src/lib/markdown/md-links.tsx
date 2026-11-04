import { marked } from 'marked'
import { dynamic } from '@solidjs/web'
import { __slugs } from '.'
import { renderHtml } from './render'

// Keeps letters and digits of any script, repeated headings get a numeric suffix.
function slugify(html: string) {
  const slug = html
    .replace(/<[^>]+>|&[#\w]+;/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')

  const seen = __slugs.get(slug) ?? 0
  __slugs.set(slug, seen + 1)
  return seen ? `${slug}-${seen}` : slug
}

marked.use({
  renderer: {
    heading(token) {
      const inner = marked.parseInline(token.text, {
        async: false,
        renderer: null,
      })
      const id = slugify(inner)
      const Heading = dynamic(() => `h${token.depth}`)

      return renderHtml(() => (
        <Heading id={id}>
          <a
            href={`#${id}`}
            class='heading-link'
            innerHTML={inner}
          />
        </Heading>
      ))
    },
    link(token) {
      const inner = this.parser.parseInline(token.tokens)
      const external = !/^(\/[^\/]|\?|\#)/.test(token.href)

      return renderHtml(() => (
        <a
          href={token.href}
          title={token.title ?? undefined}
          target={external ? '_blank' : undefined}
          rel={external ? 'external noopener noreferrer' : undefined}
          innerHTML={inner}
        />
      ))
    },
  },
})