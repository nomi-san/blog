import type { Config } from 'vike/types'
import vikeSolid from 'vike-solid/config'
import blog from '$blog-config'

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: blog.title,
  description: blog.description,
  image: blog.cover_image,
  favicon: '/favicon.ico',

  prerender: true,
  extends: [vikeSolid],

} satisfies Config
