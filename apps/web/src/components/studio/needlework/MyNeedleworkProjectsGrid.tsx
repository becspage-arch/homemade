'use client'

import { DISCIPLINE_LABELS, type MyNeedleworkProjectListItem } from './types'

interface MyNeedleworkProjectsGridProps {
  projects: MyNeedleworkProjectListItem[]
  onOpen: (id: string) => void
}

export function MyNeedleworkProjectsGrid({ projects, onOpen }: MyNeedleworkProjectsGridProps) {
  if (projects.length === 0) return null

  return (
    <div className="needlework-studio-my-projects">
      <p className="needlework-studio-my-projects-heading">Your projects</p>
      <ul className="needlework-studio-my-projects-grid">
        {projects.map((p) => (
          <li key={p.needleworkPatternId}>
            <button
              type="button"
              className="needlework-studio-project-card"
              onClick={() => onOpen(p.needleworkPatternId)}
            >
              <span className="needlework-studio-project-card-name">{p.patternName}</span>
              <span className="needlework-studio-project-card-meta">
                {DISCIPLINE_LABELS[p.discipline]}
                {p.completedAt ? ' · Finished' : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
