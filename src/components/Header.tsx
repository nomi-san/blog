import { h, Helmet } from 'nano-jsx'

export function Header() {
  return (
    <header class='header'>
      <Helmet>
        <script>
          if (location.pathname === '/')
          document.documentElement.classList.add('no-header')
        </script>
      </Helmet>

      <div class='max-w-screen-md px-4 pt-4 pb-4 md:pt-8 mx-auto'>
        <a
          href='/'
          class='inline-flex items-center gap-1 text-sm text-gray-500/80 hover:text-gray-700 transition-colors'
          title='Back to Index Page'
        >
          <svg
            class='inline-block w-5 h-5'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M6.91675 14.4167L3.08341 10.5833C3.00008 10.5 2.94119 10.4097 2.90675 10.3125C2.87175 10.2153 2.85425 10.1111 2.85425 10C2.85425 9.88889 2.87175 9.78472 2.90675 9.6875C2.94119 9.59028 3.00008 9.5 3.08341 9.41667L6.93758 5.5625C7.09036 5.40972 7.27786 5.33334 7.50008 5.33334C7.7223 5.33334 7.91675 5.41667 8.08341 5.58334C8.23619 5.73611 8.31258 5.93056 8.31258 6.16667C8.31258 6.40278 8.23619 6.59722 8.08341 6.75L5.66675 9.16667H16.6667C16.9029 9.16667 17.1006 9.24639 17.2601 9.40584C17.4201 9.56584 17.5001 9.76389 17.5001 10C17.5001 10.2361 17.4201 10.4339 17.2601 10.5933C17.1006 10.7533 16.9029 10.8333 16.6667 10.8333H5.66675L8.10425 13.2708C8.25703 13.4236 8.33341 13.6111 8.33341 13.8333C8.33341 14.0556 8.25008 14.25 8.08341 14.4167C7.93064 14.5694 7.73619 14.6458 7.50008 14.6458C7.26397 14.6458 7.06953 14.5694 6.91675 14.4167Z'
              fill='currentColor'
            >
            </path>
          </svg>Home
        </a>
      </div>
    </header>
  )
}
