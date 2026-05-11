'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitCreatorTutorialForModeration } from '@/lib/creator-actions'

type TutorialStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'PENDING_MODERATION'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'ARCHIVED'

interface Props {
  tutorialId: string
  status: TutorialStatus
}

export function CreatorTutorialActions({ tutorialId, status }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function submitForReview() {
    setError(null)
    setSuccess(null)
    start(async () => {
      const res = await submitCreatorTutorialForModeration({ tutorialId })
      if (res.ok) {
        setSuccess('Submitted for review.')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <section>
      <span className="me-section-label">Actions</span>
      <h2 className="me-section-title">What next</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {status === 'DRAFT' && (
          <button
            type="button"
            className="me-button"
            disabled={pending}
            onClick={submitForReview}
          >
            {pending ? 'Submitting…' : 'Submit for review'}
          </button>
        )}
        {status === 'PENDING_MODERATION' && (
          <span style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)' }}>
            Waiting on the team. The form below is locked while review is in progress.
          </span>
        )}
        {status === 'PUBLISHED' && (
          <span style={{ fontFamily: 'var(--font-lora)', color: 'var(--color-warm-taupe)' }}>
            Edits below go live as soon as you save.
          </span>
        )}
      </div>
      {error && <p className="me-feedback error" style={{ marginTop: 12 }}>{error}</p>}
      {success && <p className="me-feedback" style={{ marginTop: 12 }}>{success}</p>}
    </section>
  )
}
