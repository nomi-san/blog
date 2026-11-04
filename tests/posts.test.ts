import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import type { ViteDevServer } from 'vite'
import { createTestServer } from './helpers'

const repoRoot = process.cwd()
let vite: ViteDevServer
let site: string
let loads = 0

before(async () => {
  vite = await createTestServer()
})

after(async () => {
  process.chdir(repoRoot)
  await vite.close()
})

// posts.ts reads ./posts and caches it, so each case gets its own folder and module.
function usePosts(posts: Record<string, string>) {
  process.chdir(repoRoot)
  if (site) {
    rmSync(site, { recursive: true, force: true })
  }

  site = mkdtempSync(join(tmpdir(), 'blog-posts-'))
  for (const [id, source] of Object.entries(posts)) {
    mkdirSync(join(site, 'posts', id), { recursive: true })
    writeFileSync(join(site, 'posts', id, 'index.md'), source)
  }
  process.chdir(site)

  return vite.ssrLoadModule(`/src/lib/posts.ts?case=${loads++}`)
}

const post = (fields: string, body = 'Body') => `---\n${fields}\n---\n${body}\n`

describe('posts', () => {
  it('normalizes a post', async () => {
    const { getPost } = await usePosts({
      first: post('title: First\ndate: 2021-05-06\ntags: a, b; c\nimage: ./cover.png'),
    })
    const first = await getPost('first')
    assert.equal(first.id, 'first')
    assert.equal(first.path, '/posts/first')
    assert.equal(first.date, 'Thu, 06 May 2021 00:00:00 GMT')
    assert.deepEqual(first.tags, ['a', 'b', 'c'])
    assert.equal(first.image, '/posts/first/cover.png')
    assert.ok(first.html.includes('Body'))
  })

  it('returns undefined for an unknown post', async () => {
    const { getPost } = await usePosts({ first: post('title: First\ndate: 2021-05-06') })
    assert.equal(await getPost('nope'), undefined)
  })

  it('lists newest first, without the html', async () => {
    const { listPosts } = await usePosts({
      older: post('title: Older\ndate: 2020-01-01'),
      newer: post('title: Newer\ndate: 2022-01-01'),
    })
    const list = await listPosts()
    assert.deepEqual(list.map((item: any) => item.id), ['newer', 'older'])
    assert.equal(list[0].html, undefined)
  })

  it('rejects a post without frontmatter and names the file', async () => {
    const { listPosts } = await usePosts({ draft: 'Just text\n' })
    await assert.rejects(listPosts(), /Missing frontmatter:.*draft/)
  })

  it('rejects a post without title', async () => {
    const { listPosts } = await usePosts({ draft: post('date: 2021-05-06') })
    await assert.rejects(listPosts(), /Missing title:.*draft/)
  })

  it('rejects a post without date', async () => {
    const { listPosts } = await usePosts({ draft: post('title: Draft') })
    await assert.rejects(listPosts(), /Missing or invalid date:.*draft/)
  })

  it('rejects a post with an invalid date', async () => {
    const { listPosts } = await usePosts({ draft: post('title: Draft\ndate: soon') })
    await assert.rejects(listPosts(), /Missing or invalid date:.*draft/)
  })

  it('waits for the full load when calls overlap', async () => {
    const many: Record<string, string> = {}
    for (let i = 0; i < 300; i++) {
      many[`post-${i}`] = post(`title: Post ${i}\ndate: 2021-05-06`)
    }

    const { getPost, listPosts } = await usePosts(many)
    const loading = listPosts()
    await new Promise((resolve) => setTimeout(resolve, 5))

    // A caller arriving mid-load must not read a half filled cache.
    assert.ok(await getPost('post-299'))
    assert.equal((await loading).length, 300)
  })
})
