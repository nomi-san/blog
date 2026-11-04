import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import type { ViteDevServer } from 'vite'
import { createTestServer } from './helpers'

let vite: ViteDevServer
let matter: (content: string) => { data: any; content: string }
let toHtml: (markdown: string, base: string) => Promise<string>

before(async () => {
  vite = await createTestServer()
  const markdown = await vite.ssrLoadModule('/src/lib/markdown/index.ts')
  matter = markdown.matter
  toHtml = markdown.toHtml
})

after(() => vite.close())

const render = (markdown: string) => toHtml(markdown, '/posts/test')
const fence = (lang: string, ...lines: string[]) => ['```' + lang, ...lines, '```'].join('\n')
const text = (html: string) => html.replace(/<[^>]+>/g, '')
const headingIds = (html: string) =>
  [...html.matchAll(/<h[1-6]\b[^>]*\bid="([^"]*)"/g)].map((match) => match[1])

describe('matter', () => {
  it('reads data and body', () => {
    const { data, content } = matter('---\ntitle: A\n---\nbody\n')
    assert.equal(data.title, 'A')
    assert.equal(content, 'body\n')
  })

  it('ignores dashes inside a value', () => {
    const { data, content } = matter('---\ntitle: A --- B\ndate: 2020-01-01\n---\nbody\n')
    assert.equal(data.title, 'A --- B')
    assert.equal(data.date, '2020-01-01')
    assert.equal(content, 'body\n')
  })

  it('handles crlf line endings', () => {
    const { data, content } = matter('---\r\ntitle: A\r\n---\r\nbody')
    assert.equal(data.title, 'A')
    assert.equal(content, 'body')
  })

  it('handles a byte order mark', () => {
    const { data, content } = matter('\uFEFF---\ntitle: A\n---\nbody')
    assert.equal(data.title, 'A')
    assert.equal(content, 'body')
  })

  it('returns null data without frontmatter', () => {
    const { data, content } = matter('just text')
    assert.equal(data, null)
    assert.equal(content, 'just text')
  })

  it('needs the closing fence on its own line', () => {
    assert.equal(matter('---\ntitle: A\n---more\n').data, null)
  })
})

describe('links', () => {
  it('renders bold link text', async () => {
    const html = await render('[**bold**](https://a.example)')
    assert.ok(html.includes('<strong>bold</strong>'))
    assert.ok(!html.includes('**bold**'))
  })

  it('renders code link text', async () => {
    const html = await render('[`code`](https://a.example)')
    assert.ok(html.includes('<code>code</code>'))
  })

  it('renders an image inside a link', async () => {
    const html = await render('[![alt](/i.png)](https://a.example)')
    assert.match(html, /<img\b/)
    assert.ok(!html.includes('![alt]'))
  })

  it('keeps the title', async () => {
    assert.match(await render('[a](https://a.example "Hint")'), /title="Hint"/)
  })

  it('opens external links in a new tab', async () => {
    const html = await render('[a](https://a.example)')
    assert.match(html, /target="_blank"/)
    assert.match(html, /rel="external noopener noreferrer"/)
  })

  it('keeps internal links in the same tab', async () => {
    const html = await render('[a](/posts/other)')
    assert.match(html, /href="\/posts\/other"/)
    assert.doesNotMatch(html, /target=/)
  })
})

describe('heading ids', () => {
  it('drops markup and punctuation', async () => {
    assert.deepEqual(headingIds(await render('## **Bold** `code` (x)?')), ['bold-code-x'])
  })

  it('keeps letters of any script', async () => {
    assert.deepEqual(headingIds(await render('## Nghi\u00EAn c\u1EE9u')), ['nghi\u00EAn-c\u1EE9u'])
  })

  it('keeps combining marks', async () => {
    assert.deepEqual(headingIds(await render('## Ca\u0300')), ['ca\u0300'])
  })

  it('makes repeated headings unique', async () => {
    assert.deepEqual(headingIds(await render('## Usage\n\n## Usage\n\n## Usage')), ['usage', 'usage-1', 'usage-2'])
  })

  it('starts over for each document', async () => {
    await render('## Usage')
    assert.deepEqual(headingIds(await render('## Usage')), ['usage'])
  })

  it('leaves no character that breaks url decoding', async () => {
    const [id] = headingIds(await render('## 100% done'))
    assert.equal(id, '100-done')
    assert.equal(decodeURIComponent(id), id)
  })

  it('links each heading to its own id', async () => {
    assert.match(await render('## Some title'), /href="#some-title"/)
  })
})

describe('code blocks', () => {
  it('escapes a block without language', async () => {
    const html = await render(fence('', '#include <stdio.h>', 'a && b'))
    assert.ok(!html.includes('<stdio.h>'))
    assert.ok(html.includes('&lt;stdio.h&gt;'))
    assert.ok(html.includes('a &amp;&amp; b'))
  })

  it('escapes a block with an unknown language', async () => {
    const html = await render(fence('nosuchlang', '<img src=x onerror="alert(1)">'))
    assert.doesNotMatch(html, /<img\b/)
  })

  it('highlights a known language', async () => {
    assert.match(await render(fence('js', 'const a = 1')), /class="token keyword"/)
  })

  it('escapes context and removed lines of a diff', async () => {
    const html = await render(fence('cpp',
      ' std::vector<int> kept;',
      '-std::vector<char> removed;',
      '+std::vector<long> added;',
    ))
    assert.match(html, /class="added"/)
    assert.match(html, /class="deleted"/)
    assert.ok(!html.includes('<int>'))
    assert.ok(!html.includes('<char>'))
    assert.ok(html.includes('std::vector&lt;int&gt; kept;'))
    assert.ok(html.includes('std::vector&lt;char&gt; removed;'))
  })

  it('removes the diff mark from the line', async () => {
    const html = await render(fence('text', '+added', '-removed'))
    assert.ok(text(html).includes('added'))
    assert.ok(!text(html).includes('+added'))
    assert.ok(!text(html).includes('-removed'))
  })

  it('does not treat ++ and -- as diff marks', async () => {
    const html = await render(fence('c', '++i;', '--j;'))
    assert.doesNotMatch(html, /class="(added|deleted)"/)
  })

  it('keeps lua comments out of diff mode', async () => {
    const html = await render(fence('lua', '-- comment', '---@param x number', '--[[', 'block', ']]', 'local a = 1'))
    assert.doesNotMatch(html, /class="(added|deleted)"/)
    assert.match(html, /class="token comment"/)
    assert.ok(text(html).includes('-- comment'))
  })

  it('keeps a lua comment next to real diff marks', async () => {
    const html = await render(fence('lua', '-- kept', '+-- added', '-local removed = 1'))
    assert.equal(html.match(/class="added"/g)?.length, 1)
    assert.equal(html.match(/class="deleted"/g)?.length, 1)
    assert.match(html, /class="token comment">-- added/)
    assert.ok(text(html).includes('-- kept'))
    assert.ok(!text(html).includes('+-- added'))
  })

  for (const lang of ['yaml', 'yml', 'markdown', 'md']) {
    it(`keeps ${lang} list items out of diff mode`, async () => {
      const html = await render(fence(lang, '- first', '- second'))
      assert.doesNotMatch(html, /class="(added|deleted)"/)
      assert.ok(text(html).includes('- first'))
    })
  }

  it('still allows diff marks in yaml', async () => {
    assert.match(await render(fence('yaml', 'a: 1', '+enable: true')), /class="added"/)
  })

  it('escapes mermaid source', async () => {
    const html = await render(fence('mermaid', 'graph TD', 'A<-->B'))
    assert.match(html, /class="mermaid"/)
    assert.ok(html.includes('A&lt;-->B'))
  })

  it('escapes terminal input', async () => {
    const html = await render(fence('terminal', 'cat <file>'))
    assert.match(html, /class="stdin"/)
    assert.ok(html.includes('cat &lt;file'))
  })
})

describe('post html', () => {
  it('has no hydration keys', async () => {
    const html = await render([
      '## Title',
      '[link](https://a.example)',
      '![Caption](/x.png)',
      fence('js', 'const a = 1'),
      fence('c', '+int a;'),
      fence('terminal', 'ls'),
    ].join('\n\n'))
    assert.doesNotMatch(html, /\b_hk=|data-hk=/)
  })
})

describe('images', () => {
  it('rebases a relative source on the post', async () => {
    assert.match(await render('![](./x.png)'), /src="\/posts\/test\/x\.png"/)
  })

  it('reads caption, height and wide from the alt text', async () => {
    const html = await render('![A caption h=300 wide](/x.png)')
    assert.match(html, /<figcaption\b[^>]*>A caption<\/figcaption>/)
    assert.match(html, /alt="A caption"/)
    assert.match(html, /height: ?300px/)
    assert.ok(html.includes('lg:mx-[-8rem]'))
  })

  it('leaves no stray class when not wide', async () => {
    assert.doesNotMatch(await render('![](/x.png)'), /false/)
  })
})
