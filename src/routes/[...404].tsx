import { Title } from '@solidjs/meta'
import { A } from '@solidjs/router'

export default function NotFound() {
  return (
    <div class='w-full overflow-x-hidden relative flex justify-between h-full flex-col flex-wrap'>
      <Title>404 - Page Not Found</Title>
      <div>
        <div class='text-center px-8 py-32 z-3 mx-auto max-w-lg'>
          <h1 class='font-bold text-5xl leading-10 tracking-tight'>404</h1>
          <h2 class='mt-4 sm:mt-5 text-2xl text-center leading-tight'>
            Couldn't find what you're looking for.
          </h2>
          <p class='mt-4'>
            <A
              href='/'
              class='underline'
              data-ancestor='true'
              aria-current='true'
            >
              Back to Home
            </A>
          </p>
        </div>
      </div>
      <div>
        <div class='mt-auto w-full pointer-events-none h-50 relative overflow-hidden'>
          <img
            src='/ferris.gif'
            alt='Ferris'
            class='translate-y-5.5 w-25 absolute left-[60%] bottom-0'
          />
        </div>
      </div>
    </div>
  )
}