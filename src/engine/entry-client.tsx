/* @refresh reload */
import { hydrate } from 'solid-js/web'
import { Root } from './root'

hydrate(
  () => <Root url={window.location.pathname} />,
  document.getElementById('root') as HTMLElement
)