import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma, UGCPhotoStatus, UserProjectStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { harvestSupplies } from '@/lib/supplies'
import { mediaUrl } from '@/lib/media'
import type { TipTapNode } from '@/components/public/tutorial-content/types'
import { ProjectSupplies } from './project-supplies'
import { ProjectNotes } from './project-notes'
import { ProjectStatusControls } from './project-status-controls'
import { ProjectPublish } from './project-publish'

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
  IN_PROGRESS: 'Making',
  COMPLETED: 'Made it',
  ABANDONED: 'Abandoned',
}

interface WhatIUsedRow {
  name: string
  note?: string | null
}

function readWhatIUsedRows(raw: unknown): WhatIUsedRow[] {
  if (!Array.isArray(raw)) return []
  const out: WhatIUsedRow[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    if (typeof r.name !== 'string') continue
    out.push({
      name: r.name,
      note: typeof r.note === 'string' ? r.note : null,
    })
  }
  return out
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
          id: true,
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

  // Approved UGC photos this Maker has uploaded for this tutorial — used as
  // hero-photo options on the publish form.
  const ownedPhotos = await prisma.uGCPhoto.findMany({
    where: {
      userId: user.id,
      tutorialId: project.tutorial.id,
      status: UGCPhotoStatus.APPROVED,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      caption: true,
      media: { select: { cloudflareId: true, r2Key: true } },
    },
  })

  const supplies = harvestSupplies(project.tutorial.body as TipTapNode | null)
  const checked = Array.isArray(project.suppliesChecked)
    ? (project.suppliesChecked as string[]).filter((s) => typeof s === 'string')
    : []

  const initialWhatIUsed: WhatIUsedRow[] = readWhatIUsedRows(project.whatIUsed)

  const photoOptions = ownedPhotos.map((p) => ({
    id: p.id,
    thumbUrl: mediaUrl(p.media, 'thumbnail'),
    caption: p.caption ?? null,
  }))

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
            Anything you want to remember about how this one&apos;s going. Saves as
            you type.
          </p>
          <ProjectNotes projectId={project.id} initialNotes={project.notes} />
        </div>

        <div style={{ marginTop: 32 }}>
          <span className="me-section-label">Made it</span>
          <h3 className="me-section-title" style={{ fontSize: 18 }}>
            On your Maker profile
          </h3>
          <p className="me-section-description">
            Add a note, list what you used, and pick a hero photo. Toggle the
            switch to publish — your Made it page goes live on your public
            Maker profile.
          </p>
          <ProjectPublish
            projectId={project.id}
            initialIsPublic={project.isPublic}
            initialPublicNote={project.publicNote}
            initialWhatIUsed={initialWhatIUsed}
            initialHeroPhotoId={project.heroPhotoId}
            ownerHandle={user.displayHandle}
            photos={photoOptions}
          />
        </div>
      </div>

      <aside className="me-project-aside">
        <span className="me-section-label">Supplies</span>
        {supplies.length === 0 ? (
          <p
            className="me-section-description"
            style={{ margin: 0, fontStyle: 'italic' }}
          >
            This tutorial doesn&apos;t list supplies yet.
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
