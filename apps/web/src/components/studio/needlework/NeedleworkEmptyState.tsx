'use client'

import { LibraryBig, Sparkles } from 'lucide-react'
import { StudioLandingHero } from '../StudioLandingHero'

interface NeedleworkEmptyStateProps {
  signedIn: boolean
  userName: string | null
  onBrowseLibrary: () => void
  onDesignYourOwn: () => void
}

/**
 * Needlework Studio empty state. Mirrors the cross-stitch Studio empty state
 * (`StudioEmptyState`): browse the library, design your own, and — rendered by
 * the shell below this — your own projects. It deliberately does NOT offer a
 * discipline picker: only surface embroidery has published patterns, and the
 * other disciplines (blackwork, hardanger, sashiko, …) would dead-end on empty
 * shelves. Browsing by discipline still happens on the /needlework category
 * page, which shows only the shelves that have content.
 */
export function NeedleworkEmptyState({
  signedIn,
  userName,
  onBrowseLibrary,
  onDesignYourOwn,
}: NeedleworkEmptyStateProps) {
  return (
    <section className="needlework-studio-empty">
      <StudioLandingHero
        category="needlework"
        signedIn={signedIn}
        userName={userName}
        lede={
          signedIn
            ? 'Open a project below, browse the library, or design your own from an idea or a photo.'
            : 'Follow patterns stitch by stitch, or design your own from an idea or a photo. Save your place, add notes, print a clean PDF.'
        }
      />

      <button
        type="button"
        className="needlework-studio-library-cta"
        onClick={onBrowseLibrary}
        style={{ marginBottom: '1rem' }}
      >
        <LibraryBig
          size={22}
          strokeWidth={1.4}
          style={{ flexShrink: 0, color: 'var(--colour-text-muted)' }}
        />
        <div className="needlework-studio-library-cta-body">
          <div className="needlework-studio-library-cta-title">Browse the library</div>
          <div className="needlework-studio-library-cta-sub">
            Thread-painting and surface embroidery patterns ready to stitch
          </div>
        </div>
      </button>

      <button type="button" className="needlework-studio-library-cta" onClick={onDesignYourOwn}>
        <Sparkles
          size={22}
          strokeWidth={1.4}
          style={{ flexShrink: 0, color: 'var(--colour-text-muted)' }}
        />
        <div className="needlework-studio-library-cta-body">
          <div className="needlework-studio-library-cta-title">Design your own</div>
          <div className="needlework-studio-library-cta-sub">
            Describe an idea or upload a photo — we turn it into your own thread-painting pattern
          </div>
        </div>
      </button>
    </section>
  )
}
