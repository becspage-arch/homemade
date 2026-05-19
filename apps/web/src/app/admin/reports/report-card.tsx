'use client'

import { useState, useTransition } from 'react'
import {
  removeMakerProfileField,
  resolveReport,
} from '@/lib/moderation-actions'

const MAKER_TARGETS = new Set([
  'MAKER_BIO',
  'MAKER_HANDLE',
  'MAKER_HEADER_IMAGE',
  'MAKER_PROJECT_PUBLIC_NOTE',
  'MAKER_PROJECT_WHAT_I_USED',
])

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
    case 'MAKER_BIO': {
      const u = t as { id: string; displayHandle?: string; bio?: string }
      return {
        title: `Maker bio: @${u.displayHandle ?? '?'}`,
        snippet: u.bio ?? '(empty)',
        link: u.displayHandle ? `/m/${u.displayHandle}` : null,
      }
    }
    case 'MAKER_HANDLE': {
      const u = t as { id: string; displayHandle?: string; name?: string }
      return {
        title: `Maker handle: @${u.displayHandle ?? '?'}`,
        snippet: u.name ? `Name on file: ${u.name}` : '(no display name)',
        link: u.displayHandle ? `/m/${u.displayHandle}` : null,
      }
    }
    case 'MAKER_HEADER_IMAGE': {
      const u = t as { id: string; displayHandle?: string }
      return {
        title: `Maker header: @${u.displayHandle ?? '?'}`,
        snippet: '(image — open profile to view)',
        link: u.displayHandle ? `/m/${u.displayHandle}` : null,
      }
    }
    case 'MAKER_PROJECT_PUBLIC_NOTE': {
      const p = t as {
        id: string
        publicNote?: string
        user: { displayHandle?: string }
      }
      return {
        title: `Made it note: @${p.user.displayHandle ?? '?'}`,
        snippet: p.publicNote ?? '(cleared)',
        link: p.user.displayHandle
          ? `/m/${p.user.displayHandle}/made/${p.id}`
          : null,
      }
    }
    case 'MAKER_PROJECT_WHAT_I_USED': {
      const p = t as {
        id: string
        whatIUsed?: Array<{ name: string }> | null
        user: { displayHandle?: string }
      }
      const items = Array.isArray(p.whatIUsed)
        ? p.whatIUsed.map((i) => i.name).slice(0, 3).join(', ')
        : ''
      return {
        title: `Made it What I used: @${p.user.displayHandle ?? '?'}`,
        snippet: items || '(empty)',
        link: p.user.displayHandle
          ? `/m/${p.user.displayHandle}/made/${p.id}`
          : null,
      }
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
  const isMakerTarget = MAKER_TARGETS.has(report.targetType)

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

  const clearField = () => {
    setError(null)
    start(async () => {
      const res = await removeMakerProfileField({
        reportId: report.id,
        resolutionNote: note,
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
          {isMakerTarget && (
            <button
              className="admin-btn"
              disabled={pending}
              onClick={clearField}
              title="Clear the offending field + notify the Maker"
            >
              Clear field
            </button>
          )}
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
