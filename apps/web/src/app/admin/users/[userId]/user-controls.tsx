'use client'

import { useState, useTransition } from 'react'
import { changeUserRole, suspendUser, liftSuspension } from '@/lib/moderation-actions'

interface Props {
  userId: string
  currentRole: 'ADMIN' | 'EDITOR' | 'MEMBER' | 'CREATOR' | 'TESTER' | 'ANONYMOUS'
  isSuspended: boolean
  actorIsAdmin: boolean
  isSelf: boolean
  targetIsAdmin: boolean
}

export function UserDetailControls({
  userId,
  currentRole,
  isSuspended,
  actorIsAdmin,
  isSelf,
  targetIsAdmin,
}: Props) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [role, setRole] = useState<'ADMIN' | 'EDITOR' | 'MEMBER'>(
    currentRole === 'ADMIN' || currentRole === 'EDITOR' || currentRole === 'MEMBER'
      ? currentRole
      : 'MEMBER',
  )
  const [reason, setReason] = useState('')
  const [endsAt, setEndsAt] = useState<string>('')

  const onRole = () => {
    setError(null)
    start(async () => {
      const res = await changeUserRole({ userId, role })
      if (!res.ok) setError(res.error)
    })
  }
  const onSuspend = () => {
    setError(null)
    start(async () => {
      const end = endsAt ? new Date(endsAt + 'T23:59:59Z') : null
      const res = await suspendUser({ userId, reason, endsAt: end })
      if (!res.ok) setError(res.error)
    })
  }
  const onLift = () => {
    setError(null)
    start(async () => {
      const res = await liftSuspension({ userId })
      if (!res.ok) setError(res.error)
    })
  }

  return (
    <div className="admin-card">
      <div className="admin-card-eyebrow">Moderation</div>

      {actorIsAdmin && !isSelf && !targetIsAdmin && (
        <div style={{ marginTop: 8 }}>
          <label
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 13,
              color: 'var(--color-warm-taupe)',
            }}
          >
            Role
          </label>
          <div className="admin-card-actions" style={{ marginTop: 6 }}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'EDITOR' | 'MEMBER')}
              disabled={pending}
              style={{
                fontFamily: 'var(--font-lora)',
                padding: '6px 10px',
                border: '0.5px solid var(--color-linen-grey)',
                borderRadius: 3,
              }}
            >
              <option value="ADMIN">Admin</option>
              <option value="EDITOR">Editor</option>
              <option value="MEMBER">Member</option>
            </select>
            <button
              className="admin-btn"
              disabled={pending || role === currentRole}
              onClick={onRole}
            >
              Change role
            </button>
          </div>
        </div>
      )}
      {!actorIsAdmin && (
        <p style={{ fontSize: 12, color: 'var(--color-warm-taupe)', fontStyle: 'italic' }}>
          Editors can apply bounded suspensions but can’t change roles or permanently ban.
          Ask an admin for those.
        </p>
      )}

      {!isSelf && !targetIsAdmin && !isSuspended && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 12,
            borderTop: '0.5px solid var(--color-linen-grey)',
          }}
        >
          <div className="admin-card-eyebrow" style={{ marginBottom: 6 }}>
            Suspend
          </div>
          <div className="admin-card-actions">
            <input
              type="text"
              placeholder="Reason (required)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={pending}
            />
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              placeholder="End date (blank = permanent)"
              disabled={pending}
              style={{
                fontFamily: 'var(--font-lora)',
                padding: '6px 10px',
                border: '0.5px solid var(--color-linen-grey)',
                borderRadius: 3,
              }}
            />
            <button
              className="admin-btn danger"
              disabled={pending || !reason.trim() || (!endsAt && !actorIsAdmin)}
              onClick={onSuspend}
            >
              {endsAt ? 'Suspend until date' : 'Suspend indefinitely'}
            </button>
          </div>
          {!actorIsAdmin && (
            <p style={{ fontSize: 12, color: 'var(--color-warm-taupe)', fontStyle: 'italic' }}>
              Indefinite suspension requires an admin.
            </p>
          )}
        </div>
      )}

      {isSuspended && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 12,
            borderTop: '0.5px solid var(--color-linen-grey)',
          }}
        >
          <button className="admin-btn secondary" disabled={pending} onClick={onLift}>
            Lift suspension
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-burnt-sienna)', marginTop: 8, fontSize: 13 }}>{error}</p>
      )}
    </div>
  )
}
