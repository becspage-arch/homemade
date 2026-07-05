'use client'

/**
 * CreateYourOwnPanel — the single "Design your own" surface.
 *
 * One page, two ways to make your own cross-stitch pattern, switched with a
 * toggle at the top:
 *   - Describe an idea → we draw it (Flux) → turn it into a chart.
 *   - Upload a photo   → turn it into a chart.
 *
 * Both are premium create-your-own. Premium members (and admins) get the
 * working panels. A signed-in free member sees the SAME real surface with the
 * premium popup over it (the real /premium page embedded — the same overlay the
 * pattern unlock CTA uses); a transparent shield disables the tool behind it
 * and re-opens the popup on any click, so the gate never drifts from the real
 * UI. Anonymous visitors never reach here — the Studio route sends them to the
 * free sign-in gate first.
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import { IdeaToPatternPanel } from './IdeaToPatternPanel'
import { PhotoToChartPanel } from './PhotoToChartPanel'
import { PremiumOverlay } from '@/components/public/pattern-access/PremiumOverlay'

export type DesignMode = 'idea' | 'photo'

interface CreateYourOwnPanelProps {
  signedIn: boolean
  isPremium: boolean
  initialMode?: DesignMode
  onSaved: (newId: string) => void
  onCancel: () => void
}

export function CreateYourOwnPanel({
  signedIn,
  isPremium,
  initialMode = 'idea',
  onSaved,
  onCancel,
}: CreateYourOwnPanelProps) {
  const [mode, setMode] = useState<DesignMode>(initialMode)
  // Non-premium: open the premium popup straight away so the upgrade info is
  // right there over the page, then let them close it to look around.
  const [premiumOpen, setPremiumOpen] = useState(!isPremium)

  const header = (
    <div className="studio-p2c-header">
      <div className="studio-p2c-modeswitch" role="tablist" aria-label="How to design your pattern">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'idea'}
          className={mode === 'idea' ? 'active' : ''}
          onClick={() => setMode('idea')}
        >
          Describe an idea
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'photo'}
          className={mode === 'photo' ? 'active' : ''}
          onClick={() => setMode('photo')}
        >
          Upload a photo
        </button>
      </div>
      <button type="button" className="studio-icon-button" onClick={onCancel} aria-label="Close">
        <X size={18} strokeWidth={1.6} />
      </button>
    </div>
  )

  // The real tool — identical for premium and non-premium, so the gate never
  // drifts from the actual UI.
  const panel =
    mode === 'idea' ? (
      <IdeaToPatternPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
    ) : (
      <PhotoToChartPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
    )

  if (isPremium) return panel

  // Free Maker: the real surface, disabled behind the premium popup. The shield
  // intercepts clicks (so nothing runs) and re-opens the popup.
  return (
    <>
      {panel}
      <button
        type="button"
        className="studio-p2c-lockshield"
        onClick={() => setPremiumOpen(true)}
        aria-label="Designing your own is part of Homemade Premium — see what Premium includes"
      />
      <PremiumOverlay open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </>
  )
}
