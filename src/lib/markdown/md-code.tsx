import { For, Show, VoidComponent } from 'solid-js'
import { marked } from 'marked'
import { refractor } from 'refractor/all'
import { toHtml } from 'hast-util-to-html'
import { renderToString } from 'solid-js/web'

function highlight(code: string, lang: string) {
  if (lang in refractor.languages) {
    const tree = refractor.highlight(code, lang)
    return toHtml(tree as any)
  }
  return code
}

const CodeBlock: VoidComponent<{ code: string; lang: string }> = (props) => {
  const hasDiff = /(^|\n)(\+[^\+]|\-[^\-])/gm.test(props.code)

  if (!hasDiff) {
    const html = highlight(props.code, props.lang)
    return (
      <div class="relative my-8">
        <pre class="highlight notranslate" data-lang={props.lang}>
          <code innerHTML={html} />
        </pre>
        <span class="language absolute top-1 right-2 text-sm pointer-events-none">{props.lang}</span>
      </div>
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
        <For each={lines}>
          {((line, index) => (
            <div
              class={map[index()] === true
                ? 'added'
                : map[index()] === false
                  ? 'deleted'
                  : ''}
              innerHTML={line}
            />
          ))}
        </For>
      </code>
    </pre>
  )
}

const Terminal: VoidComponent<{ code: string }> = (props) => {
  const lines = props.code.split(/\r?\n/)
  const output = Array<string>()
  const separator = lines.findIndex((line) => /^___$/.test(line))

  if (separator !== -1) {
    output.push(...lines.splice(separator, lines.length - separator))
    output.shift()
  }

  return (
    <pre class='notranslate' data-lang='terminal'>
      <code class='stdin'>
        {lines.map((line) => <div>{line}</div>)}
      </code>
      <Show when={output.length > 0}>
        <code
          class='stdout'
          innerHTML={output.join('\n')}
        />
      </Show>
    </pre>
  )
}

marked.use({
  renderer: {
    code: (token) =>
      renderToString(() => {
        const info = token.lang || ''
        const lang = info.match(/^\w+/)?.at(0)?.trim() || ''
        const file = info.match(/\!([^\@\n]+)/)?.at(1)?.trim()
        const legend = info.match(/\@([^\!\n]+)/)?.at(1)?.trim()

        if (lang === 'mermaid') {
          return <div class='mermaid'>{token.text}</div>
        }

        if (lang === 'terminal') {
          return (
            <Terminal code={token.text} />
          )
        }

        return (
          <CodeBlock code={token.text} lang={lang} />
        )
      }),
  },
})