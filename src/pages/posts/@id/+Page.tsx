import { For, lazy } from 'solid-js'
import TimeTag from '$components/TimeTag'
import { useData } from 'vike-solid/useData'
import type { PostData } from '$lib/posts'
import conf from '$blog-config'

const ImageView = lazy(() => import('$components/ImageView'))

export default function Post() {

  const post = useData<PostData>()

  return (
    <article class='max-w-screen-md px-4 pt-8 pb-16 md:pt-16 mx-auto'>
      {/* <MetaTags
            article
            title={post.title}
            description={post.description}
            image={post.image}
            path={post.path}
          /> */}

      <h1 class='blog-header mt-6 text-4xl font-bold text-gray-800 sm:text-5xl'>
        {post.title}
      </h1>

      <div class='mt-6 text-gray-500'>
        <div class='gap-2 items-center'>
          <div class='text-base'>
            <TimeTag datetime={post.date} />
          </div>
          <ul class='flex flex-wrap gap-2 gap-x-4 mt-4 text-sm'>
            <li class='whitespace-nowrap'>
              <a
                class='hover:underline flex items-center gap-2'
                target='_blank'
                rel='noopener noreferer'
                href={conf.author.social.github}
              >
                <img
                  src={conf.author.avatar}
                  class='h-[1.75em] rounded-full'
                />
                <span>{conf.author.name}</span>
              </a>
            </li>
          </ul>
          <div class='flow-root mt-6 text-base'>
            <div class='-m-1 flex flex-row flex-wrap gap-2 px-1'>
              <For each={post.tags}>
                {(tag) => (
                  <span class='px-2 py-0.5 rounded-md border border-gray-300'>
                    {tag}
                  </span>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>

      <hr class='my-8 border-gray-300/80' />

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
        innerHTML={post.html}
      />

      <ImageView />

    </article>
  )
}