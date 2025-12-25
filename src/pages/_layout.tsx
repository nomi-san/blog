import '../styles/gfm.css'
import '../styles/app.css'
import '../styles/blog.css'

import { useContext } from 'solid-js'
import { MetaContext } from '@solidjs/meta'
import { themeScript } from '$lib/theme'
import conf from '$blog-config'

import Footer from '$components/Footer'
import Header from '$components/Header'
import Analytics from '$components/Analytics'

export default function Layout(props: any) {

  if (!import.meta.env.SSR) {
    const meta = useContext(MetaContext)!
    meta.addTag({
      id: 'theme-script',
      tag: 'script',
      props: {
        innerHTML: themeScript,
      },
    })
  }

  return (
    <main class="flex flex-col min-h-screen mx-auto">
      <Header />
      <div class="flex-1">
        {props.children}
      </div>
      <Footer />
      <Analytics trackingId={conf.ga_tracking_id} />
    </main>
  )
}