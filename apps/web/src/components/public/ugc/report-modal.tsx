'use client'

import { useState, useTransition } from 'react'
import { submitReport } from '@/lib/ugc-actions'

type TargetType = 'REVIEW' | 'PHOTO' | 'QUESTION' | 'ANSWER' | 'USER'
type Reason = 'SPAM' | 'ABUSE' | 'MISINFORMATION' | 'COPYRIGHT' | 'NSFW' | 'OTHER'

const REASONS: { value: Reason; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'ABUSE', label: 'Abusive or harassing' },
  { value: 'MISINFORMATION', label: 'Misleading or wrong' },
  { value: 'COPYRIGHT', label: 'Copyright concern' },
  { value: 'NSFW', label: 'NSFW or graphic' },
  { value: 'OTHER', label: 'Something else' },
]

interface Props {
  targetType: TargetType
  targetId: string
  onClose: () => void
}

export function ReportModal({ targetType, targetId, onClose }: Props) {
  const [pending, start] = useTransition()
  const [reason, setReason] = useState<Reason>('SPAM')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = () => {
    setError(null)
    start(async () => {
      const res = await submitReport({
        targetType,
        targetId,
        reason,
        description: description || null,
      })
      if (!res.ok) setError(res.error)
      else setDone(true)
    })
  }

  return (
    <div className="ugc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ugc-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Report this {targetType.toLowerCase()}</h3>
        {done ? (
          <>
            <p className="ugc-success">Thanks — a moderator will take a look.</p>
            <div className="ugc-modal-actions">
              <button className="ugc-cta" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="ugc-form" style={{ background: 'transparent', border: 0, padding: 0 }}>
              <label>Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as Reason)}
                disabled={pending}
                style={{
                  fontFamily: 'var(--font-lora)',
                  padding: 10,
                  border: '0.5px solid var(--color-linen-grey)',
                  borderRadius: 3,
                  background: 'var(--color-cream)',
                }}
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <label>Anything else? (optional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={pending}
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
                {pending ? '...' : 'Send report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
