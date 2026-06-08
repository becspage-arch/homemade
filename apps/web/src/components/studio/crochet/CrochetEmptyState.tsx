'use client'

/**
 * CrochetEmptyState — the first-visit hero. Signed-out users see the
 * library as the primary route in; signed-in users get the greeting +
 * three start paths (library, amigurumi designer stub, photo-to-
 * tapestry stub, AI custom-pattern stub) — the latter three sit behind
 * premium gates that activate in step 13.
 */

import { LibraryBig, Sparkles, ImageDown, Wand2 } from 'lucide-react'

interface CrochetEmptyStateProps {
  signedIn: boolean
  userName: string | null
  onBrowseLibrary: () => void
  onOpenAmigurumiDesigner: () => void
  onOpenPhotoToTapestry: () => void
  onOpenAiAssisted: () => void
}

export function CrochetEmptyState({
  signedIn,
  userName,
  onBrowseLibrary,
  onOpenAmigurumiDesigner,
  onOpenPhotoToTapestry,
  onOpenAiAssisted,
}: CrochetEmptyStateProps) {
  return (
    <section className="crochet-studio-empty">
      <div className="crochet-studio-empty-hero">
        <p className="crochet-studio-empty-overline">Crochet Studio</p>
        <h1 className="crochet-studio-empty-heading">
          {signedIn
            ? `Welcome back${userName ? `, ${userName.split(' ')[0]}` : ''}.`
            : 'Pick up your hook.'}
        </h1>
        <p className="crochet-studio-empty-lede">
          {signedIn
            ? 'Open a project below, browse the library, or start something new.'
            : 'Browse the library, follow patterns row by row, save your place, switch between written and chart. Print a clean PDF whenever the work goes off-screen.'}
        </p>
      </div>

      <div className="crochet-studio-empty-actions">
        <button
          type="button"
          className="crochet-studio-empty-card primary"
          onClick={onBrowseLibrary}
        >
          <LibraryBig size={24} strokeWidth={1.4} />
          <div className="crochet-studio-empty-card-body">
            <div className="crochet-studio-empty-card-title">Browse the library</div>
            <div className="crochet-studio-empty-card-sub">
              Foundations, stitches, motifs, blankets, garments, amigurumi
            </div>
          </div>
        </button>
        <button type="button" className="crochet-studio-empty-card" onClick={onOpenAmigurumiDesigner}>
          <Sparkles size={24} strokeWidth={1.4} />
          <div className="crochet-studio-empty-card-body">
            <div className="crochet-studio-empty-card-title">Amigurumi shape designer</div>
            <div className="crochet-studio-empty-card-sub">Premium · pick a shape, get a written pattern</div>
          </div>
        </button>
        <button type="button" className="crochet-studio-empty-card" onClick={onOpenPhotoToTapestry}>
          <ImageDown size={24} strokeWidth={1.4} />
          <div className="crochet-studio-empty-card-body">
            <div className="crochet-studio-empty-card-title">Photo to tapestry</div>
            <div className="crochet-studio-empty-card-sub">Premium · turn a photo into a tapestry chart</div>
          </div>
        </button>
        <button type="button" className="crochet-studio-empty-card" onClick={onOpenAiAssisted}>
          <Wand2 size={24} strokeWidth={1.4} />
          <div className="crochet-studio-empty-card-body">
            <div className="crochet-studio-empty-card-title">Custom, designed for you</div>
            <div className="crochet-studio-empty-card-sub">Premium · describe what you want, we draft it</div>
          </div>
        </button>
      </div>
    </section>
  )
}
