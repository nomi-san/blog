import { matter, toHtml } from './markdown.ts'
import { exists } from 'https://deno.land/std@0.200.0/fs/exists.ts'

export interface IPost {
  id: string
  title: string
  description: string
  image?: string
  tags: string[]
  date: Date
  path: string
  html?: string
}

const map = new Map<string, IPost>()
const root = `${Deno.cwd()}/static/posts`

for await (const dir of Deno.readDir(root)) {
  if (dir.isDirectory) {
    const path = `${root}/${dir.name}/index.md`
    if (await exists(path)) {
      const raw = await Deno.readTextFile(path)
      const { data, content } = matter<IPost>(raw)

      data.id = dir.name
      data.path = `/posts/${data.id}`
      data.html = await toHtml(content, data.path)

      if (typeof data.date === 'string') {
        data.date = new Date(data.date)
      }

      if (typeof data.image === 'string') {
        if (data.image.startsWith('./')) {
          data.image = data.path + data.image.substring(1)
        }
      }

      if (!Array.isArray(data.tags)) {
        data.tags = []
      }

      map.set(data.id, data)
    }
  }
}

export const hasPost = (id: string) => map.has(id)
export const getPost = (id: string) => map.get(id)!

export const listPosts = () =>
  [...map.values()]
    .map((post) => {
      const r = { ...post }
      delete r.html
      return r
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
