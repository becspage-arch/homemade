'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { moderateUgcPhoto } from '@/lib/moderation-actions'

interface Photo {
  id: string
  caption: string | null
  status: string
  nsfwScore: number | null
  nsfwClassification: string | null
  rejectionReason: string | null
  createdAt: Date
  thumbUrl: string | null
  fullUrl: string | null
  nsfwBucket: 'auto-reject' | 'flag' | 'clear' | 'unscanned'
  user: {
    id: string
    name: string | null
    email: string
    displayHandle: string | null
  }
  tutorial: {
    title: string
    slug: string
    category: { slug: string; name: string }
  }
  media: { alt: string | null }
}

export function PhotoModerationCard({ photo }: { photo: Photo }) {
  const [pending, start] = useTransition()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handle = photo.user.displayHandle ?? photo.user.name ?? photo.user.email

  const run = (action: 'APPROVE' | 'REJECT') => {
    setError(null)
    start(async () => {
      const res = await moderateUgcPhoto({
        photoId: photo.id,
        action,
        rejectionReason: reason,
      })
      if (!res.ok) setError(res.error)
    })
  }

  return (
    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
      {photo.thumbUrl ? (
        <div
          className="admin-photo-thumb"
          style={{ backgroundImage: `url(${photo.thumbUrl})` }}
          role="img"
          aria-label={photo.media.alt ?? photo.caption ?? 'User photo'}
        />
      ) : (
        <div className="admin-photo-thumb" aria-hidden="true" />
      )}
      <div style={{ padding: 16 }}>
        <div
          className="admin-card-eyebrow"
          style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
        >
          <Link
            href={`/${photo.tutorial.category.slug}/${photo.tutorial.slug}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {photo.tutorial.title}
          </Link>
          {photo.nsfwBucket === 'flag' && <span className="admin-pill flagged">flagged</span>}
          {photo.nsfwBucket === 'unscanned' && (
            <span className="admin-pill">no scan</span>
          )}
        </div>
        {photo.caption && (
          <p className="admin-card-body" style={{ fontSize: 14 }}>
            {photo.caption}
          </p>
        )}
        <div className="admin-card-meta">
          <span>By {handle}</span>
          <span>· {photo.createdAt.toLocaleDateString('en-GB')}</span>
          {photo.nsfwScore !== null && (
            <span>
              · {Math.round(photo.nsfwScore * 100)}%
              {photo.nsfwClassification ? ` ${photo.nsfwClassification}` : ''}
            </span>
          )}
          {photo.fullUrl && (
            <a href={photo.fullUrl} target="_blank" rel="noreferrer">
              · full size
            </a>
          )}
        </div>
        {photo.rejectionReason && (
          <p style={{ fontSize: 12, color: 'var(--color-warm-taupe)', marginTop: 8 }}>
            Reject reason: {photo.rejectionReason}
          </p>
        )}
        {photo.status === 'PENDING_MODERATION' && (
          <div className="admin-card-actions">
            <input
              type="text"
              placeholder="Reject reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={pending}
            />
            <button
              className="admin-btn"
              disabled={pending}
              onClick={() => run('APPROVE')}
            >
              Approve
            </button>
            <button
              className="admin-btn danger"
              disabled={pending}
              onClick={() => run('REJECT')}
            >
              Reject
            </button>
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
