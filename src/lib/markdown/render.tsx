import { NoHydration, renderToString, type JSX } from '@solidjs/web'

// Post html is injected with innerHTML and never hydrated, so it needs no hydration keys.
export function renderHtml(code: () => JSX.Element) {
  return renderToString(() => <NoHydration>{code()}</NoHydration>)
}
