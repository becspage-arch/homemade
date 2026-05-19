import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, UGCPhotoStatus } from '@homemade/db'
import { mediaUrl } from '@/lib/media'

import '../../maker-profile.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ handle: string; projectId: string }>
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

async function loadProject(handle: string, projectId: string) {
  const project = await prisma.userProject.findFirst({
    where: {
      id: projectId,
      isPublic: true,
      user: {
        displayHandle: handle.toLowerCase(),
        isPublicMakerProfile: true,
      },
    },
    include: {
      user: {
        select: { id: true, name: true, displayHandle: true },
      },
      tutorial: {
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          excerpt: true,
          category: { select: { slug: true, name: true } },
          hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
        },
      },
      heroPhoto: {
        select: {
          id: true,
          status: true,
          media: { select: { cloudflareId: true, r2Key: true, alt: true } },
        },
      },
    },
  })
  return project
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle, projectId } = await params
  const project = await loadProject(handle, projectId)
  if (!project) return { title: 'Not found · homemade' }
  const name = project.user.name ?? project.user.displayHandle ?? 'A maker'
  return {
    title: `${project.tutorial.title} · Made by ${name} · homemade`,
    description: project.publicNote ?? project.tutorial.excerpt ?? undefined,
    robots: { index: false, follow: false },
  }
}

export default async function MakerMadeDetailPage({ params }: PageProps) {
  const { handle, projectId } = await params
  const project = await loadProject(handle, projectId)
  if (!project) notFound()

  // Other approved photos from this UserProject — keyed off (userId, tutorialId)
  // since the UGCPhoto schema doesn't link directly to UserProject. Sort by
  // recency.
  const photos = await prisma.uGCPhoto.findMany({
    where: {
      userId: project.user.id,
      tutorialId: project.tutorial.id,
      status: UGCPhotoStatus.APPROVED,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      caption: true,
      media: { select: { cloudflareId: true, r2Key: true, alt: true } },
    },
  })

  const heroSource =
    (project.heroPhoto?.status === UGCPhotoStatus.APPROVED
      ? project.heroPhoto.media
      : null) ??
    photos[0]?.media ??
    project.tutorial.hero
  const heroUrl = mediaUrl(heroSource, 'hero')
  const makerName = project.user.name ?? project.user.displayHandle ?? 'A maker'

  const whatIUsed = readWhatIUsedRows(project.whatIUsed)

  return (
    <div className="maker-made-page">
      <Link href={`/m/${project.user.displayHandle}`} className="maker-made-back">
        ← {makerName}&apos;s profile
      </Link>

      {heroUrl && (
        <div className="maker-made-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroUrl} alt={heroSource?.alt ?? ''} />
        </div>
      )}

      <header className="maker-made-header">
        <span className="maker-made-eyebrow">{project.tutorial.category.name}</span>
        <h1 className="maker-made-title">{project.tutorial.title}</h1>
        <div className="maker-made-by">
          Made by{' '}
          <Link href={`/m/${project.user.displayHandle}`}>{makerName}</Link>
        </div>
        {project.publishedAt && (
          <div className="maker-made-meta">
            {formatShortDate(project.publishedAt)}
          </div>
        )}
        <Link
          href={`/${project.tutorial.category.slug}/${project.tutorial.slug}`}
          className="maker-made-tutorial-link"
        >
          Read the tutorial →
        </Link>
      </header>

      {project.publicNote && (
        <section className="maker-made-section">
          <span className="maker-made-section-label">Notes</span>
          <p className="maker-made-note">{project.publicNote}</p>
        </section>
      )}

      {whatIUsed.length > 0 && (
        <section className="maker-made-section">
          <span className="maker-made-section-label">What I used</span>
          <ul className="maker-made-used">
            {whatIUsed.map((item, idx) => (
              <li key={`${item.name}-${idx}`} className="maker-made-used-item">
                <span className="maker-made-used-name">{item.name}</span>
                {item.note && (
                  <span className="maker-made-used-note">{item.note}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {photos.length > 1 && (
        <section className="maker-made-section">
          <span className="maker-made-section-label">More photos</span>
          <div className="maker-made-photos">
            {photos
              .filter((p) => p.id !== project.heroPhoto?.id)
              .map((p) => {
                const url = mediaUrl(p.media, 'public')
                return (
                  <div key={p.id} className="maker-made-photo">
                    {url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt={p.caption ?? p.media.alt ?? ''} />
                    )}
                  </div>
                )
              })}
          </div>
        </section>
      )}
    </div>
  )
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
