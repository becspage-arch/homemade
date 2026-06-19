'use client'

import { useState, useTransition } from 'react'
import { toggleSavedPattern } from '@/lib/user-state-actions'

interface PatternSaveButtonProps {
  patternId: string
  initialSaved: boolean
}

/**
 * Save-to-Make-it-list button for the pattern detail page — the pattern
 * equivalent of the tutorial reader's BookmarkButton. Styled as a ghost
 * pattern-detail action so it sits in the actions row next to Stitch / PDF.
 */
export function PatternSaveButton({ patternId, initialSaved }: PatternSaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, start] = useTransition()

  function onClick(): void {
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
      className={`pattern-detail-action ghost${saved ? ' is-saved' : ''}`}
      aria-pressed={saved}
      aria-label={
        saved ? 'Remove from your Make it list' : 'Save to your Make it list'
      }
    >
      <svg
        viewBox="0 0 20 20"
        width="16"
        height="16"
        aria-hidden="true"
        style={{ marginRight: 7 }}
      >
        <path
          d="M10 17.5l-1.45-1.32C3.4 11.5 0 8.4 0 4.6 0 1.5 2.42 0 4.7 0 6.4 0 9 .8 10 3 11 .8 13.6 0 15.3 0 17.58 0 20 1.5 20 4.6c0 3.8-3.4 6.9-8.55 11.58L10 17.5z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {saved ? 'On Make it list' : 'Save'}
    </button>
  )
}
