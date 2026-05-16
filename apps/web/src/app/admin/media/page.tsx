import Link from 'next/link'
import { prisma, MediaStatus, MediaType, type Prisma } from '@homemade/db'
import { mediaUrl } from '@/lib/media'

import './media.css'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 60

interface PageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    status?: string
    page?: string
  }>
}

export default async function MediaIndexPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = (params.q ?? '').trim()
  const typeFilter = (params.type ?? '').trim()
  const statusFilter = (params.status ?? '').trim()
  const pageNum = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const skip = (pageNum - 1) * PAGE_SIZE

  const where: Prisma.MediaWhereInput = {}
  if (q) {
    where.OR = [
      { filename: { contains: q, mode: 'insensitive' } },
      { alt: { contains: q, mode: 'insensitive' } },
      { caption: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (typeFilter && Object.values(MediaType).includes(typeFilter as MediaType)) {
    where.type = typeFilter as MediaType
  }
  if (statusFilter && Object.values(MediaStatus).includes(statusFilter as MediaStatus)) {
    where.status = statusFilter as MediaStatus
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: { _count: { select: { tutorialsHero: true, ugcPhotos: true } } },
    }),
    prisma.media.count({ where }),
  ])
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="media-page">
      <header className="media-header">
        <div>
          <h1>Media</h1>
          <p className="media-subtitle">
            Uploaded heroes, illustrations, and inline images. Each row shows
            how many tutorials use it.
          </p>
        </div>
        <Link href="/admin/media/new" className="media-new">
          + upload
        </Link>
      </header>

      <form className="media-filters" method="GET" action="/admin/media">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by filename, alt, or caption"
          className="media-search"
        />
        <select name="type" defaultValue={typeFilter} className="media-select">
          <option value="">All types</option>
          {Object.values(MediaType).map((t) => (
            <option key={t} value={t}>
              {t.toLowerCase()}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={statusFilter} className="media-select">
          <option value="">All statuses</option>
          {Object.values(MediaStatus).map((s) => (
            <option key={s} value={s}>
              {s.toLowerCase()}
            </option>
          ))}
        </select>
        <button type="submit" className="media-apply">
          Apply
        </button>
        {(q || typeFilter || statusFilter) && (
          <Link href="/admin/media" className="media-clear">
            clear
          </Link>
        )}
      </form>

      <p className="media-summary">
        {total === 0
          ? 'No media match the current filter.'
          : `Showing ${skip + 1}–${Math.min(skip + media.length, total)} of ${total.toLocaleString('en-GB')}`}
      </p>

      <ul className="media-grid" role="list">
        {media.map((m) => {
          const thumb = mediaUrl(m, 'thumbnail')
          const heroCount = m._count.tutorialsHero
          const ugcCount = m._count.ugcPhotos
          return (
            <li key={m.id} className="media-tile">
              <Link href={`/admin/media/${m.id}`} className="media-tile-link">
                <div
                  className="media-thumb"
                  style={
                    thumb && m.status === MediaStatus.READY
                      ? { backgroundImage: `url(${thumb})` }
                      : undefined
                  }
                >
                  {!(thumb && m.status === MediaStatus.READY) && (
                    <span className="media-thumb-placeholder">
                      {m.status === MediaStatus.FAILED ? 'failed' : '…'}
                    </span>
                  )}
                </div>
                <div className="media-meta">
                  <span className="media-name">
                    {m.filename || m.alt || '(untitled)'}
                  </span>
                  <span className="media-row-meta">
                    {m.type.toLowerCase()}
                    {m.width && m.height ? ` · ${m.width}×${m.height}` : ''}
                  </span>
                  <span className="media-row-meta">
                    Hero on {heroCount} tutorial{heroCount === 1 ? '' : 's'}
                    {ugcCount > 0 ? ` · ${ugcCount} UGC` : ''}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      {pageCount > 1 && (
        <nav className="media-pagination" aria-label="Media pages">
          {Array.from({ length: Math.min(pageCount, 30) }).map((_, i) => {
            const p = i + 1
            const sp = new URLSearchParams()
            if (q) sp.set('q', q)
            if (typeFilter) sp.set('type', typeFilter)
            if (statusFilter) sp.set('status', statusFilter)
            if (p > 1) sp.set('page', String(p))
            const search = sp.toString()
            const href = search ? `/admin/media?${search}` : '/admin/media'
            return (
              <Link
                key={p}
                href={href}
                className={`media-page-link${p === pageNum ? ' active' : ''}`}
              >
                {p}
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
