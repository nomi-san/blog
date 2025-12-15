import { VoidComponent, onMount } from 'solid-js'

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

type AnalyticsProps = {
  ga_tracking_id?: string
}

const Analytics: VoidComponent<AnalyticsProps> = (props) => {

  onMount(() => {
    const dataLayer = window['dataLayer'] = (window['dataLayer'] || [])
    const gtag = window['gtag'] = function (..._) {
      dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', props.ga_tracking_id)
  })

  return (
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${props.ga_tracking_id}`}
    >
    </script>
  )
}

export default Analytics