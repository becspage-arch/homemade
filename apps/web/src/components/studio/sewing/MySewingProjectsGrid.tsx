'use client'

/**
 * Grid of the user's existing sewing projects. Shown on the signed-in
 * empty state below the start cards. Click opens the pattern in the
 * Studio. Mirrors MyKnittingProjectsGrid in shape.
 */

import type { MySewingProjectListItem } from './types'

interface MySewingProjectsGridProps {
  projects: MySewingProjectListItem[]
  onOpen: (slug: string) => void
}

export function MySewingProjectsGrid({ projects, onOpen }: MySewingProjectsGridProps) {
  if (projects.length === 0) return null
  return (
    <section className="sewing-studio-projects" aria-label="Your sewing projects">
      <h2 className="sewing-studio-projects-heading">Your sewing projects</h2>
      <div className="sewing-studio-projects-grid">
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            className="sewing-studio-project-card"
            onClick={() => onOpen(p.patternSlug)}
          >
            <div className="sewing-studio-project-card-name">{p.patternName}</div>
            <div className="sewing-studio-project-card-meta">
              {p.selectedSize ? `Size ${p.selectedSize}` : 'Size not picked'}
              {p.stepsTotal > 0 && (
                <span>
                  {' · '}
                  {p.stepsCompleted}/{p.stepsTotal} steps
                </span>
              )}
              <br />
              <span style={{ fontSize: '0.78rem' }}>
                Last worked {formatRelative(p.lastWorkedAt)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
