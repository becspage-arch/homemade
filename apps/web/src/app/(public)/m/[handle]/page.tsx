import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  prisma,
  CreatorApplicationStatus,
  TutorialStatus,
} from '@homemade/db'
import { mediaSrcSet, mediaUrl } from '@/lib/media'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { captureServerEvent } from '@/lib/posthog'
import { MakerReportLink } from '@/components/public/maker-report-link'
import { MakerOfTheMonthBadge } from '@/components/public/maker-of-the-month-badge'
import { currentMonthBadgeFor } from '@/lib/maker-of-the-month'
import { Breadcrumbs } from '@/components/public/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import {
  buildBreadcrumbSchema,
  buildPersonSchema,
} from '@/lib/seo/schema-builders'
import {
  buildPublicMetadata,
  notFoundMetadata,
} from '@/lib/seo/metadata-helpers'

import './maker-profile.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ handle: string }>
}

async function loadMaker(handle: string) {
  return prisma.user.findFirst({
    where: {
      displayHandle: handle.toLowerCase(),
      isPublicMakerProfile: true,
    },
    include: {
      makerHeaderImage: { select: { cloudflareId: true, r2Key: true, alt: true } },
      creatorProfile: {
        select: {
          specialty: true,
          bio: true,
          websiteUrl: true,
          instagramHandle: true,
          youtubeHandle: true,
          tiktokHandle: true,
          substackUrl: true,
          pinterestHandle: true,
          applicationStatus: true,
        },
      },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const maker = await loadMaker(handle)
  if (!maker) return notFoundMetadata()
  const name = maker.name ?? maker.displayHandle ?? 'A Maker'
  const description =
    maker.bio
      ?? `${name} on Homemade — a Maker sharing what they've made and what they're working on.`
  const avatar = mediaUrl(maker.makerHeaderImage, 'hero')
  return buildPublicMetadata({
    title: `${name} on Homemade`,
    description,
    path: `/m/${maker.displayHandle}`,
    ogType: 'profile',
    imageUrl: avatar,
    imageAlt: maker.makerHeaderImage?.alt ?? name,
  })
}

interface WhatIUsedRow {
  name: string
  note?: string | null
}

function isWhatIUsedRow(v: unknown): v is WhatIUsedRow {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return typeof r.name === 'string'
}

function readWhatIUsedRows(raw: unknown): WhatIUsedRow[] {
  if (!Array.isArray(raw)) return []
  const out: WhatIUsedRow[] = []
  for (const item of raw) {
    if (!isWhatIUsedRow(item)) continue
    out.push({ name: item.name, note: item.note ?? null })
  }
  return out
}

export default async function MakerProfilePage({ params }: PageProps) {
  const { handle } = await params
  const [maker, viewer] = await Promise.all([
    loadMaker(handle),
    getCurrentDbUser(),
  ])

  if (!maker) notFound()

  void captureServerEvent({
    event: 'maker_profile_viewed',
    distinctId: viewer?.clerkId ?? `anon:m:${handle}`,
    properties: {
      makerUserId: maker.id,
      handle: maker.displayHandle,
      viewerIsOwner: viewer?.id === maker.id,
    },
  })

  const isApprovedCreator =
    maker.isCreator &&
    maker.creatorProfile?.applicationStatus === CreatorApplicationStatus.APPROVED

  const motmBadge = await currentMonthBadgeFor(maker.id)

  const [madeItProjects, publicBookmarks, creatorTutorials] = await Promise.all([
    prisma.userProject.findMany({
      where: { userId: maker.id, isPublic: true },
      orderBy: { publishedAt: 'desc' },
      include: {
        tutorial: {
          select: {
            id: true,
            slug: true,
            title: true,
            category: { select: { slug: true, name: true } },
            hero: { select: { cloudflareId: true, r2Key: true } },
          },
        },
        heroPhoto: {
          select: { media: { select: { cloudflareId: true, r2Key: true } } },
        },
      },
      take: 60,
    }),
    prisma.bookmark.findMany({
      where: { userId: maker.id, isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        tutorial: {
          select: {
            id: true,
            slug: true,
            title: true,
            category: { select: { slug: true, name: true } },
          },
        },
      },
      take: 24,
    }),
    isApprovedCreator
      ? prisma.tutorial.findMany({
          where: {
            creatorId: maker.id,
            status: TutorialStatus.PUBLISHED,
          },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            category: { select: { slug: true, name: true } },
            hero: { select: { cloudflareId: true, r2Key: true } },
          },
        })
      : Promise.resolve([]),
  ])

  // What I used aggregate — collapse the JSON arrays across every public make.
  const usedCounts = new Map<string, number>()
  for (const p of madeItProjects) {
    const rows = readWhatIUsedRows(p.whatIUsed)
    for (const item of rows) {
      const name = item.name.trim()
      if (!name) continue
      usedCounts.set(name, (usedCounts.get(name) ?? 0) + 1)
    }
  }
  const topUsed = [...usedCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const headerCover = mediaUrl(maker.makerHeaderImage, 'hero')
  const makerName = maker.name ?? maker.displayHandle ?? 'A maker'
  const joinedMonth = maker.makerJoinedAt
    ? formatJoinedMonth(maker.makerJoinedAt)
    : null
  const isOwner = viewer?.id === maker.id

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Makers', href: '/makers' },
    { name: makerName, href: `/m/${maker.displayHandle}` },
  ]
  const personSchema = buildPersonSchema({
    handle: maker.displayHandle ?? '',
    name: makerName,
    bio: maker.bio,
    imageUrl: headerCover,
    sameAs: buildSameAsForMaker(maker),
  })

  return (
    <div className="maker-public-profile">
      <JsonLd
        data={[personSchema, buildBreadcrumbSchema(breadcrumbs)]}
      />
      <Breadcrumbs items={breadcrumbs} />
      {headerCover && (
        <>
          <div className="maker-public-cover" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={headerCover} alt="" />
          </div>
          {viewer && !isOwner && (
            <div
              style={{
                marginTop: -16,
                marginBottom: 16,
                textAlign: 'right',
              }}
            >
              <MakerReportLink
                targetType="MAKER_HEADER_IMAGE"
                targetId={maker.id}
                label="Report image"
              />
            </div>
          )}
        </>
      )}

      <header className="maker-public-header">
        <div className="maker-public-avatar" aria-hidden="true">
          {(maker.name ?? maker.displayHandle ?? 'h').slice(0, 1).toUpperCase()}
        </div>
        <div className="maker-public-meta">
          <h1 className="maker-public-name">{makerName}</h1>
          <div className="maker-public-handle">@{maker.displayHandle}</div>
          {joinedMonth && (
            <div className="maker-public-since">Maker since {joinedMonth}</div>
          )}
          {motmBadge && (
            <div>
              <MakerOfTheMonthBadge monthStart={motmBadge.monthStart} />
            </div>
          )}
          {maker.bio && (
            <div>
              <p className="maker-public-bio">{maker.bio}</p>
              {viewer && !isOwner && (
                <MakerReportLink
                  targetType="MAKER_BIO"
                  targetId={maker.id}
                  label="Report bio"
                />
              )}
            </div>
          )}
          {isApprovedCreator && maker.creatorProfile && (
            <CreatorSocials profile={maker.creatorProfile} />
          )}
          {isOwner && (
            <p className="maker-public-owner-note">
              You&apos;re viewing your own public Maker profile.{' '}
              <Link href="/me/settings" className="maker-public-owner-link">
                Edit in settings →
              </Link>
            </p>
          )}
        </div>
      </header>

      <section className="maker-public-section">
        <header className="maker-public-section-header">
          <h2 className="maker-public-section-title">Made it</h2>
          <span className="maker-public-section-count">
            {madeItProjects.length === 0
              ? 'Nothing logged yet'
              : madeItProjects.length === 1
                ? '1 make'
                : `${madeItProjects.length} makes`}
          </span>
        </header>
        {madeItProjects.length === 0 ? (
          <p className="maker-public-empty">
            No public Made it entries yet.
          </p>
        ) : (
          <div className="maker-public-grid">
            {madeItProjects.map((p) => {
              const heroSource = p.heroPhoto?.media ?? p.tutorial.hero
              const card = mediaSrcSet(heroSource, 'card', ['public'])
              return (
                <Link
                  key={p.id}
                  href={`/m/${maker.displayHandle}/made/${p.id}`}
                  className="maker-public-card"
                >
                  <span className="maker-public-card-image">
                    {card ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.src} srcSet={card.srcSet} alt="" />
                    ) : (
                      <span className="maker-public-card-image-placeholder" />
                    )}
                  </span>
                  <span className="maker-public-card-body">
                    <span className="maker-public-card-eyebrow">
                      {p.tutorial.category.name}
                    </span>
                    <span className="maker-public-card-title">
                      {p.tutorial.title}
                    </span>
                    <span className="maker-public-card-by">
                      Made by {makerName}
                    </span>
                    {p.publishedAt && (
                      <span className="maker-public-card-date">
                        {formatShortDate(p.publishedAt)}
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="maker-public-section">
        <header className="maker-public-section-header">
          <h2 className="maker-public-section-title">Make it list</h2>
          <span className="maker-public-section-count">
            {publicBookmarks.length === 0
              ? 'No public picks'
              : publicBookmarks.length === 1
                ? '1 tutorial'
                : `${publicBookmarks.length} tutorials`}
          </span>
        </header>
        {publicBookmarks.length === 0 ? (
          <p className="maker-public-empty">
            No public Make it list yet.
          </p>
        ) : (
          <ul className="maker-public-list">
            {publicBookmarks.map((b) => (
              <li key={b.id} className="maker-public-list-item">
                <Link
                  href={`/${b.tutorial.category.slug}/${b.tutorial.slug}`}
                  className="maker-public-list-link"
                >
                  <span className="maker-public-list-eyebrow">
                    {b.tutorial.category.name}
                  </span>
                  <span className="maker-public-list-title">
                    {b.tutorial.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {topUsed.length > 0 && (
        <section className="maker-public-section">
          <header className="maker-public-section-header">
            <h2 className="maker-public-section-title">What I&apos;ve used</h2>
            <span className="maker-public-section-count">
              Across {madeItProjects.length}{' '}
              {madeItProjects.length === 1 ? 'make' : 'makes'}
            </span>
          </header>
          <ul className="maker-public-used">
            {topUsed.map(([name, count]) => (
              <li key={name} className="maker-public-used-item">
                <span className="maker-public-used-name">{name}</span>
                <span className="maker-public-used-count">
                  × {count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="maker-public-section">
        <header className="maker-public-section-header">
          <h2 className="maker-public-section-title">Make-a-thons</h2>
        </header>
        <p className="maker-public-empty">
          Make-a-thon history coming soon.
        </p>
      </section>

      {viewer && !isOwner && (
        <p
          style={{
            marginTop: 32,
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--color-warm-taupe, #b3a48d)',
          }}
        >
          Concerned about this Maker (handle, impersonation, abuse)?{' '}
          <MakerReportLink
            targetType="MAKER_HANDLE"
            targetId={maker.id}
            label="Report this Maker"
          />
        </p>
      )}

      {isApprovedCreator && (
        <section className="maker-public-section">
          <header className="maker-public-section-header">
            <h2 className="maker-public-section-title">
              Published by this Maker
            </h2>
            <span className="maker-public-section-count">
              {creatorTutorials.length === 0
                ? 'Nothing published'
                : creatorTutorials.length === 1
                  ? '1 tutorial'
                  : `${creatorTutorials.length} tutorials`}
            </span>
          </header>
          {creatorTutorials.length === 0 ? (
            <p className="maker-public-empty">
              No published tutorials yet.
            </p>
          ) : (
            <div className="maker-public-grid">
              {creatorTutorials.map((t) => {
                const card = mediaSrcSet(t.hero, 'card', ['public'])
                return (
                  <Link
                    key={t.id}
                    href={`/${t.category.slug}/${t.slug}`}
                    className="maker-public-card"
                  >
                    <span className="maker-public-card-image">
                      {card ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.src} srcSet={card.srcSet} alt="" />
                      ) : (
                        <span className="maker-public-card-image-placeholder" />
                      )}
                    </span>
                    <span className="maker-public-card-body">
                      <span className="maker-public-card-eyebrow">
                        {t.category.name}
                      </span>
                      <span className="maker-public-card-title">{t.title}</span>
                      {t.excerpt && (
                        <span className="maker-public-card-excerpt">
                          {t.excerpt}
                        </span>
                      )}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

interface CreatorProfileSocials {
  websiteUrl: string | null
  instagramHandle: string | null
  youtubeHandle: string | null
  tiktokHandle: string | null
  substackUrl: string | null
  pinterestHandle: string | null
}

function CreatorSocials({ profile }: { profile: CreatorProfileSocials }) {
  const links: { label: string; href: string }[] = []
  if (profile.websiteUrl) links.push({ label: 'Website', href: normaliseUrl(profile.websiteUrl) })
  if (profile.instagramHandle)
    links.push({
      label: 'Instagram',
      href: `https://instagram.com/${stripAt(profile.instagramHandle)}`,
    })
  if (profile.youtubeHandle)
    links.push({
      label: 'YouTube',
      href: `https://youtube.com/${ensureYouTubeHandle(profile.youtubeHandle)}`,
    })
  if (profile.tiktokHandle)
    links.push({
      label: 'TikTok',
      href: `https://tiktok.com/@${stripAt(profile.tiktokHandle)}`,
    })
  if (profile.pinterestHandle)
    links.push({
      label: 'Pinterest',
      href: `https://pinterest.com/${stripAt(profile.pinterestHandle)}`,
    })
  if (profile.substackUrl)
    links.push({ label: 'Substack', href: normaliseUrl(profile.substackUrl) })
  if (links.length === 0) return null
  return (
    <div className="maker-public-socials">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          className="maker-public-social"
          target="_blank"
          rel="noopener noreferrer"
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}

function stripAt(raw: string): string {
  return raw.replace(/^@/, '').trim()
}

function ensureYouTubeHandle(raw: string): string {
  const t = raw.trim()
  if (t.startsWith('@')) return t
  if (t.startsWith('http')) return t.replace(/^https?:\/\/(www\.)?youtube\.com\//, '')
  return `@${t}`
}

function normaliseUrl(raw: string): string {
  const t = raw.trim()
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatJoinedMonth(d: Date): string {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/**
 * Builds the Person.sameAs array for schema. Pulls verified external social
 * URLs from the CreatorProfile if present — gives Google a trail of
 * external presence for entity disambiguation.
 */
function buildSameAsForMaker(maker: {
  creatorProfile?: {
    websiteUrl: string | null
    instagramHandle: string | null
    youtubeHandle: string | null
    tiktokHandle: string | null
    substackUrl: string | null
    pinterestHandle: string | null
  } | null
}): string[] {
  const p = maker.creatorProfile
  if (!p) return []
  const out: string[] = []
  if (p.websiteUrl) out.push(normaliseUrl(p.websiteUrl))
  if (p.instagramHandle) out.push(`https://instagram.com/${stripAt(p.instagramHandle)}`)
  if (p.youtubeHandle) out.push(`https://youtube.com/${ensureYouTubeHandle(p.youtubeHandle)}`)
  if (p.tiktokHandle) out.push(`https://tiktok.com/@${stripAt(p.tiktokHandle)}`)
  if (p.pinterestHandle) out.push(`https://pinterest.com/${stripAt(p.pinterestHandle)}`)
  if (p.substackUrl) out.push(normaliseUrl(p.substackUrl))
  return out
}
