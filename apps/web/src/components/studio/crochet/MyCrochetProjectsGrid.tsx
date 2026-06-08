'use client'

import type { MyCrochetProjectListItem } from './types'

interface Props {
  projects: MyCrochetProjectListItem[]
  onOpen: (id: string) => void
}

/**
 * MyCrochetProjectsGrid — saved projects in progress. Each card surfaces
 * the pattern name, where the user left off ("Round 12 of 22 in Body"),
 * and how long ago. Tap opens the active-project surface at exactly that
 * row.
 */
export function MyCrochetProjectsGrid({ projects, onOpen }: Props) {
  if (projects.length === 0) return null

  return (
    <section className="crochet-studio-my-projects">
      <h2 className="crochet-studio-my-projects-heading">Your projects</h2>
      <ul className="crochet-studio-my-projects-grid">
        {projects.map((p) => (
          <li key={p.crochetPatternId} className="crochet-studio-my-projects-card">
            <button
              type="button"
              className="crochet-studio-my-projects-card-button"
              onClick={() => onOpen(p.crochetPatternId)}
            >
              <div className="crochet-studio-my-projects-meta">
                <div className="crochet-studio-my-projects-name">{p.patternName}</div>
                <div className="crochet-studio-my-projects-sub">
                  {p.completedAt
                    ? 'Finished'
                    : p.currentRow > 0
                    ? `${p.currentSection ? `${p.currentSection} · ` : ''}row ${p.currentRow}`
                    : 'Not started'}
                </div>
                <div className="crochet-studio-my-projects-time">{relativeTime(p.lastWorkedAt)}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const seconds = Math.round((now - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
