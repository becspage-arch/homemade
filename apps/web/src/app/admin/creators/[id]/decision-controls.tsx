'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { decideCreatorApplication } from '@/lib/creator-actions'

interface Props {
  profileId: string
}

export function CreatorApplicationDecisionControls({ profileId }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [asking, setAsking] = useState<false | 'REJECT'>(false)
  const [reason, setReason] = useState('')

  function approve() {
    setError(null)
    start(async () => {
      const res = await decideCreatorApplication({ profileId, decision: 'APPROVE' })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function reject() {
    setError(null)
    start(async () => {
      const res = await decideCreatorApplication({
        profileId,
        decision: 'REJECT',
        rejectionReason: reason,
      })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div className="admin-card">
      <div className="admin-card-eyebrow">Decision</div>
      {!asking ? (
        <div className="admin-card-actions" style={{ marginTop: 8 }}>
          <button className="admin-btn" disabled={pending} onClick={approve}>
            Approve
          </button>
          <button
            className="admin-btn secondary"
            disabled={pending}
            onClick={() => setAsking('REJECT')}
          >
            Reject
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          <textarea
            placeholder="Why? The applicant sees this."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={pending}
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 13,
              width: '100%',
              maxWidth: 520,
              padding: 10,
              border: '0.5px solid var(--color-linen-grey)',
              borderRadius: 3,
              background: 'var(--color-soft-parchment)',
            }}
          />
          <div className="admin-card-actions">
            <button
              className="admin-btn danger"
              disabled={pending || !reason.trim()}
              onClick={reject}
            >
              Confirm reject
            </button>
            <button
              className="admin-btn secondary"
              disabled={pending}
              onClick={() => setAsking(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 10, fontSize: 13 }}>
          {error}
        </p>
      )}
    </div>
  )
}
