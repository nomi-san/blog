import '../styles/gfm.css'
import '../styles/app.css'
import '../styles/blog.css'

import Footer from '$components/Footer'
import Header from '$components/Header'

export default function Layout(props: any) {
  return (
    <>
      <Header />
      <div class="flex-1">
        {props.children}
      </div>
      <Footer />
      {/* <Analytics ga_tracking_id={conf.ga_tracking_id} /> */}
    </>
  )
}