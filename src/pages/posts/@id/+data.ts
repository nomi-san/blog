/// env: server

import { PageContextServer } from 'vike/types'
import { getPost } from '$lib/posts'
import { render } from 'vike/abort'

async function data(ctx: PageContextServer) {
  const id = ctx.routeParams.id
  const post = await getPost(id)

  if (post == null) {
    throw render(404, `Post '${id}' doesn't exist.`)
  }

  return post
}

export { data }