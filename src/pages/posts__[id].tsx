import { For, lazy, onMount, Show } from 'solid-js'
import { useDataAsync } from '@engine/client'
import TimeTag from '$components/TimeTag'
import MetaTags from '$components/MetaTags'
import type { PostData } from '$lib/posts'
import { useIsDark } from '$lib/theme'
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
        theme: useIsDark()() ? 'dark' : 'default',
      })
      mermaid.contentLoaded()
    })
  })

  return (
    <Show when={post()} keyed>
      {(post) => (
        <>
          <MetaTags
            article
            title={post.title}
            description={post.description}
            image={post.image}
            path={post.path}
          />

          <Show when={post.color}>
            <div
              class="pointer-events-none absolute start-0 top-0 z-[-1] h-screen w-full opacity-25"
              style={`background-image:linear-gradient(${post.color},transparent); --highlightColor: ${post.color};`}>
            </div>
          </Show>

          <article class='max-w-screen-md px-4 pt-8 pb-16 md:pt-16 mx-auto'>
            {/* post title */}
            <h1 class='!leading-[1.2] mt-6 text-4xl font-bold text-gray-800 dark:text-neutral-200 sm:text-5xl'>
              {post.title}
            </h1>

            <hr class='inline-block mt-8 mb-4 border-black/15 dark:border-white/20 w-1/3' />

            {/* meta data */}
            <div class='text-sm text-neutral-700 dark:text-neutral-300'>
              <div class='flex items-center gap-2'>
                {/* post date */}
                <TimeTag datetime={post.date} />
                <span>—</span>
                {/* author info */}
                <ul class='flex flex-wrap gap-2 gap-x-4'>
                  <li class='whitespace-nowrap'>
                    <a
                      class='hover:underline flex items-center gap-2'
                      target='_blank'
                      rel='noopener noreferrer'
                      href={conf.author.social.GitHub}
                    >
                      <img
                        src={conf.author.avatar}
                        alt={conf.author.name}
                        class='h-[1.75em] rounded-full'
                      />
                      <span>{conf.author.name}</span>
                    </a>
                  </li>
                </ul>
              </div>
              {/* post tags */}
              <div class='flow-root mt-4 text-sm'>
                <div class='-m-1 flex flex-row flex-wrap gap-2 px-1'>
                  <For each={post.tags}>
                    {(tag) => (
                      <span class='px-2 py-0.5 rounded-md border border-black/15 dark:border-white/20'>
                        {tag}
                      </span>
                    )}
                  </For>
                </div>
              </div>
            </div>

            {/* post cover image */}
            <div class='my-16'>
              <Show when={post.image}>
                <img
                  src={post.image}
                  alt='Post cover image'
                  class='mx-auto max-w-screen-sm w-full mt-4 sm:mt-0'
                  loading='lazy'
                  decoding='async'
                />
              </Show>
            </div>

            {/* post content */}
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