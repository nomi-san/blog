import { Component, lazy } from 'solid-js'
import { createRouter, Params } from '@solidjs/router'

type PageExport = {
  path?: string
  preload?: (params: Params) => Promise<any>
  prerender?: () => Promise<Params[]>
  default: Component
}

// Import all page components except files starting with _
const _pages = import.meta.glob<PageExport>([
  '../pages/**/*.tsx',
  '!../pages/**/_*.tsx',
])

const _routes = Array<{
  path: string
  preload: (params: Params) => Promise<any | undefined>
  prerender: () => Promise<Params[] | undefined>
  component: ReturnType<typeof lazy>
}>()

for (const key in _pages) {
  const page = _pages[key]
  const name = key.match(/\.\/pages(.*)\.tsx$/)![1]
    .toLowerCase()
    .replace(/\\/g, '/')

  // implied paths:
  //  index -> /,
  //  posts/[id] -> /posts/:id
  //  __ -> /
  //  [...404] -> *404

  let path: string
  if (name === '/index') {
    path = '/'
  } else if (/\/\[\...(\w+)\]/.test(name)) {
    path = name
      .replace(/\/\[\...(\w+)\]/, '*$1')
  } else {
    path = name
      .replace(/\__/g, '/')
      .replace(/\/\[(.*?)\]/g, '/:$1')
  }

  _routes.push({
    path,
    preload: (params) => page().then(m => m.preload?.(params)),
    prerender: () => page().then(m => m.prerender?.()),
    component: lazy(page),
  })
}

export const AppRouter = createRouter({
  routes: _routes.map(r => ({
    path: r.path,
    component: r.component,
    info: { preload: r.preload },
  })),
})

export const getPreloader = (url: string) => {
  const match = AppRouter.match(url).at(-1)
  const preload = match?.info?.preload
  return preload && (() => preload(match!.params))
}

export const getPrerenderRoutes = async () => {
  const prerenderRoutes: string[] = []
  for (const route of _routes) {
    // dynamic route with prerender function
    if (route.path.includes(':')) {
      if (route.prerender) {
        const paramsList = await route.prerender()
        if (paramsList != null) {
          for (const params of paramsList) {
            // resolve path with params
            let path = buildPath(route.path, params)
            prerenderRoutes.push(path)
          }
        }
      }
    } else if (route.path.includes('*')) {
      prerenderRoutes.push(route.path.replace(/\*/g, '/'))
    } else {
      // static route
      prerenderRoutes.push(route.path)
    }
  }
  return prerenderRoutes
}

function buildPath(pattern: string, params: Params): string {
  let path = pattern

  // Replace dynamic segments like : id with actual values
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      path = path.replace(`:${key}`, value)
    }
  })

  // Handle optional params by removing unused ones
  path = path.replace(/\/\:[^\/]+\?/g, '')

  // Handle splat params
  if (path.includes('/*')) {
    const splatKey = path.match(/\/\*(\w+)/)?.[1]
    if (splatKey && params[splatKey]) {
      path = path.replace(`/*${splatKey}`, `/${params[splatKey]}`)
    } else {
      path = path.replace(/\/\*\w*/, '')
    }
  }

  return `/${path.split('/').filter(Boolean).join('/')}`
}