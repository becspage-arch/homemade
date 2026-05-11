'use client'

import { useTransition, useState } from 'react'
import { triggerTypesenseReindex } from './actions'

export function ReindexButton() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div>
      <button
        type="button"
        className="admin-button"
        disabled={pending}
        onClick={() => {
          setMessage(null)
          startTransition(async () => {
            const result = await triggerTypesenseReindex()
            setMessage(result.ok ? 'Reindex job queued.' : result.error)
          })
        }}
      >
        {pending ? 'Sending…' : 'Trigger Typesense reindex'}
      </button>
      {message && (
        <p style={{ marginTop: 12, fontStyle: 'italic' }}>{message}</p>
      )}
    </div>
  )
}
