'use client'

import { useEffect, useRef } from 'react'
import { captureClientEvent } from '@/lib/client-analytics'

const THRESHOLDS = [25, 50, 75, 100] as const

/**
 * Fires `tutorial_scroll_depth` events at 25 / 50 / 75 / 100% scroll on the
 * current page. Each threshold fires at most once per page load. rAF-throttled
 * scroll listener, mirror of the `reading-progress` pattern.
 *
 * Mounted on the public tutorial detail page (signed-in OR signed-out so the
 * dashboard sees engagement from both). The component renders nothing.
 */
export function ScrollDepthTracker({ tutorialId }: { tutorialId: string }) {
  const fired = useRef<Set<number>>(new Set())
  const ticking = useRef(false)

  useEffect(() => {
    function measure() {
      ticking.current = false
      const doc = document.documentElement
      const scrolled = window.scrollY + window.innerHeight
      const total = Math.max(doc.scrollHeight, 1)
      const percent = Math.min(100, Math.round((scrolled / total) * 100))
      for (const t of THRESHOLDS) {
        if (percent >= t && !fired.current.has(t)) {
          fired.current.add(t)
          captureClientEvent('tutorial_scroll_depth', {
            tutorialId,
            percent: t,
          })
        }
      }
    }

    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      window.requestAnimationFrame(measure)
    }

    // Fire once on mount in case the page is already scrolled (short pages
    // hit 100% on load).
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [tutorialId])

  return null
}
