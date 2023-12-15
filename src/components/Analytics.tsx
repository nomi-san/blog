import { h } from 'nano-jsx'

export function Analytics() {
  const id = 'G-JFPJRH80C0'
  const script = `(${island.toString()})(window, '${id}');`
  return <script>{script}</script>
}

function island(window: Window, id: string) {
  const gs = document.createElement('script')
  gs.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  gs.addEventListener('load', () => {
    const dataLayer = Array<any>()
    const gtag = function (..._) {
      dataLayer.push(arguments)
    }

    window['dataLayer'] = dataLayer
    window['gtag'] = gtag

    gtag('js', new Date())
    gtag('config', '${id}')
  })
  document.body.appendChild(gs)
}
