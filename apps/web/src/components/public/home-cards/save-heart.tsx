'use client'

import { useState, useTransition } from 'react'
import type { MouseEvent } from 'react'
import { toggleBookmark } from '@/lib/user-state-actions'

interface SaveHeartProps {
  tutorialId: string
  initialSaved: boolean
}

/**
 * Save-on-hover heart for discovery-wall tiles. Reuses the same
 * `toggleBookmark` server action as the tutorial-page bookmark button, so a
 * save here lands on the user's Make it list everywhere else. Anonymous users
 * are redirected to sign-in by the action (saving is a free signed-in
 * feature, not premium).
 *
 * Rendered as a sibling of the card's <Link>, not a child — a <button> inside
 * an <a> is invalid HTML. It sits over the image via absolute positioning.
 */
export function SaveHeart({ tutorialId, initialSaved }: SaveHeartProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, start] = useTransition()

  function onClick(e: MouseEvent<HTMLButtonElement>): void {
    // Defensive: the button is a sibling of the link, but stop propagation
    // in case it's ever nested in a clickable container.
    e.preventDefault()
    e.stopPropagation()
    const optimistic = !saved
    setSaved(optimistic)
    start(async () => {
      const res = await toggleBookmark(tutorialId)
      if (res.ok && typeof res.bookmarked === 'boolean') {
        setSaved(res.bookmarked)
      } else if (!res.ok) {
        setSaved(!optimistic)
      }
    })
  }

  return (
    <button
      type="button"
      className={`save-heart${saved ? ' active' : ''}`}
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from your Make it list' : 'Save to your Make it list'}
    >
      <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true">
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
