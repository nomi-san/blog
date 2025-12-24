import { Component, For, VoidComponent } from 'solid-js'
import { A } from '@solidjs/router'
import { useDataAsync } from '@engine/client'
import type { PostHeader } from '$lib/posts'
import TimeTag from '$components/TimeTag'
import MetaTags from '$components/MetaTags'
import * as Icons from '$components/Icons'
import conf from '$blog-config'

export const preload = async () => {
  'use server'
  const { listPosts } = await import('$lib/posts')
  return await listPosts()
}

export default function HomePage() {

  const posts = useDataAsync<PostHeader[]>()

  const social = Object.entries(conf.author.social)
    .map(([k, v]) => {
      const icon = (Icons as any)[`${k}Icon`]
      return icon ? { name: k, link: v as string, icon } : null
    })
    .filter(Boolean) as { name: string; link: string; icon: Component }[]

  return (
    <div class='max-w-screen-md px-4 pt-16 mx-auto'>
      <MetaTags />

      <section class='max-w-screen-sm h-full px-6 py-20 mx-auto flex flex-col items-center justify-center border-b border-gray-300/80 dark:border-neutral-700/80'>
        <A href='/' class='flex flex-col items-center'>
          <div>
            <img
              class='object-cover size-28 rounded-full pointer-events-none select-none'
              src='/logo.jpg' alt='' width='112' height='112' loading='lazy'
            />
          </div>
          <h1 class='mt-3 text-3xl font-bold text-gray-900 dark:text-gray-200'>
            {conf.title}
          </h1>
        </A>

        <p class='text-lg mt-2 text-gray-600 dark:text-neutral-400 text-center'>
          {conf.description}
        </p>

        <nav class='mt-5 flex gap-2'>
          <For each={social}>
            {(item) => (
              <A
                class='flex items-center justify-center size-8 rounded-full transition-colors
                bg-neutral-600/10 text-neutral-700 hover:bg-neutral-700 hover:text-white
                dark:bg-neutral-300/10 dark:text-neutral-300 dark:hover:bg-neutral-300 dark:hover:text-black'
                target='_blank'
                rel='noopener noreferer'
                href={item.link}
                title={item.name}
              >
                <item.icon />
              </A>
            )}
          </For>
        </nav>
      </section>

      <section class='pt-12'>
        <For each={posts()}>
          {(post) => <PostCard post={post} />}
        </For>
      </section>

    </div>
  )
}

const PostCard: VoidComponent<{ post: PostHeader }> = (props) => {
  return (
    <div class='py-12 grid sm:grid-cols-4 gap-4'>
      <div class='w-full text-gray-500'>
        <TimeTag
          class='text-gray-500 dark:text-neutral-400'
          datetime={props.post.date} short />
        <div class='flow-root mt-4 text-sm text-gray-700 dark:text-neutral-300'>
          <div class='flex flex-wrap gap-2'>
            <For each={props.post.tags}>
              {(tag) => (
                <span class='border py-1 px-2 border-gray-300 dark:border-neutral-700 rounded-md'>
                  {tag}
                </span>
              )}
            </For>
          </div>
        </div>
      </div>
      <A
        class='sm:col-span-3 sm:pl-8 sm:border-l sm:border-gray-300 dark:sm:border-neutral-700 flex flex-col gap-4'
        href={props.post.path}
      >
        {/* <img
          src={props.post.image}
          alt=''
          class='w-full sm:hidden'
          loading='lazy'
        /> */}
        <h2 class='text-2xl text-gray-800 dark:text-neutral-200 sm:text-3xl font-bold tracking-tight'>
          {props.post.title}
        </h2>
        <div class='text-gray-800 dark:text-neutral-300 leading-relaxed'>
          {props.post.description}
        </div>
      </A>
    </div>
  )
}