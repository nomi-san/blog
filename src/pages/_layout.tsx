// @ts-ignore
import '@bprogress/core/css'
import '../styles/gfm.css'
import '../styles/app.css'
import '../styles/blog.css'

import { createEffect, Errored, onSettled } from 'solid-js'
import { useIsRouting } from '@solidjs/router'
import conf from '$blog-config'

import Footer from '$components/Footer'
import Header from '$components/Header'
import Analytics from '$components/Analytics'
import NotFound from '$components/NotFound'

import { BProgress } from '@bprogress/core'

export default function Layout(props: any) {

  const isRouting = useIsRouting()

  onSettled(() => {
    BProgress.configure({
      showSpinner: false,
      speed: 200,
      trickleSpeed: 200,
      minimum: 0.1,
    })
  })

  createEffect(isRouting, (routing) => {
    if (routing) {
      BProgress.start()
    } else {
      BProgress.done()
    }
  })

  return (
    <main class="flex flex-col min-h-screen mx-auto">
      <Header />
      <div class="flex-1">
        <Errored fallback={<NotFound />}>
          {props.children}
        </Errored>
      </div>
      <Footer />
      <Analytics trackingId={conf.ga_tracking_id} />
    </main>
  )
}