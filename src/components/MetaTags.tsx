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
  let title = props.title || conf.title
  let image = props.image || conf.cover_image
  const description = props.description || conf.description
  const path = props.path || '/'

  const url = conf.url + path
  const type = props.article ? 'article' : 'website'

  if (title && path !== '/') {
    title = `${title} - ${conf.title}`
  }

  if (image.startsWith('//')) {
    image = 'https:' + image
  }
  else if (image.startsWith('/')) {
    image = conf.url + image
  }

  return (
    <>
      <Title>{title}</Title>
      <Meta name='title' content={title} />
      <Meta name='description' content={description} />

      <Meta property='og:type' content={type} />
      <Meta property='og:url' content={url} />
      <Meta property='og:title' content={title} />
      <Meta property='og:description' content={description} />
      <Meta property='og:image' content={image} />
    </>
  )
}

export default MetaTags