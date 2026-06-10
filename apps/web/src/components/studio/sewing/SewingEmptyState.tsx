'use client'

/**
 * SewingEmptyState - first-visit Studio landing for sewing. Signed-out
 * users see the three start paths plus the sign-in carrot. Signed-in
 * users see the same starts with a personalised greeting; their existing
 * projects render in a separate grid below the hero (handled by the
 * shell).
 *
 * Voice: calm and direct, no marketing language, no em / en dashes.
 */

import { LibraryBig, FolderPlus, Link2 } from 'lucide-react'
import { StudioLandingHero } from '../StudioLandingHero'

interface SewingEmptyStateProps {
  signedIn: boolean
  userName: string | null
  onBrowseLibrary: () => void
  onStartFromUrl: () => void
  onStartNewProject: () => void
  onOpenDemo: () => void
}

export function SewingEmptyState({
  signedIn,
  userName,
  onBrowseLibrary,
  onStartFromUrl,
  onStartNewProject,
  onOpenDemo,
}: SewingEmptyStateProps) {
  return (
    <section className="sewing-studio-empty">
      <StudioLandingHero
        category="sewing"
        signedIn={signedIn}
        userName={userName}
        lede={
          signedIn
            ? 'Open a project, browse the library, or start something new.'
            : 'Open a pattern, calibrate your print, and start sewing. The Studio works with your printer, a credit card, or a projector.'
        }
      />

      <div className="sewing-studio-empty-actions">
        <button
          type="button"
          className="sewing-studio-empty-card primary"
          onClick={onBrowseLibrary}
        >
          <LibraryBig size={24} strokeWidth={1.4} />
          <div className="sewing-studio-empty-card-body">
            <div className="sewing-studio-empty-card-title">Browse sewing patterns</div>
            <div className="sewing-studio-empty-card-sub">
              Tops, dresses, bottoms, accessories, bags, home
            </div>
          </div>
        </button>
        <button
          type="button"
          className="sewing-studio-empty-card"
          onClick={onStartNewProject}
        >
          <FolderPlus size={24} strokeWidth={1.4} />
          <div className="sewing-studio-empty-card-body">
            <div className="sewing-studio-empty-card-title">Start a project</div>
            <div className="sewing-studio-empty-card-sub">
              Pick a pattern and set up your size, fabric, and notions
            </div>
          </div>
        </button>
        <button
          type="button"
          className="sewing-studio-empty-card"
          onClick={onStartFromUrl}
        >
          <Link2 size={24} strokeWidth={1.4} />
          <div className="sewing-studio-empty-card-body">
            <div className="sewing-studio-empty-card-title">Open from URL</div>
            <div className="sewing-studio-empty-card-sub">
              Paste a sewing pattern link to follow it step by step
            </div>
          </div>
        </button>
        <button
          type="button"
          className="sewing-studio-empty-card"
          onClick={onOpenDemo}
        >
          <FolderPlus size={24} strokeWidth={1.4} />
          <div className="sewing-studio-empty-card-body">
            <div className="sewing-studio-empty-card-title">Open the sample pattern</div>
            <div className="sewing-studio-empty-card-sub">
              An A-line skirt for trying the viewer, print, and projector
            </div>
          </div>
        </button>
      </div>

      {!signedIn && (
        <div className="sewing-studio-empty-carrots">
          <strong>Sign in for free progress sync.</strong> Your size, your fabric
          choice, your step tracking, and your projects follow you to every
          device. The Studio works fine without an account. Sign in when you
          want a backup.
        </div>
      )}
    </section>
  )
}
