import { h, Router } from 'nano-jsx'
import { Home } from './pages/Home.tsx'
import { NotFound } from './pages/404.tsx'
import { Post } from './pages/Post.tsx'
import { Analytics } from './components/Analytics.tsx'
import { Header } from './components/Header.tsx'
import { Footer } from './components/Footer.tsx'

export function App() {
  return (
    <main tabindex='-1' class='min-h-screen flex flex-col'>
      <Header />

      <div class='flex-1'>
        <Router.Switch fallback={() => <NotFound />}>
          <Router.Route exact path='/'>
            <Home />
          </Router.Route>
          <Router.Route exact path='/posts/:id'>
            <Post />
          </Router.Route>
        </Router.Switch>
      </div>

      <Footer />
      <Analytics />
    </main>
  )
}
