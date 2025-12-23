import { Component, lazy } from 'solid-js'
import { Params, RouteDefinition } from '@solidjs/router'
import { createMatcher, normalizePath } from '~/node_modules/@solidjs/router/dist/utils'

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

// Also include the _error page
Object.assign(_pages, import.meta.glob<PageExport>(
  '../pages/_error.tsx',
))

const _routes = Array<{
  path: string
  match: ReturnType<typeof createMatcher>
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
  //  _error -> /*error
  //  posts/[id] -> /posts/:id
  //  __ -> /

  let path: string
  if (name === '/index') {
    path = '/'
  } else if (name === '/_error') {
    path = '*error'
  } else {
    path = name
      .replace(/\__/g, '/')
      .replace(/\/\[(.*?)\]/g, '/:$1')
  }

  _routes.push({
    path,
    match: createMatcher(path),
    preload: (params) => page().then(m => m.preload?.(params)),
    prerender: () => page().then(m => m.prerender?.()),
    component: lazy(page),
  })
}

console.log('Registered routes:', _routes.map(r => r.path))

export const getRoutes = (): RouteDefinition[] => {
  return _routes.map(r => ({
    path: r.path,
    component: r.component,
  }))
}

export const getPreloader = (url: string) => {
  for (const route of _routes) {
    const match = route.match(url)
    if (match) {
      return () => route.preload(match.params)
    }
  }
}

export const getPrerenderRoutes = async () => {
  const prerenderRoutes: string[] = []
  for (const route of _routes) {
    // dynamic route with prerender function
    if (route.path.includes(':')) {
      if (route.prerender) {
        const paramsList = await route.prerender()
        for (const params of paramsList) {
          // resolve path with params
          let path = buildPath(route.path, params)
          prerenderRoutes.push(path)
        }
      }
    } else if (route.path.includes('*')) {
      prerenderRoutes.push(route.path.replace(/\*/g, ''))
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

  return normalizePath(path)
}