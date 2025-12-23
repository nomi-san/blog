import { Suspense } from 'solid-js'
import { Router } from '@solidjs/router'
import { PageRoutes } from './router'
import Layout from 'virtual:$pages/_layout'
import { MetaProvider } from '@solidjs/meta'

export function Root(props: {
  url: string
  preloadData?: any
}) {
  return (
    <MetaProvider>
      <Suspense>
        <Router url={props.url} root={Layout}>
          <PageRoutes preloadData={props.preloadData} />
        </Router>
      </Suspense>
    </MetaProvider>
  )
}