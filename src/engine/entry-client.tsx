/* @refresh reload */
import './polyfills'
import { hydrate, render } from 'solid-js/web'
import { Root } from './root'

(import.meta.env.DEV ? render : hydrate)(
  () => <Root url={window.location.pathname} />,
  document.getElementById('root') as HTMLElement
)