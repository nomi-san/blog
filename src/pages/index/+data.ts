/// env: server

import { PageContextServer } from 'vike/types'
import { listPosts } from '$lib/posts'

async function data(ctx: PageContextServer) {
  const posts = await listPosts()
  return posts
}

export { data }