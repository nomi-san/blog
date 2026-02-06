import { createRoot, createSignal } from 'solid-js'
import { isServer } from 'solid-js/web'

const DEFAULT_APPEARANCE: string = 'auto'
const APPEARANCE_KEY = 'appearance'

let query: MediaQueryList
let userPreference: string | null
let [isDark, setDark] = createRoot(() => createSignal(false))

if (!isServer && typeof window === 'object') {
  query = window.matchMedia('(prefers-color-scheme: dark)')
  userPreference = localStorage.getItem(APPEARANCE_KEY)

  setDark(
    (DEFAULT_APPEARANCE === 'dark' && userPreference == null) ||
    (userPreference === 'auto' || userPreference == null
      ? query.matches : userPreference === 'dark')
  )

  window.addEventListener('load', () => {
    query.onchange = (e: any) => {
      if (userPreference === 'auto') {
        setDark(dark => {
          setClass((dark = e.matches))
          return dark
        })
      }
    }
  })
}

export const useIsDark = () => isDark

export function toggleTheme() {
  setDark(dark => {
    setClass((dark = !dark))

    userPreference = dark
      ? query.matches ? 'auto' : 'dark'
      : query.matches ? 'light' : 'auto'

    localStorage.setItem(APPEARANCE_KEY, userPreference)
    return dark
  })
}

function setClass(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark')
  }
  else {
    document.documentElement.classList.remove('dark')
  }
}

export const themeScript =
  `var p=localStorage.getItem("${APPEARANCE_KEY}"),q=window.matchMedia("(prefers-color-scheme: dark)"),`
  + `d=${DEFAULT_APPEARANCE === 'dark'}&&null==p||("auto"===p||null==p?q.matches:"dark"===p);`
  + `document.documentElement.classList[d?"add":"remove"]("dark");`