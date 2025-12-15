import fs from 'node:fs'
import { join } from 'node:path'
import { matter, toHtml } from './markdown'

export type PostHeader = {
  id: string
  title: string
  description: string
  image?: string
  tags: string[]
  date: string
  path: string
}

export type PostData = PostHeader & {
  html: string
}

const map = new Map<string, PostData>()
const root = join(process.cwd(), 'posts')

for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
  if (dir.isDirectory()) {

    const path = join(root, dir.name, 'index.md')

    if (fs.existsSync(path)) {
      const raw = fs.readFileSync(path, 'utf-8')
      const { data, content } = matter<PostData>(raw)

      data.id = dir.name
      data.path = `/posts/${data.id}`
      data.html = toHtml(content, data.path)

      if (typeof data.date === 'string') {
        data.date = new Date(data.date).toUTCString()
      }

      // Normalize image path
      if (typeof data.image === 'string') {
        if (data.image.startsWith('./')) {
          data.image = data.path + data.image.substring(1)
        }
      }

      // Normalize tags
      if (typeof data.tags === 'string') {
        const stags = data.tags as string
        data.tags = stags.split(/[,;\|]/).map((t) => t.trim())
      } else if (!Array.isArray(data.tags)) {
        data.tags = []
      }

      map.set(data.id, data)
    }
  }
}

export const hasPost = (id: string) => map.has(id)
export const getPost = (id: string) => map.get(id)

export const listPosts = () =>
  [...map.values()]
    .map((post) => {
      const { html, ...rest } = post
      return rest as PostHeader
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
