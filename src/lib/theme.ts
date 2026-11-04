import { createSignal } from 'solid-js'
import { isServer } from '@solidjs/web'

const DEFAULT_APPEARANCE: string = 'auto'
const APPEARANCE_KEY = 'appearance'

let query: MediaQueryList
let userPreference: string | null = null
let initialDark = false

if (!isServer && typeof window === 'object') {
  query = window.matchMedia('(prefers-color-scheme: dark)')
  userPreference = localStorage.getItem(APPEARANCE_KEY)

  initialDark =
    (DEFAULT_APPEARANCE === 'dark' && userPreference == null) ||
    (userPreference === 'auto' || userPreference == null
      ? query.matches : userPreference === 'dark')

  // Prerendered pages already did this with themeScript, dev has no such script.
  setClass(initialDark)

  window.addEventListener('load', () => {
    query.onchange = (e: any) => {
      if (userPreference === 'auto' || userPreference == null) {
        setDark(e.matches)
        setClass(e.matches)
      }
    }
  })
}

const [isDark, setDark] = createSignal(initialDark)

export { isDark }

export function toggleTheme() {
  const dark = !isDark()
  setDark(dark)
  setClass(dark)

  userPreference = dark
    ? query.matches ? 'auto' : 'dark'
    : query.matches ? 'light' : 'auto'

  localStorage.setItem(APPEARANCE_KEY, userPreference)
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
