import { createSignal, onSettled } from 'solid-js'
import { isDark, toggleTheme } from '$lib/theme'
import { MoonIcon, SunIcon } from './Icons'

export default function ThemeButton() {

  const [mounted, setMounted] = createSignal(false)
  const [viewTransition, setViewTransition] = createSignal(false)

  onSettled(() => {
    // The server can't know the theme, so state must match its html until hydrated.
    setMounted(true)
    setViewTransition('startViewTransition' in document
      && window.matchMedia('(prefers-reduced-motion: no-preference)').matches)
  })

  const toggleAppearance = async (e: MouseEvent) => {
    if (!viewTransition()) {
      toggleTheme()
      return
    }

    const clipPath = [
      `circle(0px at ${e.clientX}px ${e.clientY}px)`,
      `circle(${Math.hypot(
        Math.max(e.clientX, innerWidth - e.clientX),
        Math.max(e.clientY, innerHeight - e.clientY)
      )}px at ${e.clientX}px ${e.clientY}px)`
    ]

    await document.startViewTransition(async () => {
      toggleTheme()
      await Promise.resolve()
    }).ready

    document.documentElement.animate(
      { clipPath: isDark() ? clipPath.reverse() : clipPath },
      {
        duration: 250,
        easing: 'ease-in',
        pseudoElement: `::view-transition-${isDark() ? 'old' : 'new'}(root)`
      }
    )
  }

  return (
    <button
      type="button"
      role="switch"
      title="Toggle dark mode"
      class="flex p-1.5 flex-nowrap rounded-full border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-colors duration-100 ease-in-out"
      aria-checked={mounted() && isDark() ? 'true' : 'false'}
      data-view-transition={viewTransition() ? 'true' : 'false'}
      onClick={toggleAppearance}
    >
      <SunIcon class="size-5 dark:hidden" />
      <MoonIcon class="size-5 hidden dark:block" />
    </button >
  )
}