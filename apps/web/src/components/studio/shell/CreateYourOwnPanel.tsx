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
 * working panels. A signed-in free member sees the surface with the premium
 * popup over it (the real /premium page embedded — same overlay the pattern
 * unlock CTA uses), NOT a separate full-page block. Anonymous visitors never
 * reach here: the Studio route sends them to the free sign-in gate first.
 */

import { useState } from 'react'
import { X, Sparkles, Image as ImageIcon } from 'lucide-react'
import { IdeaToPatternPanel } from './IdeaToPatternPanel'
import { PhotoToChartPanel } from './PhotoToChartPanel'
import { PremiumBadge } from '@/components/premium/PremiumBadge'
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

  if (!isPremium) {
    return (
      <section className="studio-p2c">
        <div className="studio-p2c-preview">
          <div className="studio-p2c-gate-art">
            <PremiumBadge />
            <h2>Design your own</h2>
            <p>
              Describe an idea and we&apos;ll draw it, or upload a photo — then turn it into your own
              stitchable chart, palette-mapped to real floss and saved to your patterns.
            </p>
          </div>
        </div>
        <div className="studio-p2c-controls">
          <div className="studio-p2c-header">
            <h2 className="studio-p2c-title">Design your own</h2>
            <button type="button" className="studio-icon-button" onClick={onCancel} aria-label="Close">
              <X size={18} strokeWidth={1.6} />
            </button>
          </div>
          <ul className="studio-p2c-gate-list">
            <li>
              <Sparkles size={17} strokeWidth={1.7} />
              <span><strong>Describe an idea</strong> — we draw it, you regenerate until you love it.</span>
            </li>
            <li>
              <ImageIcon size={17} strokeWidth={1.7} />
              <span><strong>Upload a photo</strong> — turned into a real floss chart.</span>
            </li>
          </ul>
          <p className="studio-p2c-checkbox-hint">
            Designing your own is part of Homemade Premium. Your finished pattern is yours — saved to
            your patterns and opened in your Studio.
          </p>
          <div className="studio-dialog-actions">
            <button type="button" className="studio-button ghost" onClick={onCancel}>Cancel</button>
            <button type="button" className="studio-button primary" onClick={() => setPremiumOpen(true)}>
              See what Premium includes
            </button>
          </div>
        </div>
        <PremiumOverlay open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      </section>
    )
  }

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

  return mode === 'idea' ? (
    <IdeaToPatternPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
  ) : (
    <PhotoToChartPanel signedIn={signedIn} onSaved={onSaved} onCancel={onCancel} header={header} />
  )
}
