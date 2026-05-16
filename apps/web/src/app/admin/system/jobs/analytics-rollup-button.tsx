'use client'

import { useState, useTransition } from 'react'
import { triggerAnalyticsRollup } from './actions'

function isoDay(offset: number): string {
  const d = new Date(Date.now() - offset * 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

export function AnalyticsRollupButton() {
  const [pending, startTransition] = useTransition()
  const [from, setFrom] = useState(isoDay(7))
  const [to, setTo] = useState(isoDay(1))
  const [force, setForce] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-warm-taupe)' }}>From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            disabled={pending}
            style={{ padding: '6px 10px', border: '0.5px solid var(--color-linen-grey)', borderRadius: 4 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-warm-taupe)' }}>To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={pending}
            style={{ padding: '6px 10px', border: '0.5px solid var(--color-linen-grey)', borderRadius: 4 }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-warm-taupe)' }}>
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            disabled={pending}
          />
          <span style={{ fontSize: 13 }}>Force re-run for already-processed dates</span>
        </label>
        <button
          type="button"
          className="admin-button"
          disabled={pending}
          onClick={() => {
            setMessage(null)
            startTransition(async () => {
              const result = await triggerAnalyticsRollup({ from, to, force })
              setMessage(
                result.ok
                  ? `Backfill queued for ${from} → ${to}${force ? ' (force)' : ''}.`
                  : result.error,
              )
            })
          }}
        >
          {pending ? 'Sending…' : 'Run analytics rollup'}
        </button>
      </div>
      {message && (
        <p style={{ marginTop: 12, fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}>{message}</p>
      )}
    </div>
  )
}
