'use client'

import { useState, useTransition } from 'react'
import { adminCancelAccountDeletion } from '@/lib/admin-data-rights-actions'

interface CancelButtonProps {
  requestId: string
  userId: string
}

export function CancelButton({ requestId, userId }: CancelButtonProps) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = () => {
    setError(null)
    start(async () => {
      const res = await adminCancelAccountDeletion({ requestId, userId, note })
      if (!res.ok) setError(res.error)
      setExpanded(false)
      setNote('')
    })
  }

  if (!expanded) {
    return (
      <button
        type="button"
        className="admin-btn secondary"
        onClick={() => setExpanded(true)}
      >
        Cancel
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <input
        type="text"
        placeholder="Reason (required)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={pending}
        style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 13,
          padding: '6px 10px',
          border: '0.5px solid var(--color-linen-grey)',
          borderRadius: 3,
        }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          className="admin-btn"
          onClick={run}
          disabled={pending || note.trim().length === 0}
        >
          {pending ? '…' : 'Confirm'}
        </button>
        <button
          type="button"
          className="admin-btn secondary"
          onClick={() => {
            setExpanded(false)
            setNote('')
          }}
          disabled={pending}
        >
          Back
        </button>
      </div>
      {error && <span style={{ color: 'var(--color-burnt-sienna)', fontSize: 12 }}>{error}</span>}
    </div>
  )
}
