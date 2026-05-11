'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { moderateReview } from '@/lib/moderation-actions'

interface Review {
  id: string
  rating: number
  title: string | null
  body: string
  helpfulCount: number
  status: string
  moderationNote: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    displayHandle: string | null
  }
  tutorial: {
    id: string
    title: string
    slug: string
    category: { slug: string; name: string }
  }
}

export function ReviewModerationCard({ review }: { review: Review }) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const run = (action: 'APPROVE' | 'HIDE' | 'REMOVE') => {
    setError(null)
    start(async () => {
      const res = await moderateReview({
        reviewId: review.id,
        action,
        note,
      })
      if (!res.ok) setError(res.error)
    })
  }

  const isPending = review.status === 'PENDING_MODERATION'
  const isPublished = review.status === 'PUBLISHED'
  const handle = review.user.displayHandle ?? review.user.name ?? review.user.email

  return (
    <div className="admin-card">
      <div className="admin-card-eyebrow">
        <Link
          href={`/${review.tutorial.category.slug}/${review.tutorial.slug}`}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {review.tutorial.category.name} / {review.tutorial.title}
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span className="admin-rating-stars" aria-label={`${review.rating} stars`}>
          {'★'.repeat(review.rating)}
          <span style={{ color: 'var(--color-linen-grey)' }}>{'★'.repeat(5 - review.rating)}</span>
        </span>
        {review.title && <h2 className="admin-card-title" style={{ margin: 0 }}>{review.title}</h2>}
        <span className={`admin-pill ${review.status.toLowerCase().replace('_moderation', '')}`}>
          {review.status.replace('_', ' ').toLowerCase()}
        </span>
      </div>

      <p className="admin-card-body">{review.body}</p>

      <div className="admin-card-meta">
        <span>By {handle}</span>
        <span>· {review.createdAt.toLocaleDateString('en-GB')}</span>
        <span>· {review.helpfulCount} helpful</span>
        {review.moderationNote && <span>· Mod note: {review.moderationNote}</span>}
      </div>

      <div className="admin-card-actions">
        <input
          type="text"
          placeholder="Moderation note (required to hide / remove)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={pending}
        />
        {!isPublished && (
          <button className="admin-btn" disabled={pending} onClick={() => run('APPROVE')}>
            {pending ? '...' : 'Publish'}
          </button>
        )}
        {!isPending && isPublished && (
          <button className="admin-btn secondary" disabled={pending} onClick={() => run('HIDE')}>
            Hide
          </button>
        )}
        {isPending && (
          <button className="admin-btn secondary" disabled={pending} onClick={() => run('HIDE')}>
            Hide
          </button>
        )}
        <button className="admin-btn danger" disabled={pending} onClick={() => run('REMOVE')}>
          Remove
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 13 }}>{error}</p>
      )}
    </div>
  )
}
