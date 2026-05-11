import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma, UserProjectStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { harvestSupplies } from '@/lib/supplies'
import type { TipTapNode } from '@/components/public/tutorial-content/types'
import { ProjectSupplies } from './project-supplies'
import { ProjectNotes } from './project-notes'
import { ProjectStatusControls } from './project-status-controls'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ projectId: string }>
}

const STATUS_PILL_CLASS: Record<UserProjectStatus, string> = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
}

const STATUS_LABEL: Record<UserProjectStatus, string> = {
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  ABANDONED: 'Abandoned',
}

export default async function MeProjectDetailPage({ params }: PageProps) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')

  const { projectId } = await params
  const project = await prisma.userProject.findFirst({
    where: { id: projectId, userId: user.id },
    include: {
      tutorial: {
        select: {
          slug: true,
          title: true,
          subtitle: true,
          body: true,
          difficulty: true,
          timeMinutes: true,
          category: { select: { slug: true, name: true } },
        },
      },
    },
  })
  if (!project) notFound()

  const supplies = harvestSupplies(project.tutorial.body as TipTapNode | null)
  const checked = Array.isArray(project.suppliesChecked)
    ? (project.suppliesChecked as string[]).filter((s) => typeof s === 'string')
    : []

  return (
    <section className="me-project-page">
      <div>
        <span className="me-section-label">{project.tutorial.category.name}</span>
        <h2 className="me-section-title">{project.tutorial.title}</h2>
        {project.tutorial.subtitle && (
          <p className="me-section-description">{project.tutorial.subtitle}</p>
        )}

        <div className="me-project-meta" style={{ marginBottom: 24 }}>
          <span className={`me-status-pill ${STATUS_PILL_CLASS[project.status]}`}>
            {STATUS_LABEL[project.status]}
          </span>
          <span>started {formatShortDate(project.startedAt)}</span>
          {project.completedAt && (
            <span>· finished {formatShortDate(project.completedAt)}</span>
          )}
          {project.status === UserProjectStatus.IN_PROGRESS && (
            <span>· {project.readingProgressPercent}% through</span>
          )}
        </div>

        <p style={{ marginBottom: 24 }}>
          <Link
            href={`/${project.tutorial.category.slug}/${project.tutorial.slug}`}
            className="me-button secondary"
          >
            Open the tutorial
          </Link>
        </p>

        <ProjectStatusControls projectId={project.id} status={project.status} />

        <div style={{ marginTop: 32 }}>
          <span className="me-section-label">Your notes</span>
          <h3 className="me-section-title" style={{ fontSize: 18 }}>
            Private to you
          </h3>
          <p className="me-section-description">
            Anything you want to remember about how this one's going. Saves as
            you type.
          </p>
          <ProjectNotes projectId={project.id} initialNotes={project.notes} />
        </div>
      </div>

      <aside className="me-project-aside">
        <span className="me-section-label">Supplies</span>
        {supplies.length === 0 ? (
          <p
            className="me-section-description"
            style={{ margin: 0, fontStyle: 'italic' }}
          >
            This tutorial doesn't list supplies yet.
          </p>
        ) : (
          <ProjectSupplies
            projectId={project.id}
            supplies={supplies}
            initialChecked={checked}
          />
        )}
      </aside>
    </section>
  )
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
