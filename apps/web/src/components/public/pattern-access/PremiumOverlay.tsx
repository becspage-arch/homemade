'use client'

/**
 * In-page premium overlay — an iframe of the REAL /premium page (single source
 * of truth: any change to /premium shows here automatically). It's a normal
 * in-flow modal div, NOT a window.open popup, so browsers never block it. The
 * embedded page is loaded with ?embed=1 so it drops the site header/footer and
 * shows only the premium content.
 *
 * Used by the pattern unlock CTA: "Sign up free" opens this so we upsell premium
 * at the conversion moment while keeping the visitor on the pattern page.
 */

import { useEffect, type MouseEvent } from 'react'

interface PremiumOverlayProps {
  open: boolean
  onClose: () => void
}

export function PremiumOverlay({ open, onClose }: PremiumOverlayProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="premium-overlay-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Homemade Premium"
    >
      <div className="premium-overlay-panel" onClick={(e: MouseEvent) => e.stopPropagation()}>
        <button type="button" className="premium-overlay-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <iframe src="/premium?embed=1" title="Homemade Premium" className="premium-overlay-iframe" />
      </div>
    </div>
  )
}
