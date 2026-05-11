'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { transitionPatternTestStatus } from '@/lib/creator-actions'

type PatternTestStatus = 'DRAFT' | 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

interface Props {
  patternTestId: string
  status: PatternTestStatus
}

const NEXT_STATES: Record<PatternTestStatus, { target: PatternTestStatus; label: string; tone?: 'danger' }[]> = {
  DRAFT: [
    { target: 'RECRUITING', label: 'Open recruiting' },
    { target: 'CANCELLED', label: 'Cancel', tone: 'danger' },
  ],
  RECRUITING: [
    { target: 'IN_PROGRESS', label: 'Close recruiting, start tests' },
    { target: 'DRAFT', label: 'Back to draft' },
    { target: 'CANCELLED', label: 'Cancel', tone: 'danger' },
  ],
  IN_PROGRESS: [
    { target: 'COMPLETED', label: 'Mark complete' },
    { target: 'CANCELLED', label: 'Cancel', tone: 'danger' },
  ],
  COMPLETED: [],
  CANCELLED: [{ target: 'DRAFT', label: 'Reopen as draft' }],
}

export function PatternTestStatusControls({ patternTestId, status }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const options = NEXT_STATES[status]

  function go(target: PatternTestStatus) {
    setError(null)
    start(async () => {
      const res = await transitionPatternTestStatus({ patternTestId, target })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <section>
      <span className="me-section-label">Lifecycle</span>
      <h2 className="me-section-title">Move it forward</h2>
      {options.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)' }}>
          This pattern test is closed.
        </p>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {options.map((opt) => (
            <button
              key={opt.target}
              type="button"
              disabled={pending}
              onClick={() => go(opt.target)}
              className={`me-button ${opt.tone === 'danger' ? 'danger' : opt.target === 'DRAFT' ? 'secondary' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {error && <p className="me-feedback error" style={{ marginTop: 12 }}>{error}</p>}
    </section>
  )
}
