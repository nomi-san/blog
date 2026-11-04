/* @refresh reload */
import './polyfills'
import { hydrate, render } from 'solid-js/web'
import { Root } from './root'

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
