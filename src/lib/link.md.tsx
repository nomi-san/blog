import { marked } from 'marked'
import { h, renderSSR } from 'nano-jsx'

marked.use({
  renderer: {
    link: (href, _, text) =>
      renderSSR(() => {
        if (/^(\/[^\/]|\?|\#)/.test(href)) {
          return (
            <a
              href={href}
              dangerouslySetInnerHTML={{ __html: text }}
            />
          )
        }
        return (
          <a
            href={href}
            target='_blank'
            rel='external noopener noreferrer'
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )
      }),
    heading(text, level, raw) {
      const id = raw.toLowerCase().replace(/\s+/g, '-').replace(/[\'\"]/, '')
      const inner = renderSSR(() => (
        <a
          href={`#${id}`}
          class='heading-link'
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ))
      return `<h${level} id="${id}">${inner}</h${level}>`
    },
  },
})
