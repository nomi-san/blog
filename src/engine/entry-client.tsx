/* @refresh reload */
import { hydrate, render } from 'solid-js/web'
import { Root } from './root'

render(
  () => <Root />,
  document.getElementById('root') as HTMLElement
)