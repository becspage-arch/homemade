'use client'

/**
 * StudioEmptyState — the first-visit hero. The signed-out version sells
 * the library as the easiest first step; the signed-in version greets
 * the maker and surfaces the three start paths inline.
 *
 * The visual lead is the soft sage hero, a confident Fraunces heading,
 * and three muted cards that read as choices, not as a menu.
 */

import { LibraryBig, FilePlus2, Sparkles } from 'lucide-react'
import { StudioLandingHero } from '../StudioLandingHero'

interface StudioEmptyStateProps {
  signedIn: boolean
  userName: string | null
  onBrowseLibrary: () => void
  onStartBlank: () => void
  onStartDesign: () => void
}

export function StudioEmptyState({
  signedIn,
  userName,
  onBrowseLibrary,
  onStartBlank,
  onStartDesign,
}: StudioEmptyStateProps) {
  return (
    <section className="studio-empty">
      <StudioLandingHero
        category="cross-stitch"
        signedIn={signedIn}
        userName={userName}
        lede={
          signedIn
            ? 'Open a pattern below, browse the library, or design your own from an idea or a photo.'
            : 'Browse the library, design your own from an idea or a photo, or start with a blank canvas. Mark stitched as you go, switch fabric counts, swap floss brands, and print a clean PDF when you are ready.'
        }
      />

      <div className="studio-empty-actions">
        <button type="button" className="studio-empty-card primary" onClick={onBrowseLibrary}>
          <LibraryBig size={24} strokeWidth={1.4} />
          <div className="studio-empty-card-body">
            <div className="studio-empty-card-title">Browse the library</div>
            <div className="studio-empty-card-sub">Designed patterns ready to stitch</div>
          </div>
        </button>
        <button type="button" className="studio-empty-card" onClick={onStartDesign}>
          <Sparkles size={24} strokeWidth={1.4} />
          <div className="studio-empty-card-body">
            <div className="studio-empty-card-title">Design your own</div>
            <div className="studio-empty-card-sub">Describe an idea or upload a photo — we make the chart</div>
          </div>
        </button>
        <button type="button" className="studio-empty-card" onClick={onStartBlank}>
          <FilePlus2 size={24} strokeWidth={1.4} />
          <div className="studio-empty-card-body">
            <div className="studio-empty-card-title">Blank canvas</div>
            <div className="studio-empty-card-sub">Pick dimensions, design from the grid up</div>
          </div>
        </button>
      </div>
    </section>
  )
}
