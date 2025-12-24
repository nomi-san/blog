import { createSignal, onMount, Show } from 'solid-js'
import { useIsDark, toggleTheme } from '$lib/theme'
import { MoonIcon, SunIcon } from './Icons'

export default function ThemeButton() {

  const isDark = useIsDark()
  const [viewTransition, setViewTransition] = createSignal(false)

  onMount(() => {
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
      class="flex px-3 py-1.5 flex-nowrap rounded border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-colors duration-100 ease-in-out"
      aria-checked={isDark()}
      data-view-transition={viewTransition()}
      onClick={toggleAppearance}
    >
      {/* <Transition name="fade" mode="out-in"> */}
      <Show when={isDark()} fallback={<SunIcon class="size-5" />}>
        <MoonIcon v-else class="size-5" />
      </Show>
      {/* </Transition> */}
    </button >
  )
}