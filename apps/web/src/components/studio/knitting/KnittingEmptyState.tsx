'use client'

/**
 * KnittingEmptyState — the first-visit hero. Signed-out users land
 * here with three start paths plus the free-tier sign-in carrots.
 * Signed-in users see a personalised greeting and the same starts
 * (their existing projects render below the hero).
 *
 * Voice: calm and direct. Patterns wait; the reader picks one and
 * starts. No marketing language. No ! anywhere. No em / en dashes.
 */

import { LibraryBig, FolderPlus, Link2 } from 'lucide-react'
import { StudioLandingHero } from '../StudioLandingHero'

interface KnittingEmptyStateProps {
  signedIn: boolean
  userName: string | null
  onBrowseLibrary: () => void
  onStartFromUrl: () => void
  onStartNewProject: () => void
}

export function KnittingEmptyState({
  signedIn,
  userName,
  onBrowseLibrary,
  onStartFromUrl,
  onStartNewProject,
}: KnittingEmptyStateProps) {
  return (
    <section className="knitting-studio-empty">
      <StudioLandingHero
        category="knitting"
        signedIn={signedIn}
        userName={userName}
        lede={
          signedIn
            ? 'Open a project, browse the library, or start something new.'
            : 'Open a pattern, mark each row as you go, switch between written and chart. Your place is saved as you work.'
        }
      />

      <div className="knitting-studio-empty-actions">
        <button
          type="button"
          className="knitting-studio-empty-card primary"
          onClick={onBrowseLibrary}
        >
          <LibraryBig size={24} strokeWidth={1.4} />
          <div className="knitting-studio-empty-card-body">
            <div className="knitting-studio-empty-card-title">Browse knitting patterns</div>
            <div className="knitting-studio-empty-card-sub">
              Hats, socks, shawls, sweaters, blankets, colourwork, lace, cable
            </div>
          </div>
        </button>
        <button
          type="button"
          className="knitting-studio-empty-card"
          onClick={onStartNewProject}
        >
          <FolderPlus size={24} strokeWidth={1.4} />
          <div className="knitting-studio-empty-card-body">
            <div className="knitting-studio-empty-card-title">Start a project</div>
            <div className="knitting-studio-empty-card-sub">
              Pick a pattern and set up your yarn, needles, and gauge
            </div>
          </div>
        </button>
        <button
          type="button"
          className="knitting-studio-empty-card"
          onClick={onStartFromUrl}
        >
          <Link2 size={24} strokeWidth={1.4} />
          <div className="knitting-studio-empty-card-body">
            <div className="knitting-studio-empty-card-title">Open from URL</div>
            <div className="knitting-studio-empty-card-sub">
              Paste a knitting pattern link to follow it row by row
            </div>
          </div>
        </button>
      </div>

      {!signedIn && (
        <div className="knitting-studio-empty-carrots">
          <strong>Sign in for free progress sync.</strong> Your row counter, your
          notes, and your projects follow you to every device. The Studio works
          fine without an account — sign in when you want a backup.
        </div>
      )}
    </section>
  )
}
