'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

interface SpecTipProps {
  /** Accessible name for the "?" control, e.g. "What stitchability means". */
  label: string
  /** Plain-language explanation shown in the bubble. */
  children: ReactNode
}

/**
 * The "?" marker in the pattern spec list.
 *
 * It used to be a hover-only tooltip, which meant it did nothing at all on a
 * phone: the value sat there with an unexplained "?" beside it. It is now a
 * real button that toggles the bubble on tap and closes on an outside tap or
 * Escape. Hover still opens it on pointer devices, and keyboard focus still
 * reveals it, so nothing is lost on desktop.
 */
export function SpecTip({ label, children }: SpecTipProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const tipId = useId()

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const node = wrapRef.current
      if (!node) return
      if (e.target instanceof Node && node.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span className="pattern-detail-tipwrap" ref={wrapRef}>
      <button
        type="button"
        className="pattern-detail-tip-toggle"
        aria-expanded={open}
        aria-controls={tipId}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      <span
        className={`pattern-detail-tip${open ? ' is-open' : ''}`}
        id={tipId}
        role="tooltip"
      >
        {children}
      </span>
    </span>
  )
}
