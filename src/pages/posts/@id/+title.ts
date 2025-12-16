/// env: client, server

import type { PageContext } from 'vike/types'
import type { PostData } from '$lib/posts'

export function title(ctx: PageContext<PostData>) {
  return ctx.data.title
}