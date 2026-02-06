## [nomi.dev](https://nomi.dev/)

A lightweight, markdown-driven blog built with Solid and Vike.

What changed
- Migrated from the earlier Deno/nano-jsx implementation to a modern
	Solid + Vike stack (Vite-based). The site is server-rendered and
	optimized for simple authoring with Markdown files under `posts/`.

Tech stack
- **Framework:** `vite` + `vike` + `solid-js`
- **Styling:** `tailwindcss` (via Vite plugin)
- **Markdown content:** `marked`, `mermaid`, `refractor`
- **Language:** `TypeScript`

Project layout
- `posts/` — markdown posts with YAML frontmatter (title, date, tags, etc.)
- `src/` — application source (components, pages, styles)
- `public/` — static assets
- `package.json` — scripts and dependencies

Development:
- Install dependencies:

```powershell
pnpm i
```

- Run development server:

```powershell
pnpm dev
```

- Build for production:

```powershell
pnpm build
```

- Preview production build:

```powershell
pnpm preview
```

Notes
- Node >= 22 is recommended (see `package.json` `engines`).
- Posts use YAML frontmatter. Example frontmatter in `posts/*/index.md`:

```yaml
---
title: My Post
description: ...
date: 2025-12-16
tags: [example]
---
```

- Mermaid diagrams and syntax highlighting are supported in posts.

Adding new post:
- Add new posts under `posts/` (create a folder per post with `index.md`).
- Keep frontmatter fields consistent for correct metadata rendering.

Deployment
- Build with `pnpm build` and serve the output from the `dist/client` with a static-file hosting.
