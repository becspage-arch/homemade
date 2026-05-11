'use client'

import { useState, useTransition } from 'react'
import { submitErrata } from '@/lib/ugc-actions'

export function ErrataLink({ tutorialId }: { tutorialId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="ugc-errata-link" onClick={() => setOpen(true)} type="button">
        Spot an issue with this tutorial?
      </button>
      {open && <ErrataModal tutorialId={tutorialId} onClose={() => setOpen(false)} />}
    </>
  )
}

function ErrataModal({
  tutorialId,
  onClose,
}: {
  tutorialId: string
  onClose: () => void
}) {
  const [pending, start] = useTransition()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    setError(null)
    start(async () => {
      const res = await submitErrata({ tutorialId, body })
      if (!res.ok) setError(res.error)
      else setSubmitted(true)
    })
  }

  return (
    <div className="ugc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ugc-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Tell us what looks off</h3>
        {submitted ? (
          <>
            <p className="ugc-success">Thanks — we’ll have a look.</p>
            <div className="ugc-modal-actions">
              <button className="ugc-cta" onClick={onClose} type="button">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="ugc-form" style={{ background: 'transparent', border: 0, padding: 0 }}>
              <textarea
                rows={5}
                maxLength={2000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={pending}
                placeholder="A bit of detail helps — which step, what looked wrong, what you tried."
              />
            </div>
            {error && <p className="ugc-error">{error}</p>}
            <div className="ugc-modal-actions">
              <button
                className="ugc-cta secondary"
                onClick={onClose}
                disabled={pending}
                type="button"
              >
                Cancel
              </button>
              <button className="ugc-cta" onClick={submit} disabled={pending} type="button">
                {pending ? '...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
