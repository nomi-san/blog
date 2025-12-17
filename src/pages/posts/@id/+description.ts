/// env: client, server

import type { PageContext } from 'vike/types'
import type { PostData } from '$lib/posts'

export function description(ctx: PageContext<PostData>) {
  return ctx.data.description
}