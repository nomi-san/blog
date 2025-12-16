import { BProgress } from '@bprogress/core'

export function onPageTransitionStart() {
  BProgress.configure({
    minimum: 0.1,
    speed: 200,
    trickleSpeed: 200,
    showSpinner: false
  })
  BProgress.start()
}