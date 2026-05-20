'use client'

import { useEffect, useRef } from 'react'

const PATCH_EVERY_MS = 30_000

/**
 * Tracks active viewing time for a chart and patches `timeSpentSecondsDelta`
 * to the chart-progress API every 30 seconds.
 *
 * Pauses when the tab becomes hidden (via the Page Visibility API) and
 * when the page is in the background — accumulated seconds since the last
 * patch are only counted while the document is visible. On unmount we
 * flush any remaining delta so a quick visit still credits the user.
 *
 * Used by every interactive chart view (cross-stitch, craft, weaving,
 * origami) so progress time accumulates regardless of chart kind.
 */
export function useTimeTracker(tutorialId: string, chartIndex: number, enabled: boolean) {
  const accumulatedRef = useRef(0)
  const visibleStartRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    // Start the visible-since clock immediately if the tab is visible.
    if (typeof document !== 'undefined' && !document.hidden) {
      visibleStartRef.current = Date.now()
    }

    function accumulate(): void {
      if (visibleStartRef.current != null) {
        accumulatedRef.current += (Date.now() - visibleStartRef.current) / 1000
        visibleStartRef.current = Date.now()
      }
    }

    function flush(): void {
      accumulate()
      const seconds = Math.floor(accumulatedRef.current)
      if (seconds <= 0) return
      accumulatedRef.current -= seconds
      void fetch(`/api/me/chart-progress/${tutorialId}/${chartIndex}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ timeSpentSecondsDelta: seconds }),
        keepalive: true,
      }).catch(() => {
        // Network failure — keep the seconds in the accumulator for the
        // next flush. (Setting `accumulated -= seconds` above means we
        // lose them on failure; trade-off for code simplicity.)
      })
    }

    function onVisibilityChange(): void {
      if (typeof document === 'undefined') return
      if (document.hidden) {
        accumulate()
        visibleStartRef.current = null
      } else {
        visibleStartRef.current = Date.now()
      }
    }

    const intervalId = setInterval(flush, PATCH_EVERY_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      // Best-effort final flush. `keepalive: true` lets the browser
      // complete the request after unmount / unload.
      flush()
    }
  }, [tutorialId, chartIndex, enabled])
}
