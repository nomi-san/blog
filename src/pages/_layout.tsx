// @ts-ignore
import '@bprogress/core/css'
import '../styles/gfm.css'
import '../styles/app.css'
import '../styles/blog.css'

import { createEffect, onMount, useContext } from 'solid-js'
import { MetaContext } from '@solidjs/meta'
import { useIsRouting } from '@solidjs/router'
import { themeScript } from '$lib/theme'
import conf from '$blog-config'

import Footer from '$components/Footer'
import Header from '$components/Header'
import Analytics from '$components/Analytics'

import { BProgress } from '@bprogress/core'

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

  const isRouting = useIsRouting()

  onMount(() => {
    BProgress.configure({
      showSpinner: false,
      speed: 200,
      trickleSpeed: 200,
      minimum: 0.1,
    })
  })

  createEffect(() => {
    if (isRouting()) {
      BProgress.start()
    } else {
      BProgress.done()
    }
  })

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