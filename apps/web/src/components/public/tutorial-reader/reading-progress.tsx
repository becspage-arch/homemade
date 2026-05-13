'use client'

import { useEffect, useRef, useState } from 'react'
import { updateReadingProgress } from '@/lib/user-state-actions'

interface ReadingProgressProps {
  /** When set, the percent is persisted to UserProject via a debounced action. */
  projectId: string | null
  /** Where to start the bar from on first load (resumes the reader's position). */
  initialPercent?: number
}

/**
 * Thin sage progress bar fixed beneath the sticky site header. Tracks scroll
 * position relative to the page content. When the reader has an active
 * UserProject, percent persists back at most every PERSIST_INTERVAL_MS.
 */
const PERSIST_INTERVAL_MS = 5000

export function ReadingProgress({
  projectId,
  initialPercent = 0,
}: ReadingProgressProps) {
  const [percent, setPercent] = useState(initialPercent)
  const lastPersisted = useRef(initialPercent)
  const latestPercent = useRef(initialPercent)

  useEffect(() => {
    function computePercent(): number {
      const doc = document.documentElement
      const scrolled = window.scrollY || doc.scrollTop
      const total = doc.scrollHeight - doc.clientHeight
      if (total <= 0) return 0
      return Math.max(0, Math.min(100, Math.round((scrolled / total) * 100)))
    }

    let raf: number | null = null
    function onScroll(): void {
      if (raf !== null) return
      raf = window.requestAnimationFrame(() => {
        raf = null
        const next = computePercent()
        latestPercent.current = next
        setPercent(next)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    let interval: ReturnType<typeof setInterval> | null = null
    if (projectId) {
      interval = setInterval(() => {
        const cur = latestPercent.current
        if (Math.abs(cur - lastPersisted.current) >= 1) {
          lastPersisted.current = cur
          void updateReadingProgress(projectId, cur)
        }
      }, PERSIST_INTERVAL_MS)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf !== null) cancelAnimationFrame(raf)
      if (interval !== null) clearInterval(interval)
      if (projectId && lastPersisted.current !== latestPercent.current) {
        void updateReadingProgress(projectId, latestPercent.current)
      }
    }
  }, [projectId])

  return (
    <div
      className="reading-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label="Reading progress"
    >
      <div className="reading-progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
