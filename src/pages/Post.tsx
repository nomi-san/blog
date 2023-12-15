import { h, Helmet } from 'nano-jsx'
import { getPost, hasPost } from '../lib/posts.ts'
import { Meta } from '../components/Meta.tsx'
import { Time } from '../components/Time.tsx'
import { ImageView } from '../components/ImageView.tsx'

interface IRoute {
  params: {
    id: string
  }
}

export function Post(props: { route?: IRoute }) {
  const { id } = props.route!.params

  if (!hasPost(id)) {
    return (
      <Helmet>
        <meta http-equiv='Refresh' content="0; url='/404'" />
      </Helmet>
    )
  }

  const post = getPost(id)

  return (
    <article class='max-w-screen-md px-4 pt-8 pb-16 md:pt-16 mx-auto'>
      <Meta
        article={true}
        title={post.title}
        description={post.description}
        image={post.image}
        path={post.path}
      />

      <h1 class='blog-header mt-6 text-4xl font-bold text-gray-800 sm:text-5xl'>
        {post.title}
      </h1>

      <div class='mt-6 text-gray-500'>
        <p class='flex gap-2 items-center'>
          <div class='text-base'>
            <Time datetime={post.date} />
          </div>
          {
            /* <ul class='flex flex-wrap gap-2 gap-x-4 mt-4 text-sm'>
            <li class='whitespace-nowrap'>
              <a
                class='hover:underline flex items-center gap-1'
                target='_blank'
                rel='noopener noreferer'
                href='https://github.com/nomi-san'
              >
                <img
                  src='https://github.com/nomi-san.png'
                  class='h-[1.75em] rounded-full'
                />
                <span>Nguyen Duy</span>
              </a>
            </li>
          </ul> */
          }
          <div class='flow-root mt-6 text-base'>
            <p class='-m-1 flex flex-row flex-wrap gap-2 px-1'>
              {post.tags.map((tag) => (
                <span class='px-2 py-0.5 rounded-md border border-gray-300'>
                  {tag}
                </span>
              ))}
            </p>
          </div>
        </p>
      </div>

      <hr class='my-8' />

      <div class='my-12'>
        <img
          src={post.image}
          alt=''
          class='mx-auto max-w-screen-sm max-w-lg w-full mt-4 sm:mt-0'
          loading='lazy'
          decoding='async'
        />
      </div>

      <div
        class='markdown-body'
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <ImageView />
    </article>
  )
}
