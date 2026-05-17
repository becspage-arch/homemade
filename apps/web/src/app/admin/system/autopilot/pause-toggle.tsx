'use client'

import { useState, useTransition } from 'react'
import { pauseStream, resumeStream } from './actions'

interface Props {
  streamName: 'queue' | 'global'
  paused: boolean
}

export function PauseToggle({ streamName, paused }: Props) {
  const [pending, startTransition] = useTransition()
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  if (paused) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          type="button"
          className="admin-btn"
          disabled={pending}
          onClick={() => {
            setMessage(null)
            startTransition(async () => {
              const result = await resumeStream(streamName)
              setMessage(result.ok ? 'Resumed.' : result.error)
            })
          }}
        >
          {pending ? 'Working…' : 'Resume'}
        </button>
        {message && (
          <p style={{ fontSize: 11, fontStyle: 'italic', margin: 0, color: 'var(--color-warm-taupe)' }}>
            {message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <input
        type="text"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={pending}
        style={{
          padding: '4px 8px',
          fontSize: 12,
          border: '0.5px solid var(--color-linen-grey)',
          borderRadius: 3,
          width: '100%',
        }}
      />
      <button
        type="button"
        className="admin-btn"
        disabled={pending}
        onClick={() => {
          setMessage(null)
          startTransition(async () => {
            const result = await pauseStream(streamName, reason)
            if (result.ok) {
              setReason('')
              setMessage('Paused.')
            } else {
              setMessage(result.error)
            }
          })
        }}
      >
        {pending ? 'Working…' : 'Pause'}
      </button>
      {message && (
        <p style={{ fontSize: 11, fontStyle: 'italic', margin: 0, color: 'var(--color-warm-taupe)' }}>
          {message}
        </p>
      )}
    </div>
  )
}
