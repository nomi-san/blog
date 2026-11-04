import { Loading } from 'solid-js'
import Layout from '~/src/pages/_layout'
import { AppRouter } from './router'

export function Root(props: {
  url?: string
}) {
  return (
    <Loading>
      <AppRouter url={props.url}>
        {(section) => <Layout>{section.children}</Layout>}
      </AppRouter>
    </Loading>
  )
}
