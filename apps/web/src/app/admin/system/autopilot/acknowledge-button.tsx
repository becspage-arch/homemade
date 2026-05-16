'use client'

import { useTransition } from 'react'
import { acknowledgeHaltSignal } from './actions'

export function AcknowledgeButton({ signalId }: { signalId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      className="admin-btn"
      style={{ padding: '4px 10px', fontSize: 11 }}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await acknowledgeHaltSignal(signalId)
        })
      }}
    >
      {pending ? '…' : 'Acknowledge'}
    </button>
  )
}
