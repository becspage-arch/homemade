'use client'

import { useState, useTransition } from 'react'
import {
  setBookmarkPublic,
  toggleBookmark,
} from '@/lib/user-state-actions'

interface BookmarkControlsProps {
  bookmarkId: string
  tutorialId: string
  initialIsPublic: boolean
}

/**
 * In-context bookmark controls on /me/bookmarks. Sits over each card as a
 * small affordance — public-on-profile toggle + remove. The card itself
 * remains the primary tap target.
 */
export function BookmarkControls({
  bookmarkId,
  tutorialId,
  initialIsPublic,
}: BookmarkControlsProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [pendingPublic, startPublic] = useTransition()
  const [pendingRemove, startRemove] = useTransition()

  function togglePublic(e: React.MouseEvent | React.ChangeEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = !isPublic
    setIsPublic(next)
    startPublic(async () => {
      const res = await setBookmarkPublic({ bookmarkId, isPublic: next })
      if (!res.ok) setIsPublic(!next)
    })
  }

  function remove(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    startRemove(async () => {
      await toggleBookmark(tutorialId)
    })
  }

  const disabled = pendingPublic || pendingRemove

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        onClick={togglePublic}
        disabled={disabled}
        aria-pressed={isPublic}
        aria-label={
          isPublic
            ? 'Hide from public Maker profile'
            : 'Show on public Maker profile'
        }
        style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: 999,
          border: '0.5px solid var(--color-warm-taupe)',
          background: isPublic
            ? 'var(--color-sage)'
            : 'rgba(255, 252, 245, 0.92)',
          color: isPublic ? 'var(--color-cream)' : 'var(--color-warm-taupe)',
          cursor: disabled ? 'wait' : 'pointer',
          pointerEvents: 'auto',
        }}
      >
        {pendingPublic ? '…' : isPublic ? 'Public' : 'Private'}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={disabled}
        aria-label="Remove from Make it list"
        style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: 999,
          border: '0.5px solid var(--color-warm-taupe)',
          background: 'rgba(255, 252, 245, 0.92)',
          color: 'var(--color-warm-taupe)',
          cursor: disabled ? 'wait' : 'pointer',
          pointerEvents: 'auto',
        }}
      >
        {pendingRemove ? '…' : 'Remove'}
      </button>
    </div>
  )
}
