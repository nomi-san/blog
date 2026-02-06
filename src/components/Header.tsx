import { Show, VoidComponent } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import ThemeButton from './ThemeButton'

const Header: VoidComponent = () => {
  const location = useLocation()

  return (
    <Show when={location.pathname !== '/'}>
      <header class='header'>
        <div class='max-w-screen-md flex justify-between px-4 pt-4 pb-4 md:pt-8 mx-auto'>
          <div class="animate show">
            <A
              href="/"
              class="relative group w-fit flex pl-7 pr-3 py-1.5 flex-nowrap rounded 
                border border-black/15 dark:border-white/20 hover:bg-black/5 
                dark:hover:bg-white/5 hover:text-black dark:hover:text-white
                transition-colors duration-100 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="absolute top-1/2 left-2 -translate-y-1/2 size-4 stroke-2 fill-none stroke-current">
                <line x1="5" y1="12" x2="19" y2="12" class="translate-x-2 group-hover:translate-x-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-100 ease-in-out" />
                <polyline points="12 5 5 12 12 19" class="translate-x-1 group-hover:translate-x-0 transition-transform duration-100 ease-in-out" />
              </svg>
              <span class="text-sm">Back to home</span>
            </A>
          </div>
          <div>
            <ThemeButton />
          </div>
        </div>
      </header>
    </Show>
  )
}

export default Header