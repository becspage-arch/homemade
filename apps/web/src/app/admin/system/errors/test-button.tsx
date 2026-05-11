'use client'

import { useState, useTransition } from 'react'
import { throwSentryTestError } from './actions'

export function SentryTestButton() {
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
            try {
              await throwSentryTestError()
            } catch (err) {
              setMessage(
                err instanceof Error
                  ? `Threw: ${err.message}. Check Sentry within a minute.`
                  : 'Threw an error. Check Sentry within a minute.',
              )
            }
          })
        }}
      >
        {pending ? 'Throwing…' : 'Throw a test error'}
      </button>
      {message && (
        <p style={{ marginTop: 12, fontStyle: 'italic' }}>{message}</p>
      )}
    </div>
  )
}
