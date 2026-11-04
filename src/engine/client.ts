import { createMemo } from 'solid-js'
import { useLocation } from '@solidjs/router'

export function useDataAsync<T>() {
  const location = useLocation()
  return createMemo(async () => {
    const path = location.pathname.replace(/\/+$/, '')
    const module = await import(/*@vite-ignore*/ `${path}/index.ctx.js`)
    return <T>module.default
  })
}
