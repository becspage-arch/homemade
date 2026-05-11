'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { resolveErrata } from '@/lib/moderation-actions'

interface ErrataRow {
  id: string
  body: string
  status: string
  resolutionNote: string | null
  createdAt: Date
  user: { name: string | null; email: string; displayHandle: string | null } | null
  tutorial: {
    id: string
    title: string
    slug: string
    category: { slug: string; name: string }
  }
}

export function ErrataCard({ item }: { item: ErrataRow }) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const run = (action: 'ADDRESS' | 'DISMISS') => {
    setError(null)
    start(async () => {
      const res = await resolveErrata({ errataId: item.id, action, note })
      if (!res.ok) setError(res.error)
    })
  }

  const handle = item.user
    ? (item.user.displayHandle ?? item.user.name ?? item.user.email)
    : 'anonymous'

  const isOpen = item.status === 'OPEN'

  return (
    <div className="admin-card">
      <div className="admin-card-eyebrow" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link
          href={`/${item.tutorial.category.slug}/${item.tutorial.slug}`}
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {item.tutorial.category.name} / {item.tutorial.title}
        </Link>
        <span className={`admin-pill ${item.status.toLowerCase()}`}>
          {item.status.toLowerCase()}
        </span>
      </div>

      <p className="admin-card-body">{item.body}</p>

      <div className="admin-card-meta">
        <span>By {handle}</span>
        <span>· {item.createdAt.toLocaleDateString('en-GB')}</span>
        {item.resolutionNote && <span>· Resolution: {item.resolutionNote}</span>}
      </div>

      {isOpen && (
        <div className="admin-card-actions">
          <input
            type="text"
            placeholder="Resolution note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={pending}
          />
          <Link
            href={`/admin/tutorials/${item.tutorial.id}`}
            className="admin-btn secondary"
          >
            Edit tutorial
          </Link>
          <button className="admin-btn" disabled={pending} onClick={() => run('ADDRESS')}>
            Mark addressed
          </button>
          <button className="admin-btn secondary" disabled={pending} onClick={() => run('DISMISS')}>
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 13 }}>{error}</p>
      )}
    </div>
  )
}
