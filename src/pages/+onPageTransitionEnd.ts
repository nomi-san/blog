import { BProgress } from '@bprogress/core'

export function onPageTransitionEnd() {
  BProgress.done()
}