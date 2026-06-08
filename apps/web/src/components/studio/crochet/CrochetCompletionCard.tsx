'use client'

/**
 * CrochetCompletionCard — the celebratory moment that replaces the
 * row list when every row is marked complete.
 *
 *   "You finished {patternName}!"
 *   [Mark project done] [Back to Studio]
 *
 * Stays calm — no confetti, no exclamation marks beyond the heading.
 * A satisfying small moment that respects the maker's work and
 * offers her the natural next steps.
 */

import { Check, ArrowLeft } from 'lucide-react'

interface Props {
  patternName: string
  totalRows: number
  onMarkComplete: () => void
  onClose: () => void
}

export function CrochetCompletionCard({
  patternName,
  totalRows,
  onMarkComplete,
  onClose,
}: Props) {
  return (
    <section className="crochet-studio-completion">
      <div className="crochet-studio-completion-card">
        <div className="crochet-studio-completion-tick" aria-hidden>
          <Check size={28} strokeWidth={2} />
        </div>
        <h2 className="crochet-studio-completion-heading">
          You finished {patternName}.
        </h2>
        <p className="crochet-studio-completion-lede">
          {totalRows} row{totalRows === 1 ? '' : 's'} worked, every one ticked. Block it, weave in
          your ends, and share the finished piece on your maker profile.
        </p>
        <div className="crochet-studio-completion-actions">
          <button
            type="button"
            className="crochet-studio-completion-primary"
            onClick={onMarkComplete}
          >
            <Check size={16} strokeWidth={1.8} />
            <span>Mark project done</span>
          </button>
          <button type="button" className="crochet-studio-completion-secondary" onClick={onClose}>
            <ArrowLeft size={16} strokeWidth={1.5} />
            <span>Back to Studio</span>
          </button>
        </div>
      </div>
    </section>
  )
}
