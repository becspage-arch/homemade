'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinPatternTesterPool } from '@/lib/creator-actions'

export function TesterApplyForm() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function join() {
    setError(null)
    start(async () => {
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
      <button type="button" className="me-button" disabled={pending} onClick={join}>
        {pending ? 'Joining…' : 'Join the tester pool'}
      </button>
      {error && <p className="me-feedback error" style={{ marginTop: 12 }}>{error}</p>}
      <p style={{ marginTop: 16, fontFamily: 'var(--font-lora)', fontSize: 13, color: 'var(--color-warm-taupe)' }}>
        You can leave any time from your tester dashboard.
      </p>
    </div>
  )
}
