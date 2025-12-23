import { createAsync, useLocation } from '@solidjs/router'

export function useDataAsync<T>() {
  const path = useLocation().pathname
  return createAsync(async () => {
    const module = await import(/*@vite-ignore*/ `${path}$page.ctx.js`)
    return <T>module.default
  })
}