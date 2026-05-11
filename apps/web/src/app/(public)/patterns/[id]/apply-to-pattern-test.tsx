'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { applyToPatternTest } from '@/lib/creator-actions'

interface Props {
  patternTestId: string
}

export function ApplyToPatternTestForm({ patternTestId }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await applyToPatternTest({ patternTestId, note: note.trim() || null })
      if (res.ok) {
        router.push('/me/tester/assignments')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={submit} className="me-form" style={{ maxWidth: 520, marginTop: 12 }}>
      <div className="me-field">
        <label htmlFor="note">Why you’d like to test this (optional)</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          maxLength={1000}
          disabled={pending}
          placeholder="The creator reads this before deciding."
        />
      </div>
      {error && <p className="me-feedback error">{error}</p>}
      <div>
        <button type="submit" className="me-button" disabled={pending}>
          {pending ? 'Sending…' : 'Apply'}
        </button>
      </div>
    </form>
  )
}
