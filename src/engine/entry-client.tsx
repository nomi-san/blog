/* @refresh reload */
import './polyfills'
import { configureClientErrors } from 'solid-js'
import { hydrate, render } from '@solidjs/web'
import { Root } from './root'

// A boundary's fallback hides the failure, so keep it visible in the console.
// Solid's dev builds already log it.
if (import.meta.env.PROD) {
  configureClientErrors({
    onError: (error) => console.error(error),
  })
}

const container = document.getElementById('root') as HTMLElement
const app = () => <Root url={window.location.pathname} />

if (import.meta.env.DEV) {
  render(app, container)
} else if (container.querySelector('[data-not-found]')) {
  // 404.html is served for any unknown url, so its markup may not match the route
  // resolved here. Hydrating that would wait forever for data the server never sent.
  container.textContent = ''
  render(app, container)
} else {
  hydrate(app, container)
}
