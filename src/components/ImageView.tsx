import { onMount, VoidComponent } from 'solid-js'

const ImageView: VoidComponent = () => {
  let view!: HTMLDivElement

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

  onMount(() => {
    if (!view) return

    const content = document.querySelector('.markdown-body')
    if (content != null) {
      const images = content.querySelectorAll('figure img')

      images.forEach((img) => {
        const src = (img as HTMLImageElement).src
        img.addEventListener('click', () => showImage(view, src))
      })

      view.addEventListener('click', () => hideImage(view))
    }
  })

  return (
    <div
      ref={view}
      class='invisible z-50 flex fixed p-8 top-0 left-0 bottom-0 right-0 items-center justify-center z-999 cursor-zoom-out bg-[#222a] backdrop-blur-sm backdrop-brightness-50'
    >
      <figure class='flex justify-center items-center'>
        <img
          id='image-view-src'
          class='w-auto max-h-[80vh]'
          loading='lazy'
          alt=''
        />
      </figure>
    </div>
  )
}

export default ImageView