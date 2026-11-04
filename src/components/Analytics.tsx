import { VoidComponent, onSettled } from 'solid-js'

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

const Analytics: VoidComponent<{
  trackingId: string
}> = (props) => {

  onSettled(() => {
    const dataLayer = window['dataLayer'] = (window['dataLayer'] || [])
    const gtag = window['gtag'] = function (..._) {
      dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', props.trackingId)
  })

  return (
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${props.trackingId}`}
    >
    </script>
  )
}

export default Analytics