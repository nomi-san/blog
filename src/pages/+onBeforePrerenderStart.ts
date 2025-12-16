/// env: server

import { listPosts } from '$lib/posts'

let called = false

export async function onBeforePrerenderStart() {
  if (called) return []
  called = true

  const posts = await listPosts()
  return posts.map(post => post.path)
}