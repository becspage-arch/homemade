'use client'

import { useState, useTransition } from 'react'
import { resolveDmcaRequest } from '@/lib/admin-data-rights-actions'

interface DmcaRequest {
  id: string
  claimantName: string
  claimantEmail: string
  claimantAddress: string | null
  contentUrl: string
  contentDescription: string
  status: string
  actionTakenNote: string | null
  createdAt: string
  resolvedAt: string | null
  resolvedBy: string | null
}

type Action = 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'REJECTED' | 'COUNTER_NOTICED'

export function DmcaCard({ request }: { request: DmcaRequest }) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState(request.actionTakenNote ?? '')
  const [error, setError] = useState<string | null>(null)

  const run = (action: Action) => {
    setError(null)
    start(async () => {
      const res = await resolveDmcaRequest({ requestId: request.id, action, note })
      if (!res.ok) setError(res.error)
    })
  }

  const closed = request.status !== 'RECEIVED' && request.status !== 'UNDER_REVIEW'

  return (
    <div className="admin-card">
      <div className="admin-card-eyebrow">
        Notice received {new Date(request.createdAt).toLocaleDateString('en-GB')}
      </div>

      <h2 className="admin-card-title">{request.claimantName}</h2>
      <p className="admin-card-meta">
        <span>{request.claimantEmail}</span>
        {request.claimantAddress && <span>· {request.claimantAddress}</span>}
        <span>
          ·{' '}
          <span className={`admin-pill ${request.status.toLowerCase().replace(/_/g, '-')}`}>
            {request.status.toLowerCase().replaceAll('_', ' ')}
          </span>
        </span>
      </p>

      <div style={{ marginTop: 12 }}>
        <p style={{ margin: '4px 0' }}>
          <strong>Content URL:</strong>{' '}
          <a href={request.contentUrl} target="_blank" rel="noopener noreferrer">
            {request.contentUrl}
          </a>
        </p>
        <p className="admin-card-body">
          <strong>Claim:</strong> {request.contentDescription}
        </p>
      </div>

      {closed && (
        <p className="admin-card-meta">
          Resolved {request.resolvedAt && new Date(request.resolvedAt).toLocaleString('en-GB')}{' '}
          {request.resolvedBy && `by ${request.resolvedBy}`}
          {request.actionTakenNote && (
            <>
              <br />
              <strong>Note:</strong> {request.actionTakenNote}
            </>
          )}
        </p>
      )}

      {!closed && (
        <div className="admin-card-actions">
          <textarea
            placeholder="Resolution note (required for Action taken / Rejected)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={pending}
            rows={2}
          />
          <button
            type="button"
            className="admin-btn secondary"
            onClick={() => run('UNDER_REVIEW')}
            disabled={pending}
          >
            Mark under review
          </button>
          <button
            type="button"
            className="admin-btn"
            onClick={() => run('ACTION_TAKEN')}
            disabled={pending || note.trim().length === 0}
          >
            Action taken
          </button>
          <button
            type="button"
            className="admin-btn secondary"
            onClick={() => run('COUNTER_NOTICED')}
            disabled={pending}
          >
            Counter-noticed
          </button>
          <button
            type="button"
            className="admin-btn danger"
            onClick={() => run('REJECTED')}
            disabled={pending || note.trim().length === 0}
          >
            Reject
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 13 }}>{error}</p>
      )}
    </div>
  )
}
