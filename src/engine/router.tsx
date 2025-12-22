import { Component, For, VoidComponent } from 'solid-js'
import { Route, Params } from '@solidjs/router'
import { isServer } from 'solid-js/web'
import { createMatcher, normalizePath } from '~/node_modules/@solidjs/router/dist/utils'

type PageExport = {
  path?: string
  preload?: (params: Params) => Promise<any>
  prerender?: () => Promise<Params[]>
  default: Component
}

const pages = import.meta.glob<PageExport>('../pages/**/*.tsx', {
  eager: true,
})

const routes = Object.keys(pages).map(key => {
  const page = pages[key]
  let path = page.path

  // implied paths:
  //  index -> /,
  //  _error -> /*error
  //  _layout -> (no route) 
  //  posts/[id] -> /posts/:id
  //  __ -> /

  if (!path) {
    const name = key.match(/\.\/pages(.*)\.tsx$/)![1]
      .toLowerCase()
      .replace(/\\/g, '/')

    if (name === '/index') {
      path = '/'
    } else if (name === '/error') {
      path = '/*error'
    } else {
      path = name
        .replace(/\__/g, '/')
        .replace(/\/\[(.*?)\]/g, '/:$1')
    }
  }

  return {
    path,
    match: createMatcher(path),
    preload: page.preload,
    prerender: page.prerender,
    component: page.default,
  }
})

export const PageRoutes: VoidComponent<{
  preloadData?: any
}> = (props) => {
  return (
    <For each={routes}>
      {(route) => (
        <Route
          path={route.path}
          preload={isServer ? (props.preloadData ? () => props.preloadData : undefined) : () => (window as any)['__PRELOAD_DATA__']}
          component={route.component}
        />
      )}
    </For>
  )
}

export const getPreloader = (url: string) => {
  for (const route of routes) {
    const match = route.match(url)
    if (match && route.preload) {
      return () => route.preload!(match.params)
    }
  }
}

export const getPrerenderRoutes = async () => {
  const prerenderRoutes: string[] = []
  for (const route of routes) {
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