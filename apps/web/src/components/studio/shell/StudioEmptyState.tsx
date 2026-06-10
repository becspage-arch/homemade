'use client'

/**
 * StudioEmptyState — the first-visit hero. The signed-out version sells
 * the library as the easiest first step; the signed-in version greets
 * the maker and surfaces the three start paths inline.
 *
 * The visual lead is the soft sage hero, a confident Fraunces heading,
 * and three muted cards that read as choices, not as a menu.
 */

import { LibraryBig, Image as ImageIcon, FilePlus2 } from 'lucide-react'
import { StudioLandingHero } from '../StudioLandingHero'

interface StudioEmptyStateProps {
  signedIn: boolean
  userName: string | null
  onBrowseLibrary: () => void
  onStartBlank: () => void
  onStartFromPhoto: () => void
}

export function StudioEmptyState({
  signedIn,
  userName,
  onBrowseLibrary,
  onStartBlank,
  onStartFromPhoto,
}: StudioEmptyStateProps) {
  return (
    <section className="studio-empty">
      <StudioLandingHero
        category="cross-stitch"
        signedIn={signedIn}
        userName={userName}
        lede={
          signedIn
            ? 'Open a pattern below, browse the library, or start fresh from a photo.'
            : 'Browse the library, turn a photo into a chart, or start with a blank canvas. Mark stitched as you go, switch fabric counts, swap floss brands, and print a clean PDF when you are ready.'
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
        <button type="button" className="studio-empty-card" onClick={onStartFromPhoto}>
          <ImageIcon size={24} strokeWidth={1.4} />
          <div className="studio-empty-card-body">
            <div className="studio-empty-card-title">Start from a photo</div>
            <div className="studio-empty-card-sub">Drop in a photo, watch it become a chart</div>
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
