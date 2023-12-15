import { marked } from 'marked'
import { refractor } from 'npm:refractor/lib/all.js'
import { toHtml } from 'npm:hast-util-to-html'
import { h, renderSSR } from 'nano-jsx'

marked.use({
  renderer: {
    code: (code, info, escaped) =>
      renderSSR(() => {
        info = info || ''
        const lang = info.match(/^\w+/)?.at(0)?.trim() || 'plain'
        const file = info.match(/\!([^\@\n]+)/)?.at(1)?.trim()
        const legend = info.match(/\@([^\!\n]+)/)?.at(1)?.trim()

        if (lang === 'mermaid') {
          return <div class='mermaid'>{code}</div>
        }

        if (lang === 'terminal') {
          return <Terminal code={code} />
        }

        return <CodeBlock code={code} lang={lang} />
      }),
  },
})

function highlight(code: string, lang: string) {
  if (lang in refractor.languages) {
    const tree = refractor.highlight(code, lang)
    return toHtml(tree as any)
  }
  return code
}

function CodeBlock(props: { code: string; lang: string }) {
  const hasDiff = /(^|\n)(\+[^\+]|\-[^\-])/gm.test(props.code)

  if (!hasDiff) {
    const html = highlight(props.code, props.lang)
    return (
      <pre class='highlight notranslate' data-lang={props.lang}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    )
  }

  const map: Record<number, boolean> = {}
  const lines = props.code.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('+') && !line.startsWith('++')) {
      map[i] = true
      lines[i] = highlight(line.substring(1), props.lang)
    } else if (line.startsWith('-') && !line.startsWith('--')) {
      map[i] = false
      lines[i] = line.substring(1)
    } else if (line === '') {
      lines[i] = '\n'
    }
  }

  return (
    <pre class='highlight notranslate' data-lang={props.lang}>
      <code class='diff'>
        {lines.map((line, i) => (
          <div
            class={map[i] === true
              ? 'added'
              : map[i] === false
              ? 'deleted'
              : ''}
            dangerouslySetInnerHTML={{ __html: line }}
          />
        ))}
      </code>
    </pre>
  )
}

function Terminal(props: { code: string }) {
  const lines = props.code.split(/\r?\n/)
  const output = Array<string>()
  const separator = lines.findIndex((line) => /^___$/.test(line))

  if (separator !== -1) {
    output.push(...lines.splice(separator, lines.length - separator))
    output.shift()
  }

  return (
    <pre class='notranslate'>
      <code class='stdin'>
        {lines.map((line) => <div>{line}</div>)}
      </code>
      {output.length > 0 &&
        (
          <code
            class='stdout'
            dangerouslySetInnerHTML={{ __html: output.join('\n') }}
          />
        )}
    </pre>
  )
}
