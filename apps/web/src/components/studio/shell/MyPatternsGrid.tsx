'use client'

/**
 * MyPatternsGrid — the signed-in user's saved patterns. Cards lead with
 * a server-rendered thumbnail; hover reveals actions (rename / delete).
 * Empty list draws no grid at all — the empty-state hero already covers
 * the "what to do next" beat.
 */

import type { MyPatternListItem } from './StudioShell'

interface MyPatternsGridProps {
  patterns: MyPatternListItem[]
  onOpen: (id: string) => void
}

export function MyPatternsGrid({ patterns, onOpen }: MyPatternsGridProps) {
  if (patterns.length === 0) return null

  return (
    <section className="studio-my-patterns">
      <h2 className="studio-my-patterns-heading">Your patterns</h2>
      <ul className="studio-my-patterns-grid">
        {patterns.map((p) => (
          <li key={p.id} className="studio-my-patterns-card">
            <button type="button" className="studio-my-patterns-card-button" onClick={() => onOpen(p.id)}>
              <div className="studio-my-patterns-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/studio/patterns/${p.id}/thumbnail`} alt="" loading="lazy" />
              </div>
              <div className="studio-my-patterns-meta">
                <div className="studio-my-patterns-name">{p.name}</div>
                <div className="studio-my-patterns-sub">
                  {p.widthCells} × {p.heightCells} · {p.colourCount} colours
                </div>
                <div className="studio-my-patterns-time">{relativeTime(p.updatedAt)}</div>
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
