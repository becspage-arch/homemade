'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import './home-cards/home-cards.css'

interface RailScrollProps {
  children: ReactNode
  className?: string
}

export function RailScroll({ children, className }: RailScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const atStart = el.scrollLeft <= 4
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4
    setCanLeft(!atStart)
    setCanRight(!atEnd)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    sync()
    el.addEventListener('scroll', sync, { passive: true })
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', sync)
      ro.disconnect()
    }
  }, [sync])

  function nudge(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.offsetWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className={`rs-wrap${className ? ` ${className}` : ''}`}>
      <button
        className={`rs-arrow rs-arrow-left${canLeft ? ' rs-visible' : ''}`}
        onClick={() => nudge(-1)}
        disabled={!canLeft}
        aria-label="Scroll left"
        tabIndex={-1}
        type="button"
      >
        <ChevronLeft />
      </button>

      <div ref={trackRef} className="rs-track">
        {children}
      </div>

      <div
        className="rs-fade-right"
        style={{ opacity: canRight ? 1 : 0, pointerEvents: 'none' }}
      />

      <button
        className={`rs-arrow rs-arrow-right${canRight ? ' rs-visible' : ''}`}
        onClick={() => nudge(1)}
        disabled={!canRight}
        aria-label="Scroll right"
        tabIndex={-1}
        type="button"
      >
        <ChevronRight />
      </button>
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
