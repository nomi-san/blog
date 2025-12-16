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
      self.style.left = `${rc.right + 36}px`
    }
  }

  onMount(() => {
    let tocbot: typeof Tocbot | undefined

    import('tocbot').then((m) => {
      tocbot = m.default

      tocbot.init({
        tocSelector: '#toc',
        contentSelector: props.target,
        headingSelector: 'h1, h2, h3',
        hasInnerContainers: true,
        basePath: window.location.pathname,
        scrollSmoothDuration: 50
      })
      handleResize()
    })

    window.addEventListener('resize', handleResize)

    onCleanup(() => {
      tocbot?.destroy()
      window.removeEventListener('resize', handleResize)
    })
  })

  return (
    <div
      id="toc"
      class="fixed top-32 overflow-auto p-4 text-sm"
      ref={self}
    />
  )
}

export default TocView