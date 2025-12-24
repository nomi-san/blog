import { Show, VoidComponent } from 'solid-js'
import { useLocation } from '@solidjs/router'
import conf from '$blog-config'

const Footer: VoidComponent = () => {
  const location = useLocation()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer class='bg-[#fafafa] dark:bg-[#171717] mt-32'>
      <div class="max-w-screen-md relative mx-auto">
        <Show when={location.pathname.startsWith('/posts/')}>
          <div class="absolute right-0 -top-20">
            <button
              onClick={scrollToTop}
              class="relative group w-fit flex pl-8 pr-3 py-1.5 flex-nowrap rounded border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-colors duration-100 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="absolute top-1/2 left-2 -translate-y-1/2 size-4 stroke-2 fill-none stroke-current rotate-90">
                <line x1="5" y1="12" x2="19" y2="12" class="translate-x-2 group-hover:translate-x-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-100 ease-in-out"></line>
                <polyline points="12 5 5 12 12 19" class="translate-x-1 group-hover:translate-x-0 transition-transform duration-100 ease-in-out"></polyline>
              </svg>
              <span class="text-sm">Back to top</span>
            </button>
          </div>
        </Show>
        <div class='py-12 text-center text-sm'>
          <p>
            Built with SolidJS
          </p>
          <p class='mt-2'>
            {conf.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer