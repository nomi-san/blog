import { useLocation } from '@solidjs/router'

export default function ErrorPage() {

  const location = useLocation()
  const is404 = location.pathname === '/not-found'

  return (
    <div class='w-full overflow-x-hidden relative flex justify-between h-full flex-col flex-wrap'>
      <div>
        <div class='text-center px-8 py-32 z-3 mx-auto max-w-lg'>
          <h1 class='font-bold text-5xl leading-10 tracking-tight'>{is404 ? '404' : 'Error'}</h1>
          <h2 class='mt-4 sm:mt-5 text-2xl text-center leading-tight'>
            {is404 ? "Couldn't find what you're looking for." : "Something went wrong."}
          </h2>
          <p class='mt-4'>
            <a
              href='/'
              class='underline'
              data-ancestor='true'
              aria-current='true'
            >
              Back to Home
            </a>
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