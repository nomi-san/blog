/* @refresh reload */
import { hydrate, render } from 'solid-js/web'
import { Root } from './root'

render(
  () => <Root url={window.location.pathname} />,
  document.getElementById('root') as HTMLElement
)