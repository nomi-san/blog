import { marked } from 'marked'
import { Dynamic, renderToString } from 'solid-js/web'

marked.use({
  renderer: {
    heading(token) {
      const raw = token.text.replace(/<[^>]+>/g, '')
      const id = raw.toLowerCase().replace(/\s+/g, '-').replace(/[\'\"]/, '')

      return renderToString(() => (
        <Dynamic component={`h${token.depth}`} id={id}>
          <a
            href={`#${id}`}
            class='heading-link'
            innerHTML={token.text}
          />
        </Dynamic>
      ))
    },
    link: (token) => renderToString(() => {
      const href = token.href
      const text = token.text
      if (/^(\/[^\/]|\?|\#)/.test(href)) {
        return (
          <a
            href={href}
            innerHTML={text}
          />
        )
      }
      return (
        <a
          href={href}
          target='_blank'
          rel='external noopener noreferrer'
          innerHTML={text}
        />
      )
    }),
  },
})