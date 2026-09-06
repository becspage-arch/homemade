'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { decidePhotoAppeal } from '@/lib/maker-photo-actions'

export interface AppealRow {
  id: string
  thumbUrl: string | null
  fullUrl: string | null
  caption: string | null
  handle: string
  itemTitle: string
  itemHref: string | null
  gateReasons: string[]
  appealNote: string | null
  appealRequestedAt: string
}

/**
 * One appeal. The gate already said no and gave its reasons; this is the only
 * place a person overrides it. Rejecting needs a reason because the maker sees
 * it.
 */
export function AppealCard({ appeal }: { appeal: AppealRow }) {
  const [pending, start] = useTransition()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'APPROVE' | 'REJECT' | null>(null)

  function decide(action: 'APPROVE' | 'REJECT') {
    setError(null)
    start(async () => {
      const res = await decidePhotoAppeal({ photoId: appeal.id, action, reason })
      if (res.ok) setDone(action)
      else setError(res.error)
    })
  }

  return (
    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
      {appeal.thumbUrl ? (
        <div
          className="admin-photo-thumb"
          style={{ backgroundImage: `url(${appeal.thumbUrl})` }}
          role="img"
          aria-label={appeal.caption ?? 'Maker photo'}
        />
      ) : (
        <div className="admin-photo-thumb" aria-hidden="true" />
      )}
      <div style={{ padding: 16 }}>
        <div className="admin-card-eyebrow">
          {appeal.itemHref ? (
            <Link href={appeal.itemHref} style={{ color: 'inherit', textDecoration: 'none' }}>
              {appeal.itemTitle}
            </Link>
          ) : (
            appeal.itemTitle
          )}
        </div>
        {appeal.caption && (
          <p className="admin-card-body" style={{ fontSize: 14 }}>
            {appeal.caption}
          </p>
        )}
        <div className="admin-card-meta">
          <span>By {appeal.handle}</span>
          <span>· asked {appeal.appealRequestedAt}</span>
          {appeal.fullUrl && (
            <a href={appeal.fullUrl} target="_blank" rel="noreferrer">
              · full size
            </a>
          )}
        </div>

        {appeal.gateReasons.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-warm-taupe)', marginTop: 8 }}>
            Gate said: {appeal.gateReasons.join(' ')}
          </p>
        )}
        {appeal.appealNote && (
          <p style={{ fontSize: 13, marginTop: 6 }}>Maker says: {appeal.appealNote}</p>
        )}

        {done ? (
          <p style={{ marginTop: 10, fontSize: 13 }}>
            {done === 'APPROVE' ? 'Approved. It is on the site.' : 'Rejected.'}
          </p>
        ) : (
          <div className="admin-card-actions">
            <input
              type="text"
              placeholder="Reason (needed to reject)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={pending}
            />
            <button className="admin-btn" disabled={pending} onClick={() => decide('APPROVE')}>
              Approve
            </button>
            <button
              className="admin-btn danger"
              disabled={pending}
              onClick={() => decide('REJECT')}
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
