import { h } from 'nano-jsx'

interface IProps {
  datetime: Date
  short?: boolean
}

export function Time(props: IProps) {
  const iso = props.datetime.toISOString()
  const text = props.datetime
    .toLocaleDateString('vi', {
      day: '2-digit',
      month: props.short ? 'short' : 'long',
      year: 'numeric',
    })

  return <time datetime={iso}>{text}</time>
}
