'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  confirmMadeFromPrompt,
  dismissDidYouMakeThisPrompt,
} from '@/lib/user-state-actions'
import { captureClientEvent } from '@/lib/client-analytics'

interface DidYouMakeThisPromptProps {
  tutorialId: string
  visitCount: number
}

/**
 * Small inline prompt that fires when a Maker has visited a tutorial 3+
 * times without ever starting a project. Two actions:
 *   - "Yes, I made this" → upserts a UserProject(COMPLETED) and routes
 *     the Maker to /me/projects/{id} so they can add a photo / note.
 *   - "Not yet" → writes a 7-day dismissal entry on the User row.
 *
 * Auto-hides after either action. Fires `did_you_make_this_shown` once
 * per page-load on mount, with the visit count for funnel analysis.
 */
export function DidYouMakeThisPrompt({
  tutorialId,
  visitCount,
}: DidYouMakeThisPromptProps) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [hidden, setHidden] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    captureClientEvent('did_you_make_this_shown', {
      tutorialId,
      visitCount,
    })
  }, [tutorialId, visitCount])

  if (hidden) return null

  function confirm() {
    start(async () => {
      const res = await confirmMadeFromPrompt({ tutorialId })
      if (res.ok && res.projectId) {
        router.push(`/me/projects/${res.projectId}`)
      }
    })
  }

  function dismiss() {
    setHidden(true)
    start(async () => {
      await dismissDidYouMakeThisPrompt({ tutorialId })
    })
  }

  return (
    <aside
      role="region"
      aria-label="Did you make this?"
      style={{
        margin: '16px 0',
        padding: '14px 18px',
        background: 'var(--color-warm-cream, #f6efe6)',
        border: '0.5px solid var(--color-warm-taupe, #b3a48d)',
        borderRadius: 8,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-lora, Lora, serif)',
          fontSize: 15,
          margin: 0,
          flex: '1 1 280px',
        }}
      >
        You&apos;ve been here before. Did you make it?
      </p>
      <button
        type="button"
        onClick={confirm}
        disabled={pending}
        className="reader-action primary"
      >
        Yes, I made this
      </button>
      <button
        type="button"
        onClick={dismiss}
        disabled={pending}
        className="reader-action subtle"
      >
        Not yet
      </button>
    </aside>
  )
}
