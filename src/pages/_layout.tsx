import '../styles/app.css'
import '../styles/gfm.css'
import '../styles/blog.css'

import { type FlowComponent } from 'solid-js'
import Footer from '$components/Footer'
import Header from '$components/Header'

const Layout: FlowComponent = (props) => {
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

export default Layout