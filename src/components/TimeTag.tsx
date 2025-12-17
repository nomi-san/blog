import { VoidComponent } from 'solid-js'

interface TimeProps {
  class?: string
  datetime: string
  short?: boolean
}

const TimeTag: VoidComponent<TimeProps> = (props) => {
  const date = new Date(props.datetime)
  const iso = date.toISOString()
  const text = date
    .toLocaleDateString('vi', {
      day: '2-digit',
      month: props.short ? 'short' : 'long',
      year: 'numeric',
    })

  return (
    <time class={props.class}
      dateTime={iso}>{text}</time>
  )
}

export default TimeTag