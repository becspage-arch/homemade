'use client'

import { useState, useTransition } from 'react'
import { toggleBookmark } from '@/lib/user-state-actions'

interface BookmarkButtonProps {
  tutorialId: string
  initialBookmarked: boolean
}

export function BookmarkButton({
  tutorialId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [pending, start] = useTransition()

  function onClick(): void {
    // Optimistic flip — the action result will correct us if it disagrees.
    const optimistic = !bookmarked
    setBookmarked(optimistic)
    start(async () => {
      const res = await toggleBookmark(tutorialId)
      if (res.ok && typeof res.bookmarked === 'boolean') {
        setBookmarked(res.bookmarked)
      } else if (!res.ok) {
        setBookmarked(!optimistic)
      }
    })
  }

  return (
    <button
      type="button"
      className={`reader-action bookmark${bookmarked ? ' active' : ''}`}
      onClick={onClick}
      disabled={pending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this tutorial'}
    >
      <svg viewBox="0 0 16 20" width="14" height="18" aria-hidden="true">
        <path
          d="M2 1.5h12v17l-6-4-6 4z"
          fill={bookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      <span>{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  )
}
