'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  revokeCreatorStatus,
  setPatternTesterStatus,
} from '@/lib/creator-actions'

type CreatorApplicationStatus = 'NONE' | 'APPLIED' | 'APPROVED' | 'REJECTED'

interface Props {
  userId: string
  isCreator: boolean
  isPatternTester: boolean
  creatorVerifiedAt: Date | null
  actorIsAdmin: boolean
  isSelf: boolean
  displayHandle: string | null
  creatorProfileStatus: CreatorApplicationStatus | null
  creatorProfileId: string | null
}

export function CreatorTesterControls({
  userId,
  isCreator,
  isPatternTester,
  creatorVerifiedAt,
  actorIsAdmin,
  isSelf,
  displayHandle,
  creatorProfileStatus,
  creatorProfileId,
}: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function revoke() {
    if (!confirm('Revoke creator status?')) return
    setError(null)
    start(async () => {
      const res = await revokeCreatorStatus({ userId })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  function toggleTester(enabled: boolean) {
    setError(null)
    start(async () => {
      const res = await setPatternTesterStatus({ userId, enabled })
      if (!res.ok) setError(res.error)
      else router.refresh()
    })
  }

  return (
    <div className="admin-card">
      <div className="admin-card-eyebrow">Creator program</div>

      <div style={{ fontFamily: 'var(--font-lora)', fontSize: 14, marginTop: 6 }}>
        {isCreator ? (
          <>
            <p>
              <strong>Creator</strong>
              {creatorVerifiedAt && (
                <> · verified {creatorVerifiedAt.toLocaleDateString('en-GB')}</>
              )}
              {displayHandle && (
                <>
                  {' · '}
                  <Link
                    href={`/makers/${displayHandle}`}
                    style={{ color: 'var(--color-sage)' }}
                  >
                    public profile →
                  </Link>
                </>
              )}
            </p>
            {actorIsAdmin && !isSelf && (
              <div className="admin-card-actions" style={{ marginTop: 8 }}>
                <button className="admin-btn danger" disabled={pending} onClick={revoke}>
                  Revoke creator status
                </button>
              </div>
            )}
          </>
        ) : creatorProfileStatus === 'APPLIED' ? (
          <p>
            Application pending review.{' '}
            {creatorProfileId && (
              <Link
                href={`/admin/creators/${creatorProfileId}`}
                style={{ color: 'var(--color-sage)' }}
              >
                Open application →
              </Link>
            )}
          </p>
        ) : creatorProfileStatus === 'REJECTED' ? (
          <p>Previous application was rejected. They can re-apply.</p>
        ) : (
          <p style={{ color: 'var(--color-warm-taupe)' }}>
            Not a creator. No application on file.
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 12,
          borderTop: '0.5px solid var(--color-linen-grey)',
          fontFamily: 'var(--font-lora)',
          fontSize: 14,
        }}
      >
        <div className="admin-card-eyebrow" style={{ marginBottom: 6 }}>
          Pattern tester
        </div>
        {isPatternTester ? (
          <>
            <p>In the tester pool.</p>
            {!isSelf && (
              <div className="admin-card-actions" style={{ marginTop: 8 }}>
                <button
                  className="admin-btn danger"
                  disabled={pending}
                  onClick={() => toggleTester(false)}
                >
                  Remove from tester pool
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{ color: 'var(--color-warm-taupe)' }}>Not a pattern tester.</p>
            {!isSelf && (
              <div className="admin-card-actions" style={{ marginTop: 8 }}>
                <button
                  className="admin-btn secondary"
                  disabled={pending}
                  onClick={() => toggleTester(true)}
                >
                  Add to tester pool
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 13 }}>
          {error}
        </p>
      )}
    </div>
  )
}
