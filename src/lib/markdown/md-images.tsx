import { marked } from 'marked'
import { Show, VoidComponent } from 'solid-js'
import { renderToString } from 'solid-js/web'
import { __base } from '.'

const ImageTag: VoidComponent<{
  src: string; height: string; wide?: boolean; caption?: string
}> = (props) => {
  return (
    <figure class={`flex flex-col ${props.wide && 'lg:mx-[-8rem]'}`}>
      <img
        class='object-contain cursor-zoom-in'
        loading='lazy'
        decoding='async'
        alt=''
        src={props.src}
        style={{ height: props.height }}
      />
      <Show when={props.caption}>
        <figcaption innerHTML={props.caption} />
      </Show>
    </figure>
  )
}

marked.use({
  renderer: {
    image: (token) => {
      let height = 'auto'
      let wide = false
      let src = token.href
      const base = __base

      const caption = token.title
        ?.replace(/h=(\d+)/i, (_, h) => (height = `${h}px`, ''))
        .replace(/wide\s*$/, () => (wide = true, ''))
        .trim()

      if (base && src.startsWith('./')) {
        src = `${base}/${src.substring(2)}`
      }

      return renderToString(() => (
        <ImageTag
          src={src}
          height={height}
          wide={wide}
          caption={caption}
        />
      ))
    },
  },
})