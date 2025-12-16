// https://vike.dev/Layout

import '../styles/gfm.css'
import '../styles/app.css'
import '../styles/blog.css'
import '@bprogress/core/css'

import { Suspense, type JSX } from 'solid-js'
import Footer from '$components/Footer'
import Header from '$components/Header'
import Analytics from '$components/Analytics'
import conf from '$blog-config'

export default function Layout(props: { children?: JSX.Element }) {
  return (
    <>
      <Header />
      <div class='flex-1'>
        <Suspense>{props.children}</Suspense>
      </div>
      <Footer />
      <Analytics ga_tracking_id={conf.ga_tracking_id} />
    </>
  )
}