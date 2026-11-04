import { For, Show, VoidComponent } from 'solid-js'
import { marked } from 'marked'
import { refractor } from 'refractor/all'
import { toHtml } from 'hast-util-to-html'
import { renderHtml } from './render'

function escapeHtml(code: string) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlight(code: string, lang: string) {
  if (refractor.registered(lang)) {
    const tree = refractor.highlight(code, lang)
    return toHtml(tree as any)
  }
  return escapeHtml(code)
}

// In these languages a leading "- " or "+ " is a list item, not a diff mark.
const LIST_LANGS = new Set(['yaml', 'yml', 'markdown', 'md'])

function diffMark(line: string, lang: string) {
  const mark = line[0]
  if ((mark !== '+' && mark !== '-') || line[1] === mark) return
  if (line[1] === ' ' && LIST_LANGS.has(lang)) return
  return mark
}

const CodeBlock: VoidComponent<{ code: string; lang: string }> = (props) => {
  const lines = props.code.split(/\r?\n/)
  const hasDiff = lines.some((line) => diffMark(line, props.lang))

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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const mark = diffMark(line, props.lang)
    if (mark === '+') {
      map[i] = true
      lines[i] = highlight(line.substring(1), props.lang)
    } else if (mark === '-') {
      map[i] = false
      lines[i] = escapeHtml(line.substring(1))
    } else if (line === '') {
      lines[i] = '\n'
    } else {
      lines[i] = escapeHtml(line)
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
      renderHtml(() => {
        const info = token.lang || ''
        const lang = info.match(/^\w+/)?.at(0)?.trim() || ''

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