import { For } from 'solid-js'
import { PostHeader, listPosts } from '$lib/posts'
import MetaTags from '$components/MetaTags'
import TimeTag from '$components/TimeTag'
import * as Icons from '$components/Icons'
import conf from '$blog-config'
import { A } from '@solidjs/router'

function PostCard(props: { post: PostHeader }) {
  return (
    <div class='py-12 grid sm:grid-cols-4 gap-4'>
      <div class='w-full text-gray-500'>
        <TimeTag datetime={props.post.date} short />
        <div class='flow-root mt-4 text-sm text-gray-700'>
          <div class='flex flex-wrap gap-2'>
            <For each={props.post.tags}>
              {(tag) => (
                <span class='border py-1 px-2 border-gray-300 rounded-md'>
                  {tag}
                </span>
              )}
            </For>
          </div>
        </div>
      </div>
      <A
        class='sm:col-span-3 sm:pl-8 sm:border-l sm:border-gray-300 flex flex-col gap-4'
        href={props.post.path}
      >
        <img
          src={props.post.image}
          alt=''
          class='w-full sm:hidden'
          loading='lazy'
        />
        <h2 class='text-2xl text-gray-800 sm:text-3xl font-bold leading-tight tracking-tight'>
          {props.post.title}
        </h2>
        <div class='text-gray-800'>
          {props.post.description}
        </div>
      </A>
    </div>
  )
}

export default function Home() {
  return (
    <div class='max-w-screen-md px-4 pt-16 mx-auto'>
      <MetaTags />

      <section class='max-w-screen-sm h-full px-6 py-20 mx-auto flex flex-col items-center justify-center border-b-1 border-gray-300/80'>
        <A href='/' class='flex flex-col items-center'>
          <div>
            <img
              class='object-cover w-28 h-28 border-4 border-white rounded-full pointer-events-none select-none'
              src='/logo.jpg'
              alt=''
              width='112'
              height='112'
              loading='lazy'
            />
          </div>
          <h1 class='mt-3 text-3xl text-gray-900 font-bold'>
            {conf.title}
          </h1>
        </A>

        <p class='text-lg text-gray-600 mt-2'>
          {conf.description}
        </p>

        <nav class='mt-5 flex gap-2'>
          <a
            class='flex items-center justify-center w-8 h-8 rounded-full bg-gray-600/10 text-gray-700 hover:bg-gray-600/15 hover:text-white transition-colors'
            target='_blank'
            rel='noopener noreferer'
            href='mailto:wuuyi123@gmail.com'
            title='Email'
          >
            <Icons.EmailIcon />
          </a>
          <a
            class='flex items-center justify-center w-8 h-8 rounded-full bg-gray-600/10 text-gray-700 hover:bg-gray-600/15 hover:text-white transition-colors'
            target='_blank'
            rel='noopener noreferer'
            href='https://github.com/nomi-san'
            title='GitHub'
          >
            <Icons.GitHubIcon />
          </a>
          <a
            class='flex items-center justify-center w-8 h-8 rounded-full bg-gray-600/10 text-gray-700 hover:bg-gray-600/15 hover:text-white transition-colors'
            target='_blank'
            rel='noopener noreferer'
            href='https://facebook.com/im.not.duy'
            title='Facebook'
          >
            <Icons.FacebookIcon />
          </a>
          <a
            class='flex items-center justify-center w-8 h-8 rounded-full bg-gray-600/10 text-gray-700 hover:bg-gray-600/15 hover:text-white transition-colors'
            target='_blank'
            rel='noopener noreferer'
            href='https://twitter.com/im.not.duy'
            title='Twitter'
          >
            <Icons.TwitterIcon />
          </a>
        </nav>
      </section>

      <section class='pt-12'>
        <For each={listPosts()}>
          {(post) => <PostCard post={post} />}
        </For>
      </section>

    </div>
  )
}