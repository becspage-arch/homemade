'use client'

/**
 * MyKnittingProjectsGrid — signed-in user's recent projects, listed
 * below the empty-state hero. Server-side sync wires this once the
 * KnittingPattern model lands (K-4); v1 reads from props supplied by
 * the page loader and renders an empty grid until the data layer is
 * up. The grid surface itself stays correct so K-4 is a wiring-only
 * follow-on.
 */

interface ProjectListItem {
  knittingPatternId: string
  patternName: string
  shapeCategory: string | null
  difficulty: string | null
  thumbnailMediaId: string | null
  currentRow: number
  currentSection: string | null
  lastWorkedAt: string
  completedAt: string | null
}

interface MyKnittingProjectsGridProps {
  projects: ProjectListItem[]
  onOpen: (knittingPatternId: string) => void
}

export function MyKnittingProjectsGrid({
  projects,
  onOpen,
}: MyKnittingProjectsGridProps) {
  if (projects.length === 0) return null
  return (
    <section className="knitting-studio-my-projects">
      <h2 className="knitting-studio-my-projects-heading">Your projects</h2>
      <ul className="knitting-studio-my-projects-grid">
        {projects.map((project) => (
          <li key={project.knittingPatternId} className="knitting-studio-my-projects-card">
            <button
              type="button"
              className="knitting-studio-my-projects-card-button"
              onClick={() => onOpen(project.knittingPatternId)}
            >
              <div className="knitting-studio-my-projects-name">{project.patternName}</div>
              <div className="knitting-studio-my-projects-sub">
                {project.completedAt
                  ? 'Finished'
                  : project.currentSection
                  ? `${project.currentSection} · row ${project.currentRow}`
                  : `Row ${project.currentRow}`}
              </div>
              <div className="knitting-studio-my-projects-time">
                {formatRelativeTime(project.lastWorkedAt)}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = now - then
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d ago`
  if (days < 30) return `${Math.floor(days / 7)} wk ago`
  return new Date(iso).toLocaleDateString()
}
