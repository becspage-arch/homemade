import Link from 'next/link'
import { prisma, UGCPhotoStatus, type PatternType } from '@homemade/db'
import { mediaUrl } from '@/lib/media'
import { resolveTarget } from '@/lib/maker-photo-target'
import type { PhotoTarget } from '@/lib/maker-photos'
import { AppealCard, type AppealRow } from './appeal-card'
import { PhotoLogCard, type LogRow } from './log-card'

export const dynamic = 'force-dynamic'

const LOG_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'approved' },
  { label: 'Not accepted', value: 'rejected' },
  { label: 'Checking', value: 'pending' },
  { label: 'Removed', value: 'removed' },
]

interface PageProps {
  searchParams: Promise<{ log?: string }>
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function targetOf(p: {
  tutorialId: string | null
  patternId: string | null
  patternType: PatternType | null
}): PhotoTarget | null {
  if (p.tutorialId) return { kind: 'tutorial', tutorialId: p.tutorialId }
  if (p.patternId && p.patternType) {
    return { kind: 'pattern', patternId: p.patternId, patternType: p.patternType }
  }
  return null
}

function gateReasonsOf(verdict: unknown): string[] {
  if (!verdict || typeof verdict !== 'object') return []
  const r = (verdict as { reasons?: unknown }).reasons
  return Array.isArray(r) ? r.filter((x): x is string => typeof x === 'string') : []
}

/**
 * The one photo surface in admin. Approval is the AI gate's job, so there is no
 * routine queue: only appeals reach a person. Below the queue is a read-only
 * log of what the gate decided, with the curation controls.
 */
export default async function AdminUgcPhotosPage({ searchParams }: PageProps) {
  const { log: logParam } = await searchParams
  const logFilter = logParam ?? 'all'

  const logWhere =
    logFilter === 'approved'
      ? { status: UGCPhotoStatus.APPROVED, removedAt: null }
      : logFilter === 'rejected'
        ? { status: UGCPhotoStatus.REJECTED, removedAt: null }
        : logFilter === 'pending'
          ? { status: UGCPhotoStatus.PENDING_MODERATION, removedAt: null }
          : logFilter === 'removed'
            ? { removedAt: { not: null } }
            : {}

  const select = {
    id: true,
    caption: true,
    status: true,
    createdAt: true,
    removedAt: true,
    isFeatured: true,
    isHero: true,
    isTesterPhoto: true,
    gateVerdict: true,
    gateModel: true,
    appealNote: true,
    appealRequestedAt: true,
    tutorialId: true,
    patternId: true,
    patternType: true,
    user: { select: { name: true, email: true, displayHandle: true } },
    media: { select: { cloudflareId: true, r2Key: true, alt: true } },
  } as const

  const [appealRows, logRows] = await Promise.all([
    prisma.uGCPhoto.findMany({
      where: { appealRequestedAt: { not: null }, removedAt: null },
      orderBy: { appealRequestedAt: 'asc' },
      take: 100,
      select,
    }),
    prisma.uGCPhoto.findMany({
      where: logWhere,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select,
    }),
  ])

  // One resolve pass over every distinct target on the page.
  const all = [...appealRows, ...logRows]
  const titles = new Map<string, { title: string; path: string | null }>()
  await Promise.all(
    all.map(async (p) => {
      const key = p.tutorialId ?? `${p.patternId}:${String(p.patternType)}`
      if (titles.has(key)) return
      const target = targetOf(p)
      const resolved = target ? await resolveTarget(target) : null
      titles.set(key, {
        title: resolved?.title ?? 'Unknown',
        path: resolved?.path ?? null,
      })
    }),
  )

  function view(p: (typeof all)[number]) {
    const key = p.tutorialId ?? `${p.patternId}:${String(p.patternType)}`
    const t = titles.get(key)
    return {
      handle: p.user.displayHandle ?? p.user.name ?? p.user.email,
      itemTitle: t?.title ?? 'Unknown',
      itemHref: t?.path ?? null,
      thumbUrl: mediaUrl(p.media, 'card'),
      fullUrl: mediaUrl(p.media, 'public'),
      gateReasons: gateReasonsOf(p.gateVerdict),
    }
  }

  const appeals: AppealRow[] = appealRows.map((p) => {
    const v = view(p)
    return {
      id: p.id,
      thumbUrl: v.thumbUrl,
      fullUrl: v.fullUrl,
      caption: p.caption,
      handle: v.handle,
      itemTitle: v.itemTitle,
      itemHref: v.itemHref,
      gateReasons: v.gateReasons,
      appealNote: p.appealNote,
      appealRequestedAt: p.appealRequestedAt ? fmt(p.appealRequestedAt) : '',
    }
  })

  const logs: LogRow[] = logRows.map((p) => {
    const v = view(p)
    return {
      id: p.id,
      thumbUrl: v.thumbUrl,
      fullUrl: v.fullUrl,
      caption: p.caption,
      handle: v.handle,
      status: p.status,
      itemTitle: v.itemTitle,
      itemHref: v.itemHref,
      isPattern: Boolean(p.patternId),
      isFeatured: p.isFeatured,
      isHero: p.isHero,
      isTesterPhoto: p.isTesterPhoto,
      gateReasons: v.gateReasons,
      gateModel: p.gateModel,
      removed: p.removedAt !== null,
      createdAt: fmt(p.createdAt),
    }
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Maker photos</h1>
          <p>
            Photos of finished pieces and dishes. Every one is judged
            automatically on upload. The only queue here is the appeals: photos
            the gate turned down whose maker asked us to look again.
          </p>
        </div>
      </div>

      <h2 className="admin-section-heading">Appeals ({appeals.length})</h2>
      {appeals.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          Nothing waiting.
        </p>
      ) : (
        <div className="admin-card-grid">
          {appeals.map((a) => (
            <AppealCard key={a.id} appeal={a} />
          ))}
        </div>
      )}

      <h2 className="admin-section-heading" style={{ marginTop: 40 }}>
        Log
      </h2>
      <div className="admin-filter-row">
        {LOG_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/ugc-photos?log=${f.value}`}
            className={`admin-filter-chip ${logFilter === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {logs.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          Nothing here.
        </p>
      ) : (
        <div className="admin-card-grid">
          {logs.map((r) => (
            <PhotoLogCard key={r.id} row={r} />
          ))}
        </div>
      )}
    </div>
  )
}
