import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { before, describe, it } from 'node:test'

const postIds = readdirSync('posts').filter((id) => existsSync(join('posts', id, 'index.md')))
const read = (...path: string[]) => readFileSync(join('dist', ...path), 'utf8')

function readData(...path: string[]) {
  const source = read(...path, 'index.ctx.js')
  return JSON.parse(source.slice('export default '.length, source.lastIndexOf(';')))
}

before(() => {
  execSync('pnpm build', { stdio: 'pipe' })
}, { timeout: 300_000 })

describe('prerendered site', () => {
  it('lists every post on the home page', () => {
    const home = read('index.html')
    for (const id of postIds) {
      assert.ok(home.includes(`href="/posts/${id}/"`), `${id} is missing from the home page`)
    }
  })

  it('emits data for the home page', () => {
    assert.equal(readData().length, postIds.length)
  })

  it('emits a 404 page where static hosts look for it', () => {
    assert.match(read('404.html'), /<title[^>]*>Not Found<\/title>/)
    assert.equal(existsSync(join('dist', '404')), false)
  })

  it('leaves no template slot behind', () => {
    for (const page of ['index.html', '404.html']) {
      assert.doesNotMatch(read(page), /<!--app-(head|html)-->/)
    }
  })

  for (const id of postIds) {
    it(`prerenders ${id}`, () => {
      const page = read('posts', id, 'index.html')
      const data = readData('posts', id)

      assert.ok(page.includes(data.html), 'page body differs from the post data')
      assert.doesNotMatch(page, /<!--app-(head|html)-->/)
      assert.match(page, /<title[^>]*>[^<]+<\/title>/)
      assert.match(page, /property="og:title"/)
    })
  }
})
