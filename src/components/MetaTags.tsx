import { VoidComponent } from 'solid-js'
import { Title, Meta } from '@solidjs/meta'
import conf from '$blog-config'

interface MetaTagsProps {
  title?: string
  description?: string
  article?: boolean
  image?: string
  path?: string
}

const MetaTags: VoidComponent<MetaTagsProps> = (props) => {
  const path = () => props.path || '/'
  const url = () => conf.url + path()
  const type = () => props.article ? 'article' : 'website'
  const description = () => props.description || conf.description

  const title = () => {
    const title = props.title || conf.title
    return path() !== '/' ? `${title} - ${conf.title}` : title
  }

  const image = () => {
    const image = props.image || conf.cover_image
    if (image.startsWith('//')) {
      return 'https:' + image
    }
    return image.startsWith('/') ? conf.url + image : image
  }

  return (
    <>
      <Title>{title()}</Title>
      <Meta name='title' content={title()} />
      <Meta name='description' content={description()} />

      <Meta property='og:type' content={type()} />
      <Meta property='og:url' content={url()} />
      <Meta property='og:title' content={title()} />
      <Meta property='og:description' content={description()} />
      <Meta property='og:image' content={image()} />
    </>
  )
}

export default MetaTags
