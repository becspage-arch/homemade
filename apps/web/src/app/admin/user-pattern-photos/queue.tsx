'use client'

import { useState, useTransition } from 'react'
import { reviewUserPatternPhoto } from './actions'

interface PhotoItem {
  id: string
  patternId: string
  patternType: string
  caption: string | null
  status: string
  isFeatured: boolean
  isHero: boolean
  createdAt: Date
  thumbUrl: string | null
  fullUrl: string | null
  user: {
    id: string
    name: string | null
    email: string
    displayHandle: string | null
  }
  media: { alt: string | null }
}

function PatternPhotoCard({ photo }: { photo: PhotoItem }) {
  const [pending, start] = useTransition()
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handle = photo.user.displayHandle ?? photo.user.name ?? photo.user.email

  const patternLabel =
    photo.patternType === 'CROSS_STITCH'
      ? 'Cross stitch'
      : photo.patternType === 'CROCHET_CHART'
        ? 'Crochet'
        : photo.patternType

  const run = (action: 'APPROVE' | 'REJECT' | 'FEATURE' | 'HERO') => {
    setError(null)
    start(async () => {
      const res = await reviewUserPatternPhoto({ photoId: photo.id, action, reviewNotes: notes })
      if (res.ok) {
        setDone(true)
      } else {
        setError(res.error)
      }
    })
  }

  if (done) {
    return (
      <div className="admin-card" style={{ padding: 16, opacity: 0.5 }}>
        <p style={{ fontSize: 13 }}>Done</p>
      </div>
    )
  }

  return (
    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
      {photo.thumbUrl ? (
        <div
          className="admin-photo-thumb"
          style={{ backgroundImage: `url(${photo.thumbUrl})` }}
          role="img"
          aria-label={photo.media.alt ?? photo.caption ?? 'User submitted pattern photo'}
        />
      ) : (
        <div className="admin-photo-thumb" aria-hidden="true" />
      )}
      <div style={{ padding: 16 }}>
        <div className="admin-card-eyebrow">
          <span>{patternLabel}</span>
          <span style={{ marginLeft: 8, color: 'var(--color-warm-taupe)', fontSize: 11 }}>
            id: {photo.patternId.slice(0, 8)}
          </span>
        </div>
        {photo.caption && (
          <p className="admin-card-body" style={{ fontSize: 14 }}>
            {photo.caption}
          </p>
        )}
        <div className="admin-card-meta">
          <span>By {handle}</span>
          <span>
            &middot;{' '}
            {photo.createdAt instanceof Date
              ? photo.createdAt.toLocaleDateString('en-GB')
              : new Date(photo.createdAt).toLocaleDateString('en-GB')}
          </span>
          {photo.fullUrl && (
            <a href={photo.fullUrl} target="_blank" rel="noreferrer">
              &middot; full size
            </a>
          )}
        </div>
        {photo.status === 'PENDING' && (
          <div className="admin-card-actions" style={{ flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Review notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={pending}
              style={{ flexBasis: '100%' }}
            />
            <button className="admin-btn" disabled={pending} onClick={() => run('APPROVE')}>
              Approve
            </button>
            <button className="admin-btn" disabled={pending} onClick={() => run('FEATURE')}>
              Approve + Feature
            </button>
            <button className="admin-btn" disabled={pending} onClick={() => run('HERO')}>
              Approve + Hero
            </button>
            <button className="admin-btn danger" disabled={pending} onClick={() => run('REJECT')}>
              Reject
            </button>
          </div>
        )}
        {error && (
          <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 13 }}>{error}</p>
        )}
      </div>
    </div>
  )
}

interface Props {
  photos: PhotoItem[]
}

export function UserPatternPhotoQueue({ photos }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkPending, startBulk] = useTransition()
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [processed, setProcessed] = useState<Set<string>>(new Set())

  const visible = photos.filter((p) => !processed.has(p.id))

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkAction = (action: 'APPROVE' | 'REJECT') => {
    setBulkError(null)
    startBulk(async () => {
      const ids = Array.from(selected)
      for (const id of ids) {
        const res = await reviewUserPatternPhoto({ photoId: id, action })
        if (!res.ok) {
          setBulkError(res.error)
          return
        }
      }
      setProcessed((prev) => new Set([...prev, ...ids]))
      setSelected(new Set())
    })
  }

  return (
    <div>
      {selected.size > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>{selected.size} selected</span>
          <button
            className="admin-btn"
            disabled={bulkPending}
            onClick={() => bulkAction('APPROVE')}
          >
            Approve all selected
          </button>
          <button
            className="admin-btn danger"
            disabled={bulkPending}
            onClick={() => bulkAction('REJECT')}
          >
            Reject all selected
          </button>
          <button
            className="admin-btn"
            disabled={bulkPending}
            onClick={() => setSelected(new Set())}
            style={{ background: 'transparent' }}
          >
            Clear
          </button>
          {bulkError && (
            <span style={{ fontSize: 12, color: 'var(--color-burnt-sienna)' }}>{bulkError}</span>
          )}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {visible.map((photo) => (
          <div key={photo.id} style={{ position: 'relative' }}>
            <input
              type="checkbox"
              checked={selected.has(photo.id)}
              onChange={() => toggle(photo.id)}
              style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
              aria-label="Select photo"
            />
            <PatternPhotoCard photo={photo} />
          </div>
        ))}
      </div>
    </div>
  )
}
