'use client'

import { useEffect, useId, useRef, useState } from 'react'

interface StitchGlossaryTipProps {
  term: string
  definition: string
}

/**
 * Small tap-to-reveal definition next to a stitch name, for stitches that
 * have a matching glossary entry (see `CROSS_STITCH_GLOSSARY_BY_STITCH_SLUG`
 * in `@/lib/stitch-reference`). Same interaction as the pattern page's
 * `SpecTip` (`cross-stitch/patterns/[slug]/spec-tip.tsx`) — a real button so
 * it works on tap, not just hover — reimplemented locally so this page
 * doesn't pull in another route's CSS.
 */
export function StitchGlossaryTip({ term, definition }: StitchGlossaryTipProps) {
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
    <span className="stitch-glossary-tipwrap" ref={wrapRef}>
      <button
        type="button"
        className="stitch-glossary-tip-toggle"
        aria-expanded={open}
        aria-controls={tipId}
        aria-label={`What ${term} means`}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      <span className={`stitch-glossary-tip${open ? ' is-open' : ''}`} id={tipId} role="tooltip">
        <span className="stitch-glossary-tip-term">{term}</span>
        <span className="stitch-glossary-tip-def">{definition}</span>
      </span>
    </span>
  )
}
