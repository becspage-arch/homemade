'use client'

import { useTransition } from 'react'
import { toggleBookmark } from '@/lib/user-state-actions'

interface BookmarkRemoveProps {
  tutorialId: string
}

/**
 * Small in-context unbookmark control on the /me/bookmarks list. Sits as a
 * secondary affordance — the card itself remains the primary link.
 */
export function BookmarkRemove({ tutorialId }: BookmarkRemoveProps) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        start(async () => {
          await toggleBookmark(tutorialId)
        })
      }}
      disabled={pending}
      aria-label="Remove bookmark"
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        fontFamily: 'var(--font-lora)',
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 999,
        border: '0.5px solid var(--color-warm-taupe)',
        background: 'rgba(255, 252, 245, 0.92)',
        color: 'var(--color-warm-taupe)',
        cursor: pending ? 'wait' : 'pointer',
      }}
    >
      {pending ? '…' : 'Remove'}
    </button>
  )
}
