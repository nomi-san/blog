import { For, lazy, onMount, Show } from 'solid-js'
import { useDataAsync } from '@engine/client'
import TimeTag from '$components/TimeTag'
import MetaTags from '$components/MetaTags'
import type { PostData } from '$lib/posts'
import conf from '$blog-config'

const ImageView = lazy(() => import('$components/ImageView'))
const TocView = lazy(() => import('$components/TocView'))

export const preload = async (params: { id: string }) => {
  'use server'
  const { getPost } = await import('$lib/posts')
  return await getPost(params.id)
}

export const prerender = async () => {
  'use server'
  const { listPosts } = await import('$lib/posts')
  const posts = await listPosts()
  return posts.map(post => ({ id: post.id }))
}

export default function PostPage() {

  const post = useDataAsync<PostData>()

  onMount(() => {
    import('mermaid').then((m) => {
      const mermaid = m.default
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
      })
      mermaid.contentLoaded()
    })
  })

  return (
    <Show when={post()} keyed>
      {(post) => (
        <>
          <article class='max-w-screen-md px-4 pt-8 pb-16 md:pt-16 mx-auto'>
            <MetaTags
              article
              title={post.title}
              description={post.description}
              image={post.image}
              path={post.path}
            />

            {/* post title */}
            <h1 class='leading-[1.2] mt-6 text-4xl font-bold text-gray-800 dark:text-neutral-200 sm:text-5xl'>
              {post.title}
            </h1>

            {         /* meta data */}
            <div class='mt-6 text-neutral-600 dark:text-neutral-400'>
              <div class='gap-2 items-center'>
                {/* post date */}
                <div class='text-base'>
                  <TimeTag datetime={post.date} />
                </div>
                {/* author info */}
                <ul class='flex flex-wrap gap-2 gap-x-4 mt-4 text-sm'>
                  <li class='whitespace-nowrap'>
                    <a
                      class='hover:underline flex items-center gap-2'
                      target='_blank'
                      rel='noopener noreferer'
                      href={conf.author.social.GitHub}
                    >
                      <img
                        src={conf.author.avatar}
                        class='h-[1.75em] rounded-full'
                      />
                      <span>{conf.author.name}</span>
                    </a>
                  </li>
                </ul>
                {/* post tags */}
                <div class='flow-root mt-6 text-base'>
                  <div class='-m-1 flex flex-row flex-wrap gap-2 px-1'>
                    <For each={post.tags}>
                      {(tag) => (
                        <span class='px-2 py-0.5 rounded-md border border-neutral-300 dark:border-neutral-700'>
                          {tag}
                        </span>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>

            <hr class='my-8 border-gray-300/80 dark:border-neutral-700/80' />

            <div class='my-12'>
              <img
                src={post.image}
                alt=''
                class='mx-auto max-w-screen-sm w-full mt-4 sm:mt-0'
                loading='lazy'
                decoding='async'
              />
            </div>

            <div
              class='markdown-body'
              innerHTML={post.html}
            />

            <ImageView />
            <TocView target=".markdown-body" />

          </article>
        </>
      )}
    </Show>
  )
}