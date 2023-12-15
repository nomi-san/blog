import { h, Helmet } from 'nano-jsx'

interface Props {
  title?: string
  description?: string
  article?: boolean
  image?: string
  path?: string
}

export const blog = {
  url: 'https://nomi.dev',
  title: 'nomi.dev',
  description: 'Blog xàm cùng các ngâm cứu chill chill về công nghệ',
  image: '/cover.jpg',
}

export function Meta(props: Props) {
  let title = props.title || blog.title
  let image = props.image || blog.image
  const description = props.description || blog.description
  const path = props.path || '/'

  const url = blog.url + path
  const type = props.article ? 'article' : 'website'

  if (title && path !== '/') title = `${title} - ${blog.title}`

  if (image.startsWith('//')) image = 'https:' + image
  else if (image.startsWith('/')) image = blog.url + image

  return (
    <Helmet>
      <title>{title}</title>
      <meta name='title' content={title} />
      <meta name='description' content={description} />

      <meta property='og:type' content={type} />
      <meta property='og:url' content={url} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />
    </Helmet>
  )
}
