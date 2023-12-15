import { h } from 'nano-jsx'

const islandsCode = `(${island.toString()})(window);`

export function ImageView() {
  return (
    <div
      id='image-view'
      class='invisible flex fixed p-8 top-0 left-0 bottom-0 right-0 items-center justify-center z-[999] cursor-zoom-out bg-[#222a] backdrop-blur-sm backdrop-brightness-50'
    >
      <figure class='flex justify-center items-center'>
        <img
          id='image-view-src'
          class='w-auto max-h-[80vh]'
          loading='lazy'
          alt=''
        />
      </figure>
      <script async>{islandsCode}</script>
    </div>
  )
}

function island(window: Window) {
  window.addEventListener('load', () => {
    const md = document.querySelector('.markdown-body')
    if (md != null) {
      const images = md.querySelectorAll('figure img')
      const view = document.getElementById('image-view')!

      images.forEach((img) => {
        const src = (img as HTMLImageElement).src
        img.addEventListener('click', () => showImage(view!, src))
      })

      view.addEventListener('click', () => hideImage(view))
    }
  })

  function showImage(view: HTMLElement, src: string) {
    const img = document.getElementById('image-view-src') as HTMLImageElement
    if (img != null) {
      view.style.visibility = 'visible'
      document.documentElement.style.overflowY = 'hidden'
      img.src = src
    }
  }

  function hideImage(view: HTMLElement) {
    const img = document.getElementById('image-view-src') as HTMLImageElement
    if (img != null) {
      view.style.visibility = 'hidden'
      document.documentElement.style.overflowY = 'auto'
      img.src = ''
    }
  }
}
