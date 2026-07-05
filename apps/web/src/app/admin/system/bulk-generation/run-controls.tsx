'use client'

import { useState, useTransition } from 'react'
import { triggerBulkBatch } from './actions'

function CraftRunner({ craft, label, defaultCount, disabled }: { craft: 'cross-stitch' | 'needlework'; label: string; defaultCount: number; disabled: boolean }) {
  const [count, setCount] = useState(defaultCount)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <strong style={{ minWidth: 120 }}>{label}</strong>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        count
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ width: 64 }}
          disabled={pending || disabled}
        />
      </label>
      <button
        type="button"
        className="admin-button"
        disabled={pending || disabled}
        onClick={() => {
          setMessage(null)
          startTransition(async () => {
            const result = await triggerBulkBatch(craft, count)
            setMessage(result.ok ? `Batch of ${result.queued} queued — watch the Inngest dashboard.` : result.error)
          })
        }}
      >
        {pending ? 'Queuing…' : 'Run a batch'}
      </button>
      {message && <span style={{ fontStyle: 'italic' }}>{message}</span>}
    </div>
  )
}

export function BulkRunControls({ disabled }: { disabled: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CraftRunner craft="cross-stitch" label="Cross-stitch" defaultCount={8} disabled={disabled} />
      <CraftRunner craft="needlework" label="Needlework" defaultCount={4} disabled={disabled} />
    </div>
  )
}
