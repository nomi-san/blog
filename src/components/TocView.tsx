import { onCleanup, onMount, VoidComponent } from 'solid-js'
import type Tocbot from 'tocbot'
import '../styles/toc.css'

type TocViewProps = {
  target: string
}

const TocView: VoidComponent<TocViewProps> = (props) => {

  let self!: HTMLDivElement

  const handleResize = () => {
    const el = document.querySelector(props.target)
    if (el) {
      const rc = el.getBoundingClientRect()
      self.style.left = `${rc.right + 72}px`
    }
  }

  onMount(() => {
    let tocbot: typeof Tocbot | undefined
    let observer: IntersectionObserver | undefined

    import('tocbot').then((m) => {
      tocbot = m.default

      tocbot.init({
        tocSelector: '#toc',
        contentSelector: props.target,
        headingSelector: 'h1, h2, h3',
        hasInnerContainers: true,
        basePath: window.location.pathname,
        scrollSmoothDuration: 50,

      })
      handleResize()

      let tocVisible = false
      const firstHeading = document.querySelector(`${props.target} h1, ${props.target} h2`)
      // Show TOC when first heading enters viewport
      if (firstHeading && window.IntersectionObserver) {
        observer = new IntersectionObserver(
          ([entry]) => {
            // Heading enters viewport → show TOC
            if (entry.isIntersecting && !tocVisible) {
              self.classList.remove('hidden')
              tocVisible = true
            }
            // Heading leaves viewport upward → hide TOC
            if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
              self.classList.add('hidden')
              tocVisible = false
            }
          },
          {
            rootMargin: '0px 0px -10% 0px', // triggers early
            threshold: 0,
          }
        )
        observer.observe(firstHeading)
      }
    })

    window.addEventListener('resize', handleResize)

    onCleanup(() => {
      tocbot?.destroy()
      observer?.disconnect()
      window.removeEventListener('resize', handleResize)
    })
  })

  return (
    <div
      id="toc"
      class="fixed top-36 overflow-auto mt-6 text-sm hidden"
      ref={self}
    />
  )
}

export default TocView