'use client'

import { useTransition } from 'react'
import { markNotificationsRead } from '@/lib/notification-actions'

export function MarkReadButton() {
  const [pending, start] = useTransition()
  return (
    <button
      className="me-button secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markNotificationsRead()
        })
      }
      type="button"
    >
      {pending ? '...' : 'Mark all as read'}
    </button>
  )
}
