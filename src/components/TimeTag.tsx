import { VoidComponent } from 'solid-js'

interface TimeProps {
  class?: string
  datetime: string
  short?: boolean
}

const TimeTag: VoidComponent<TimeProps> = (props) => {
  const date = () => new Date(props.datetime)
  const text = () => date()
    .toLocaleDateString('vi', {
      timeZone: 'UTC',
      day: '2-digit',
      month: props.short ? 'short' : 'long',
      year: 'numeric',
    })

  return (
    <time class={props.class}
      datetime={date().toISOString()}>{text()}</time>
  )
}

export default TimeTag
