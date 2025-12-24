import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { matter, toHtml } from './markdown'

export type PostHeader = {
  id: string
  title: string
  description: string
  image?: string
  color?: string
  tags: string[]
  date: string
  path: string
}

export type PostData = PostHeader & {
  html: string
}

const _postCache = new Map<string, PostData>()

async function fetchPosts() {
  if (_postCache.size > 0) {
    return
  }

  const root = join(process.cwd(), 'posts')
  const entries = await fs.readdir(root, { withFileTypes: true })

  for (const dir of entries) {
    if (!dir.isDirectory()) {
      continue
    }

    const path = join(root, dir.name, 'index.md')
    if (existsSync(path)) {

      const raw = await fs.readFile(path, 'utf-8')
      const { data, content } = matter<PostData>(raw)

      data.id = dir.name
      data.path = `/posts/${data.id}`
      data.html = await toHtml(content, data.path)

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

      _postCache.set(data.id, data)
    }
  }
}

export async function getPost(id: string) {
  await fetchPosts()
  return _postCache.get(id)
}

export async function listPosts() {
  await fetchPosts()
  return Array.from(_postCache.values())
    .map((post) => {
      const { html, ...rest } = post
      return rest as PostHeader
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
}