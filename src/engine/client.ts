import { createAsync, useLocation } from '@solidjs/router'

export function useDataAsync<T>() {
  const location = useLocation()
  return createAsync(async () => {
    const path = location.pathname.replace(/\/+$/, '')
    const module = await import(/*@vite-ignore*/ `${path}/index.ctx.js`)
    return <T>module.default
  })
}