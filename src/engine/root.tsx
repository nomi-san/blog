import { Suspense } from 'solid-js'
import { Router } from '@solidjs/router'
import { MetaProvider } from '@solidjs/meta'
import Layout from '~/src/pages/_layout'
import { getRoutes } from './router'

export function Root(props: {
  url?: string
}) {
  return (
    <MetaProvider>
      <Suspense>
        <Router url={props.url} root={Layout}>
          {getRoutes()}
        </Router>
      </Suspense>
    </MetaProvider>
  )
}