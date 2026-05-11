'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { decideTestApplicant } from '@/lib/creator-actions'

type TestAssignmentStatus =
  | 'APPLIED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'WITHDRAWN'
  | 'REJECTED'

interface Props {
  assignmentId: string
  status: TestAssignmentStatus
  slotsOpen: boolean
}

export function ApplicantControls({ assignmentId, status, slotsOpen }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [askingReason, setAskingReason] = useState(false)

  function accept() {
    setError(null)
    start(async () => {
      const res = await decideTestApplicant({ assignmentId, decision: 'ACCEPT' })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function reject() {
    setError(null)
    start(async () => {
      const res = await decideTestApplicant({
        assignmentId,
        decision: 'REJECT',
        rejectionReason: reason.trim() || null,
      })
      if (!res.ok) setError(res.error)
      else {
        setAskingReason(false)
        setReason('')
        router.refresh()
      }
    })
  }

  if (status !== 'APPLIED') {
    return (
      <span style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)', fontSize: 13 }}>
        {status === 'ACCEPTED' && 'Accepted'}
        {status === 'IN_PROGRESS' && 'Making it now'}
        {status === 'COMPLETED' && 'Feedback in'}
        {status === 'REJECTED' && 'Rejected'}
        {status === 'WITHDRAWN' && 'Withdrawn'}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {!askingReason ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="me-button"
            disabled={pending || !slotsOpen}
            onClick={accept}
            title={!slotsOpen ? 'All slots are full — bump max testers first' : undefined}
          >
            Accept
          </button>
          <button
            type="button"
            className="me-button secondary"
            disabled={pending}
            onClick={() => setAskingReason(true)}
          >
            Reject
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="text"
            placeholder="Optional note for the applicant"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={pending}
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 13,
              padding: '6px 10px',
              border: '0.5px solid var(--color-linen-grey)',
              borderRadius: 3,
              background: 'var(--color-cream)',
              minWidth: 240,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="me-button danger"
              disabled={pending}
              onClick={reject}
            >
              Confirm reject
            </button>
            <button
              type="button"
              className="me-button secondary"
              disabled={pending}
              onClick={() => setAskingReason(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="me-feedback error" style={{ fontSize: 12 }}>{error}</p>}
    </div>
  )
}
