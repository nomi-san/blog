## [nomi.dev](https://nomi.dev/)

A markdown blog on a small handmade engine built with [SolidJS](https://www.solidjs.com/) 2.0 and
[Vite](https://vite.dev/), with no meta-framework. Every page is prerendered to static HTML and
hydrated in the browser, so the output can be served from any static host.

The engine is under 600 lines in [`src/engine`](src/engine): file-based routes, per-page data
and a prerender script.

### Getting started

Requires Node `>=22.12.0` and pnpm 9.

```sh
pnpm i
pnpm dev       # dev server, reloads when a post changes
pnpm build     # bundle and prerender to dist/
pnpm preview   # serve dist/
```

`pnpm dev` renders on the client only. It never hydrates, so check hydration changes with
`pnpm build && pnpm preview` or `pnpm test:e2e`.

The Solid packages are pinned to exact 2.0 release candidates, because behavior can change between
prereleases. Run `pnpm test` and `pnpm test:e2e` when bumping them.

### Project layout

| Path | Contents |
| --- | --- |
| `blog.config.ts` | Site title, description, author and social links |
| `posts/<id>/` | One post: `index.md` and its assets |
| `public/` | Static files copied to the site root |
| `src/engine/` | The engine |
| `src/pages/` | Routes |
| `src/components/` | UI components |
| `src/lib/` | Post loading, markdown renderers and theme state |
| `tests/` | Tests |

Import aliases: `$lib`, `$components`, `$blog-config` and `@engine`.

### How the engine works

1. `vite build` bundles the client into `dist/` and copies the post assets. The build fails if
   server code reached a client chunk.
2. `src/engine/prerender.ts` starts Vite in middleware mode and loads the server entry. For each
   route it renders the page, fills `index.html` and writes `dist/<route>/index.html`, plus the
   page's data as `dist/<route>/index.ctx.js`. Solid reads Vite's client manifest to link the
   chunks each page needs, and the build fails if a page throws while rendering.
3. In the browser, `entry-client.tsx` hydrates the page from the data serialized into its HTML.
   Client-side navigation imports the next page's `index.ctx.js` instead.

In dev, `resolver.ts` serves the same `index.ctx.js` modules virtually.

### Pages

Files in `src/pages` become routes:

| File | Route |
| --- | --- |
| `index.tsx` | `/` |
| `posts__[id].tsx` | `/posts/:id` (`__` is a path separator, `[id]` is a param) |
| `[...404].tsx` | Catch-all, prerendered to `dist/404.html`. Only supported at the root |
| `_layout.tsx` | Not a route, as `_` files are skipped. This one is the root layout |

A page exports its component and, if needed, how to get its data:

```tsx
import { useDataAsync } from '@engine/client'
import type { PostData } from '$lib/posts'

// The data of a page, called at build time.
export const preload = async (params: { id: string }) => {
  if (!import.meta.env.SSR) return
  const { getPost } = await import('$lib/posts')
  return await getPost(params.id)
}

// The params to prerender a dynamic route with.
export const prerender = async () => {
  if (!import.meta.env.SSR) return
  const { listPosts } = await import('$lib/posts')
  const posts = await listPosts()
  return posts.map((post) => ({ id: post.id }))
}

export default function PostPage() {
  const post = useDataAsync<PostData>()
  // ...
}
```

The `import.meta.env.SSR` guard keeps server code out of the browser: it is `false` in the client
build, so the bundler drops everything after the `return`, including the import of `$lib/posts`
and its use of `node:fs`.

### Writing a post

Create `posts/<id>/index.md`. The folder name becomes the URL, `/posts/<id>/`.

```yaml
---
title: My post           # required
date: 2025-12-16         # required
description: Shown on the home page and in the meta tags
tags: [example]          # a list, or a string split on , ; |
image: ./cover.jpg       # cover image
color: '#435581'         # tint at the top of the page
---
```

The build fails if the frontmatter, the title or a valid date is missing.

Besides GitHub flavored markdown, the renderers support:

- **Images:** `![Caption h=300 wide](./image.png)`. The text is the caption, `h=300` sets the
  height and a trailing `wide` widens the figure on large screens. `./` is relative to the post
  folder. Clicking an image zooms it.
- **Code blocks:** the corner shows the language as an icon, or as its name if it has no icon. Icons
  are inlined at build time, so a post only carries the ones it uses. They come from
  [material-icon-theme](https://github.com/material-extensions/vscode-material-icon-theme),
  MIT License, Copyright (c) 2025 Material Extensions.
- **Diff lines:** in any code block, a line starting with `+` or `-` is shown as added or removed,
  without the mark. `++` and `--` don't count, which keeps C increments and Lua comments intact,
  and in YAML and Markdown blocks `- ` and `+ ` are list items.
- **Terminal blocks:** a `terminal` code block shows its lines as input. Lines after a `___` line
  are output, which is inserted as HTML.
- **Diagrams:** a `mermaid` code block renders as a diagram in the page's font and theme, and is
  drawn again when the theme changes. Mermaid is only downloaded by pages that have one.
- **Headings:** `h1` to `h3` appear in the table of contents, and every heading gets an anchor link
  with an id built from its text. Repeated headings get a numeric suffix.
- **Links:** external links open in a new tab.

### Social links

The keys of `author.social` in `blog.config.ts` must match an icon in
`src/components/Icons.tsx`: `GitHub` uses `GitHubIcon`. A key without an icon is not shown. Values
are used as link targets, so an email needs `mailto:`.

### Tests

```sh
pnpm typecheck
pnpm test        # engine, markdown and post logic, plus a full build
pnpm test:e2e    # builds, then checks the site in your installed Chrome
```

The browser tests block every external host, so they never reach analytics.

### Deployment

Build with `pnpm build` and upload `dist/` to a static host.

Unknown URLs should get `404.html` with a 404 status. On Cloudflare Workers static assets, that
needs `assets.not_found_handling` set to `"404-page"`.
