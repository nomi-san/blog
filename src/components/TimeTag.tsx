import { VoidComponent } from 'solid-js'

interface TimeProps {
  datetime: Date
  short?: boolean
}

const TimeTag: VoidComponent<TimeProps> = (props) => {
  const iso = props.datetime.toISOString()
  const text = props.datetime
    .toLocaleDateString('vi', {
      day: '2-digit',
      month: props.short ? 'short' : 'long',
      year: 'numeric',
    })

  return (
    <time datetime={iso}>{text}</time>
  )
}

export default TimeTag