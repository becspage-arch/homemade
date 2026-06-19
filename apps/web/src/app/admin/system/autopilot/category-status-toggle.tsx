'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setCategoryPipelineStatus } from './actions'

type PipelineStatus = 'NOT_READY' | 'READY' | 'PAUSED' | 'COMPLETE'

interface Props {
  categoryId: string
  status: PipelineStatus
}

const STATIC_LABEL: Record<'NOT_READY' | 'COMPLETE', string> = {
  NOT_READY: 'Not ready',
  COMPLETE: 'Complete',
}

const STATIC_COLOUR: Record<'NOT_READY' | 'COMPLETE', string> = {
  NOT_READY: 'var(--color-warm-taupe)',
  COMPLETE: 'var(--color-espresso)',
}

export function CategoryStatusToggle({ categoryId, status }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()

  // NOT_READY / COMPLETE are pipeline-owned — show plain text, no toggle.
  if (status === 'NOT_READY' || status === 'COMPLETE') {
    return (
      <span
        style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: STATIC_COLOUR[status],
        }}
      >
        {STATIC_LABEL[status]}
      </span>
    )
  }

  const isReady = status === 'READY'

  function toggle() {
    const next = isReady ? 'PAUSED' : 'READY'
    start(async () => {
      const res = await setCategoryPipelineStatus(categoryId, next)
      if (res.ok) router.refresh()
    })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isReady}
      aria-label={isReady ? 'Ready — click to pause' : 'Paused — click to set ready'}
      title={isReady ? 'Ready — click to pause' : 'Paused — click to set ready'}
      disabled={pending}
      onClick={toggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: pending ? 'wait' : 'pointer',
        opacity: pending ? 0.6 : 1,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'relative',
          display: 'inline-block',
          width: 34,
          height: 18,
          borderRadius: 9,
          background: isReady ? 'var(--color-sage)' : 'var(--color-linen-grey)',
          transition: 'background 120ms ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: isReady ? 18 : 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--color-cream, #fff)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            transition: 'left 120ms ease',
          }}
        />
      </span>
      <span
        style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: isReady ? 'var(--color-sage)' : 'var(--color-burnt-sienna)',
        }}
      >
        {isReady ? 'Ready' : 'Paused'}
      </span>
    </button>
  )
}
