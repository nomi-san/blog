import { marked } from 'marked'
import { h, renderSSR } from 'nano-jsx'

function Image(
  props: { src: string; height: string; wide?: boolean; caption?: string },
) {
  let klass = 'flex flex-col'
  if (props.wide) {
    klass += ' lg:mx-[-8rem]'
  }
  return (
    <figure class={klass}>
      <img
        class='object-contain cursor-zoom-in'
        loading='lazy'
        decoding='async'
        alt=''
        src={props.src}
        style={{ height: props.height }}
      />
      {props.caption &&
        (
          <figcaption
            dangerouslySetInnerHTML={{ __html: props.caption }}
          />
        )}
    </figure>
  )
}

marked.use({
  renderer: {
    image: (src, _, caption) => {
      let height = 'auto'
      let wide = false
      const base: string = marked['__base']

      caption = caption
        .replace(/h=(\d+)/i, (_, h) => (height = `${h}px`, ''))
        .replace(/wide\s*$/, () => (wide = true, ''))
        .trim()

      if (base && src.startsWith('./')) {
        src = `${base}/${src.substring(2)}`
      }

      return renderSSR(() => (
        <Image src={src} height={height} wide={wide} caption={caption} />
      ))
    },
  },
})
