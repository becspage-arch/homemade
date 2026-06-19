'use client'

import { useState, useTransition } from 'react'
import { toggleSavedRecipe } from '@/lib/user-state-actions'

/**
 * Save-to-Make-it-list button for a community (UserRecipe) recipe page.
 * Self-contained inline styling so it sits beside the shopping-list /
 * meal-plan actions without depending on their stylesheet.
 */
export function SaveRecipeButton({
  userRecipeId,
  initialSaved,
}: {
  userRecipeId: string
  initialSaved: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, start] = useTransition()

  function onClick(): void {
    const optimistic = !saved
    setSaved(optimistic)
    start(async () => {
      const res = await toggleSavedRecipe(userRecipeId)
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
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '10px 18px',
        borderRadius: 9999,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        background: saved ? 'var(--color-sage)' : 'transparent',
        color: saved ? 'var(--color-cream)' : 'var(--color-sage)',
        border: '0.5px solid var(--color-sage)',
      }}
    >
      <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
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
