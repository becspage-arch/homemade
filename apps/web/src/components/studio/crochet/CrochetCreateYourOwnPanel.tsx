'use client'

/**
 * CrochetCreateYourOwnPanel — the single "Design your own" surface for crochet.
 *
 * A faithful mirror of the cross-stitch `CreateYourOwnPanel`: one page, the ways
 * to make your own switched with the same toggle at the top, gated the same way.
 * Crochet has three rather than two, because the craft does three genuinely
 * different things: a picture worked in colour, a shape worked in the round, and
 * a pattern drawn out of a conversation.
 *
 * The premium gate is identical to cross-stitch's. Premium members and admins get
 * the working tools. A signed-in free member sees the SAME real surface with the
 * premium popup over it and a transparent shield that re-opens the popup on any
 * click, so the gate never drifts from the real UI. Anonymous visitors never
 * reach here; the Studio route sends them to the free sign-in gate first.
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import { CrochetPhotoToTapestryPanel } from './CrochetPhotoToTapestryPanel'
import { CrochetAmigurumiDesignerPanel } from './CrochetAmigurumiDesignerPanel'
import { CrochetIdeaBuilderPanel } from './CrochetIdeaBuilderPanel'
import { PremiumOverlay } from '@/components/public/pattern-access/PremiumOverlay'
import '../shell/studio-shell.css'

export type CrochetDesignMode = 'photo' | 'designer' | 'idea'

interface Props {
  signedIn: boolean
  isPremium: boolean
  initialMode?: CrochetDesignMode
  onSaved: (newId: string) => void
  onCancel: () => void
}

const TABS: Array<{ id: CrochetDesignMode; label: string }> = [
  { id: 'photo', label: 'From a photo' },
  { id: 'designer', label: 'Amigurumi designer' },
  { id: 'idea', label: 'Describe an idea' },
]

export function CrochetCreateYourOwnPanel({
  signedIn,
  isPremium,
  initialMode = 'photo',
  onSaved,
  onCancel,
}: Props) {
  const [mode, setMode] = useState<CrochetDesignMode>(initialMode)
  // Not premium: open the premium popup straight away so the upgrade information
  // is right there over the page, then let them close it and look around.
  const [premiumOpen, setPremiumOpen] = useState(!isPremium)

  const header = (
    <div className="studio-p2c-header">
      <div className="studio-p2c-modeswitch" role="tablist" aria-label="How to design your pattern">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            className={mode === tab.id ? 'active' : ''}
            onClick={() => setMode(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button type="button" className="studio-icon-button" onClick={onCancel} aria-label="Close">
        <X size={18} strokeWidth={1.6} />
      </button>
    </div>
  )

  // The real tool — identical for premium and non-premium, so the gate never
  // drifts from the actual UI.
  const panel =
    mode === 'photo' ? (
      <CrochetPhotoToTapestryPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
    ) : mode === 'designer' ? (
      <CrochetAmigurumiDesignerPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
    ) : (
      <CrochetIdeaBuilderPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
    )

  const body = (
    <div className="crochet-studio-surface crochet-studio-create-surface">
      {panel}
      {!isPremium && (
        <>
          <button
            type="button"
            className="studio-p2c-lockshield"
            onClick={() => setPremiumOpen(true)}
            aria-label="Designing your own is part of Homemade Premium — see what Premium includes"
          />
          <PremiumOverlay open={premiumOpen} onClose={() => setPremiumOpen(false)} />
        </>
      )}
    </div>
  )

  return body
}
