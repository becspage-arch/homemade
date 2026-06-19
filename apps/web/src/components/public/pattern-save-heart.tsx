'use client'

import { useState, useTransition } from 'react'
import type { MouseEvent } from 'react'
import { toggleSavedPattern } from '@/lib/user-state-actions'

/**
 * Icon-only save heart overlaid on a pattern library card. Self-contained
 * inline styles so it doesn't depend on the home-cards stylesheet being
 * loaded. Sibling of the card link (a button inside an anchor is invalid),
 * so the parent <li> must be position: relative.
 */
export function PatternSaveHeart({
  patternId,
  initialSaved,
}: {
  patternId: string
  initialSaved: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, start] = useTransition()

  function onClick(e: MouseEvent<HTMLButtonElement>): void {
    e.preventDefault()
    e.stopPropagation()
    const optimistic = !saved
    setSaved(optimistic)
    start(async () => {
      const res = await toggleSavedPattern(patternId)
      if (res.ok && typeof res.saved === 'boolean') {
        setSaved(res.saved)
      } else if (!res.ok) {
        setSaved(!optimistic)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from your Make it list' : 'Save to your Make it list'}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
        width: 32,
        height: 32,
        borderRadius: 9999,
        border: 0,
        cursor: 'pointer',
        background: 'rgba(245, 240, 232, 0.92)',
        color: '#a86547',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
      }}
    >
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <path
          d="M10 17.5l-1.45-1.32C3.4 11.5 0 8.4 0 4.6 0 1.5 2.42 0 4.7 0 6.4 0 9 .8 10 3 11 .8 13.6 0 15.3 0 17.58 0 20 1.5 20 4.6c0 3.8-3.4 6.9-8.55 11.58L10 17.5z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
