import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Suspense } from 'solid-js'
import { MetaProvider } from '@solidjs/meta'
import Header from '$components/Header'
import Footer from '$components/Footer'
import Analytics from '$components/Analytics'

import './styles/gfm.css'
import './styles/app.css'
import './styles/blog.css'

const Layout = (props: { children: any }) => {
  return (
    <MetaProvider>
      <Header />
      <div class='flex-1'>
        <Suspense>{props.children}</Suspense>
      </div>
      <Footer />
      <Analytics />
    </MetaProvider>
  )
}

export default function App() {
  return (
    <Router
      root={(props) => <Layout>{props.children}</Layout>}
    >
      <FileRoutes />
    </Router>
  )
}