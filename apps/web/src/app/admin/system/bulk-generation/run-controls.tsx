'use client'

import { useState, useTransition } from 'react'
import { triggerBulkBatch } from './actions'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-lora)',
  fontSize: 13,
  width: 56,
  padding: '6px 8px',
  border: '0.5px solid var(--color-warm-taupe)',
  borderRadius: 3,
  background: 'var(--color-cream)',
  color: 'var(--color-espresso)',
}

/**
 * One "Run a batch" control for a craft — a count + a branded button that fires
 * a server-side batch (via the triggerBulkBatch server action → Inngest). Used
 * on each craft card of the bulk-generation page.
 */
export function RunBatchControl({
  craft,
  defaultCount,
  disabled,
  disabledReason,
}: {
  craft: 'cross-stitch' | 'needlework'
  defaultCount: number
  disabled?: boolean
  disabledReason?: string
}) {
  const [count, setCount] = useState(defaultCount)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
        Batch size
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={inputStyle}
          disabled={pending || disabled}
        />
      </label>
      <button
        type="button"
        className="admin-btn"
        disabled={pending || disabled}
        onClick={() => {
          setMessage(null)
          startTransition(async () => {
            const result = await triggerBulkBatch(craft, count)
            setMessage(result.ok ? `Batch of ${result.queued} queued — watch the Inngest dashboard for progress.` : result.error)
          })
        }}
      >
        {pending ? 'Queuing…' : 'Run a batch'}
      </button>
      {(message || (disabled && disabledReason)) && (
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)' }}>
          {message ?? disabledReason}
        </span>
      )}
    </div>
  )
}
