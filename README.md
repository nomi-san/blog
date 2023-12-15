## [nomi.dev](https://nomi.dev/)

A lightweight blog that is built from zero.

- [x] JSX + Tailwind
- [x] Markdown based (with more comlex syntax)
- [x] Full SSR, no SPA
- [x] Run on Deno (without build steps)

Dependencies:
- nano-jsx
- twind (fast css-in-js + tailwind preset)
- oak (deno web server)
- marked (markdown parser)
- refractor (code highlighting, prismjs based)

Run dev:
```
deno task dev
```

Run production:

```
deno task start
```
