'use client'

import { useState, useTransition } from 'react'
import { resolveReport } from '@/lib/moderation-actions'

export interface ReportWithTarget {
  id: string
  targetType: string
  targetId: string
  reason: string
  description: string | null
  status: string
  resolutionAction: string | null
  createdAt: Date
  reporter: { name: string | null; email: string; displayHandle: string | null }
  target: unknown
}

function describeTarget(report: ReportWithTarget): { title: string; snippet: string; link: string | null } {
  const t = report.target as Record<string, unknown> | undefined
  if (!t) return { title: `${report.targetType} ${report.targetId.slice(0, 8)}`, snippet: '(deleted)', link: null }
  switch (report.targetType) {
    case 'REVIEW':
      return {
        title: `Review ★${(t as { rating: number }).rating}`,
        snippet: String(t.body ?? '').slice(0, 240),
        link: `/admin/reviews?status=all`,
      }
    case 'PHOTO':
      return {
        title: 'Photo',
        snippet: (t.caption as string) ?? '(no caption)',
        link: `/admin/ugc-photos?status=all`,
      }
    case 'QUESTION':
      return {
        title: 'Question',
        snippet: String(t.body ?? '').slice(0, 240),
        link: `/admin/questions?status=all`,
      }
    case 'ANSWER':
      return {
        title: 'Answer',
        snippet: String(t.body ?? '').slice(0, 240),
        link: `/admin/questions?status=all`,
      }
    case 'USER':
      return {
        title: `User: ${(t as { displayHandle?: string; email: string }).displayHandle ?? (t as { email: string }).email}`,
        snippet: (t as { isSuspended: boolean }).isSuspended ? 'Currently suspended' : 'Active',
        link: `/admin/users/${(t as { id: string }).id}`,
      }
    default:
      return { title: report.targetType, snippet: '', link: null }
  }
}

export function ReportCard({ report }: { report: ReportWithTarget }) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const target = describeTarget(report)
  const reporter =
    report.reporter.displayHandle ?? report.reporter.name ?? report.reporter.email
  const isOpen = report.status === 'OPEN'

  const run = (action: 'RESOLVED_ACTION_TAKEN' | 'RESOLVED_NO_ACTION' | 'DISMISSED') => {
    setError(null)
    start(async () => {
      const res = await resolveReport({
        reportId: report.id,
        action,
        resolutionAction: note,
      })
      if (!res.ok) setError(res.error)
    })
  }

  return (
    <div className="admin-card">
      <div className="admin-card-eyebrow" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          {report.targetType} · {report.reason}
        </span>
        <span className={`admin-pill ${report.status === 'OPEN' ? 'pending' : 'resolved'}`}>
          {report.status.replace('_', ' ').toLowerCase()}
        </span>
      </div>

      <h2 className="admin-card-title">{target.title}</h2>
      <p className="admin-card-body">{target.snippet}</p>
      {report.description && (
        <p
          style={{
            fontSize: 13,
            background: 'var(--color-soft-parchment)',
            border: '0.5px solid var(--color-linen-grey)',
            padding: 10,
            borderRadius: 3,
          }}
        >
          “{report.description}”
        </p>
      )}

      <div className="admin-card-meta">
        <span>Reported by {reporter}</span>
        <span>· {report.createdAt.toLocaleDateString('en-GB')}</span>
        {target.link && (
          <a href={target.link} style={{ color: 'var(--color-sage)' }}>
            · open target queue
          </a>
        )}
        {report.resolutionAction && <span>· Resolution: {report.resolutionAction}</span>}
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
          <button className="admin-btn" disabled={pending} onClick={() => run('RESOLVED_ACTION_TAKEN')}>
            Action taken
          </button>
          <button
            className="admin-btn secondary"
            disabled={pending}
            onClick={() => run('RESOLVED_NO_ACTION')}
          >
            No action
          </button>
          <button
            className="admin-btn secondary"
            disabled={pending}
            onClick={() => run('DISMISSED')}
          >
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
