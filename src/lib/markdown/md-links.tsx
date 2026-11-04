import { marked } from 'marked'
import { Dynamic, renderToString } from 'solid-js/web'

marked.use({
  renderer: {
    heading(token) {
      const raw = token.text.replace(/<[^>]+>/g, '')
      const id = raw.toLowerCase().replace(/\s+/g, '-').replace(/[\'\"]/, '')
      const inner = marked.parseInline(token.text, {
        async: false,
        renderer: null,
      })

      return renderToString(() => (
        <Dynamic component={`h${token.depth}`} id={id}>
          <a
            href={`#${id}`}
            class='heading-link'
            innerHTML={inner}
          />
        </Dynamic>
      ))
    },
    link(token) {
      const inner = this.parser.parseInline(token.tokens)
      const external = !/^(\/[^\/]|\?|\#)/.test(token.href)

      return renderToString(() => (
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