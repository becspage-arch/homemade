'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { moderateCreatorTutorial } from '@/lib/creator-actions'

interface Props {
  tutorialId: string
}

export function CreatorTutorialModerationControls({ tutorialId }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [askingSendBack, setAskingSendBack] = useState(false)
  const [note, setNote] = useState('')

  function publish() {
    setError(null)
    start(async () => {
      const res = await moderateCreatorTutorial({
        tutorialId,
        decision: 'PUBLISH',
        note: note.trim() || null,
      })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function sendBack() {
    setError(null)
    start(async () => {
      const res = await moderateCreatorTutorial({
        tutorialId,
        decision: 'SEND_BACK',
        note,
      })
      if (!res.ok) setError(res.error)
      else {
        setAskingSendBack(false)
        setNote('')
        router.refresh()
      }
    })
  }

  return (
    <div style={{ minWidth: 240 }}>
      {!askingSendBack ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="admin-btn" disabled={pending} onClick={publish}>
            Publish
          </button>
          <button
            className="admin-btn secondary"
            disabled={pending}
            onClick={() => setAskingSendBack(true)}
          >
            Send back
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            placeholder="What needs changing? (required)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            disabled={pending}
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 13,
              padding: 8,
              border: '0.5px solid var(--color-linen-grey)',
              borderRadius: 3,
              background: 'var(--color-soft-parchment)',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="admin-btn danger"
              disabled={pending || !note.trim()}
              onClick={sendBack}
            >
              Confirm send back
            </button>
            <button
              className="admin-btn secondary"
              disabled={pending}
              onClick={() => setAskingSendBack(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 12 }}>
          {error}
        </p>
      )}
    </div>
  )
}
