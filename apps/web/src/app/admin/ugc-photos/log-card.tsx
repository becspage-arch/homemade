'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { setPhotoAsHero, toggleFeaturePhoto } from './actions'

export interface LogRow {
  id: string
  thumbUrl: string | null
  fullUrl: string | null
  caption: string | null
  handle: string
  status: string
  itemTitle: string
  itemHref: string | null
  isPattern: boolean
  isFeatured: boolean
  isHero: boolean
  isTesterPhoto: boolean
  gateReasons: string[]
  gateModel: string | null
  removed: boolean
  createdAt: string
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_MODERATION: 'checking',
  APPROVED: 'live',
  REJECTED: 'not accepted',
}

/**
 * One row of the read-only log. The gate's decision stands; the only controls
 * are the curation ones (Feature, Hero), and only on a live pattern photo.
 */
export function PhotoLogCard({ row }: { row: LogRow }) {
  const [pending, start] = useTransition()
  const [featured, setFeatured] = useState(row.isFeatured)
  const [hero, setHero] = useState(row.isHero)
  const [error, setError] = useState<string | null>(null)

  const canCurate = row.isPattern && row.status === 'APPROVED' && !row.removed

  return (
    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
      {row.thumbUrl ? (
        <div
          className="admin-photo-thumb"
          style={{ backgroundImage: `url(${row.thumbUrl})` }}
          role="img"
          aria-label={row.caption ?? 'Maker photo'}
        />
      ) : (
        <div className="admin-photo-thumb" aria-hidden="true" />
      )}
      <div style={{ padding: 16 }}>
        <div
          className="admin-card-eyebrow"
          style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
        >
          {row.itemHref ? (
            <Link href={row.itemHref} style={{ color: 'inherit', textDecoration: 'none' }}>
              {row.itemTitle}
            </Link>
          ) : (
            <span>{row.itemTitle}</span>
          )}
          <span className="admin-pill">
            {row.removed ? 'removed' : (STATUS_LABEL[row.status] ?? row.status)}
          </span>
        </div>

        {row.caption && (
          <p className="admin-card-body" style={{ fontSize: 14 }}>
            {row.caption}
          </p>
        )}

        <div className="admin-card-meta">
          <span>By {row.handle}</span>
          <span>· {row.createdAt}</span>
          {row.isTesterPhoto && <span>· tester</span>}
          {hero && <span>· hero</span>}
          {featured && !hero && <span>· featured</span>}
          {row.fullUrl && (
            <a href={row.fullUrl} target="_blank" rel="noreferrer">
              · full size
            </a>
          )}
        </div>

        {row.gateReasons.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-warm-taupe)', marginTop: 8 }}>
            Gate said: {row.gateReasons.join(' ')}
            {row.gateModel ? ` (${row.gateModel})` : ''}
          </p>
        )}

        {canCurate && (
          <div className="admin-card-actions">
            <button
              className="admin-btn"
              disabled={pending}
              onClick={() => {
                setError(null)
                const next = !featured
                start(async () => {
                  const res = await toggleFeaturePhoto({ photoId: row.id, featured: next })
                  if (res.ok) setFeatured(next)
                  else setError(res.error)
                })
              }}
            >
              {featured ? 'Unfeature' : 'Feature'}
            </button>
            {!hero && (
              <button
                className="admin-btn"
                disabled={pending}
                onClick={() => {
                  setError(null)
                  start(async () => {
                    const res = await setPhotoAsHero({ photoId: row.id })
                    if (res.ok) {
                      setHero(true)
                      setFeatured(true)
                    } else setError(res.error)
                  })
                }}
              >
                Make hero
              </button>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 13 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
