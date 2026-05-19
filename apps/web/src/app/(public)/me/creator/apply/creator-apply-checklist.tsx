'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { submitCreatorApplicationFromProfile } from '@/lib/creator-actions'

interface CreatorApplyChecklistProps {
  canSubmit: boolean
  handle: string | null
}

/**
 * Single submit button on /me/creator/apply post-rebrand. The application
 * IS the Maker profile — no form fields here. If the checklist passes,
 * "Apply with my Maker profile" writes a CreatorProfile row with status
 * APPLIED and points the admin reviewer at /m/{handle}.
 */
export function CreatorApplyChecklist({
  canSubmit,
  handle,
}: CreatorApplyChecklistProps) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function onSubmit() {
    setError(null)
    start(async () => {
      const res = await submitCreatorApplicationFromProfile()
      if (res.ok) {
        setSuccess(true)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="me-form" style={{ maxWidth: 640 }}>
      <p className="me-section-description">
        When you apply, your public Maker profile becomes the application. A
        Homemade reviewer opens it directly.
      </p>
      {handle && (
        <p style={{ marginBottom: 16 }}>
          <Link href={`/m/${handle}`} className="me-nav-link">
            Preview your public profile →
          </Link>
        </p>
      )}
      <button
        type="button"
        className="me-button"
        onClick={onSubmit}
        disabled={!canSubmit || pending || success}
      >
        {pending
          ? 'Sending…'
          : success
            ? 'Application sent'
            : 'Apply with my Maker profile'}
      </button>
      {!canSubmit && !success && (
        <p className="me-feedback" style={{ marginTop: 8 }}>
          Finish the readiness items above first.
        </p>
      )}
      {error && (
        <p className="me-feedback error" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
      {success && (
        <p className="me-feedback" style={{ marginTop: 8 }}>
          Sent. The reviewer will read your Maker profile and get back to you.
        </p>
      )}
    </div>
  )
}
