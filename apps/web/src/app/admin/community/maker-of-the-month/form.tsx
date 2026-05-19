'use client'

import { useState, useTransition } from 'react'
import { setMakerOfTheMonth } from '@/lib/maker-of-the-month-actions'

export function MakerOfTheMonthForm() {
  const [handle, setHandle] = useState('')
  const [reason, setReason] = useState('')
  const [pending, start] = useTransition()
  const [status, setStatus] = useState<
    { state: 'idle' } | { state: 'saving' } | { state: 'ok' } | { state: 'err'; msg: string }
  >({ state: 'idle' })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus({ state: 'saving' })
    start(async () => {
      const res = await setMakerOfTheMonth({
        handle: handle.replace(/^@/, ''),
        featuredReason: reason,
      })
      if (res.ok) {
        setStatus({ state: 'ok' })
        setHandle('')
        setReason('')
      } else {
        setStatus({ state: 'err', msg: res.error })
      }
    })
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 8 }}>
      <div className="admin-form-row">
        <label htmlFor="motm-handle">Maker handle</label>
        <input
          id="motm-handle"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="e.g. rebecca-page"
          disabled={pending}
          autoComplete="off"
        />
      </div>
      <div className="admin-form-row">
        <label htmlFor="motm-reason">Why we picked them (internal)</label>
        <textarea
          id="motm-reason"
          rows={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="A note for our records — not surfaced publicly."
          disabled={pending}
        />
      </div>
      <button type="submit" className="admin-btn" disabled={pending}>
        {pending ? 'Setting…' : 'Set as Maker of the Month'}
      </button>
      {status.state === 'ok' && (
        <p style={{ marginTop: 8, color: 'var(--color-sage)' }}>
          Set. The badge + homepage tile go live now and expire at month end.
        </p>
      )}
      {status.state === 'err' && (
        <p
          style={{
            marginTop: 8,
            color: 'var(--color-burnt-sienna)',
            fontSize: 13,
          }}
        >
          {status.msg}
        </p>
      )}
    </form>
  )
}
