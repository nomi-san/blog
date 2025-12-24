import '../styles/gfm.css'
import '../styles/app.css'
import '../styles/blog.css'

import { useContext } from 'solid-js'
import { MetaContext } from '@solidjs/meta'
import { themeScript } from '$lib/theme'

import Footer from '$components/Footer'
import Header from '$components/Header'

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
      {/* <Analytics ga_tracking_id={conf.ga_tracking_id} /> */}
    </main>
  )
}