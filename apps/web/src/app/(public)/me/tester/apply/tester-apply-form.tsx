'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinPatternTesterPool } from '@/lib/creator-actions'
import { acceptTesterAgreement } from '@/lib/maker-photo-actions'

const AGREEMENT_LABEL =
  'I will try the pattern as written and give feedback on it. Photos I upload during a test may be shown on the pattern’s page and in Homemade’s own promotion, with my handle, before the pattern is public.'

export function TesterApplyForm({ alreadyAgreed = false }: { alreadyAgreed?: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [agreed, setAgreed] = useState(alreadyAgreed)
  const [error, setError] = useState<string | null>(null)

  function join() {
    setError(null)
    if (!agreed) {
      setError('Tick the box to join.')
      return
    }
    start(async () => {
      const stamp = await acceptTesterAgreement()
      if (!stamp.ok) {
        setError(stamp.error)
        return
      }
      const res = await joinPatternTesterPool()
      if (res.ok) {
        router.push('/me/tester')
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div>
      <label
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          fontFamily: 'var(--font-lora)',
          fontSize: 14,
          lineHeight: 1.6,
          maxWidth: '60ch',
          marginBottom: 16,
        }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={pending}
          style={{ marginTop: 4 }}
        />
        <span>{AGREEMENT_LABEL}</span>
      </label>

      <button
        type="button"
        className="me-button"
        disabled={pending || !agreed}
        onClick={join}
      >
        {pending ? 'Joining…' : 'Join the tester pool'}
      </button>
      {error && <p className="me-feedback error" style={{ marginTop: 12 }}>{error}</p>}
      <p style={{ marginTop: 16, fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
        You can leave any time from your tester dashboard.
      </p>
    </div>
  )
}
