'use client'

import { useTransition } from 'react'
import { clearMakerOfTheMonth } from '@/lib/maker-of-the-month-actions'

export function ClearPickButton({ id, small }: { id: string; small?: boolean }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      className={small ? 'admin-btn secondary' : 'admin-btn secondary'}
      style={small ? { padding: '2px 8px', fontSize: 11 } : undefined}
      disabled={pending}
      onClick={() => {
        if (!confirm('Clear this Maker of the Month pick?')) return
        start(async () => {
          await clearMakerOfTheMonth({ id })
        })
      }}
    >
      {pending ? '…' : 'Clear'}
    </button>
  )
}
