'use client'

/**
 * NeedleworkCreateYourOwnPanel — the "Design your own" surface for NEEDLEWORK.
 *
 * A faithful mirror of the cross-stitch `CreateYourOwnPanel`: one page, two ways
 * to make your own — describe an idea (Flux → approve → pattern) or upload a
 * photo — switched with the same toggle, gated the same way. Only the child
 * panels differ (the needlework converter + render). The premium gate is
 * identical: premium members get the working panels; a signed-in free member
 * sees the SAME real surface with the premium popup over it and a transparent
 * shield that re-opens the popup on any click, so the gate never drifts from the
 * real UI.
 */

import { useState } from 'react'
import { NeedleworkIdeaPanel, NeedleworkPhotoPanel } from './NeedleworkDesignPanels'
import { PremiumOverlay } from '@/components/public/pattern-access/PremiumOverlay'
import '../shell/studio-shell.css'

export type NeedleworkDesignMode = 'idea' | 'photo'

interface NeedleworkCreateYourOwnPanelProps {
  signedIn: boolean
  isPremium: boolean
  initialMode?: NeedleworkDesignMode
  onSaved: (newId: string) => void
  onCancel: () => void
}

export function NeedleworkCreateYourOwnPanel({
  signedIn,
  isPremium,
  initialMode = 'idea',
  onSaved,
  onCancel,
}: NeedleworkCreateYourOwnPanelProps) {
  const [mode, setMode] = useState<NeedleworkDesignMode>(initialMode)
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
        {/* lucide X, but keep the panel dependency-light — the icon is decorative */}
        <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>×</span>
      </button>
    </div>
  )

  const panel =
    mode === 'idea' ? (
      <NeedleworkIdeaPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
    ) : (
      <NeedleworkPhotoPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
    )

  if (isPremium) return panel

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
