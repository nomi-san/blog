/// <reference types="vite/client" />

declare module 'virtual:$pages/*' {
  import { Component } from 'solid-js'
  const component: Component<any>
  export default component
}