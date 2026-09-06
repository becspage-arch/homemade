'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface PatternPlanButtonProps {
  patternId: string
  craft?: string
  initialInPlan: boolean
  /** False when no one is signed in — tapping routes through sign-in. */
  signedIn: boolean
  /** Path of the pattern page, used as the sign-in return address. */
  patternPath: string
  /**
   * True when the page was opened with `?plan=<patternId>`, which is the
   * intent left behind when a signed-out visitor tapped Add to plan. The
   * add is completed automatically, once, on arrival.
   */
  pendingIntent?: boolean
}

/**
 * Add-to-planner button for the pattern detail page. Adding to the plan is a
 * free signed-in carrot (the premium parts are the materials roll-up and
 * export inside /me/planner), so this only needs sign-in.
 *
 * A signed-out tap used to send the visitor to /me/planner after sign-in,
 * where nothing had been added and the pattern was nowhere in sight. It now
 * returns them to the pattern and finishes the add they asked for.
 */
export function PatternPlanButton({
  patternId,
  craft = 'CROSS_STITCH',
  initialInPlan,
  signedIn,
  patternPath,
  pendingIntent = false,
}: PatternPlanButtonProps) {
  const router = useRouter()
  const [inPlan, setInPlan] = useState(initialInPlan)
  const [pending, start] = useTransition()
  // The intent is a one-shot: honoured on arrival, then the query param is
  // stripped so a refresh or a shared link never re-runs it.
  const intentHandled = useRef(false)

  const addToPlan = useCallback(async (): Promise<boolean> => {
    const res = await fetch('/api/studio/planner/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ craft, patternId }),
    })
    // 409 means it's already in the plan — treat as success.
    return res.ok || res.status === 409
  }, [craft, patternId])

  useEffect(() => {
    if (!pendingIntent || !signedIn || intentHandled.current) return
    intentHandled.current = true
    if (inPlan) {
      router.replace(patternPath)
      return
    }
    start(async () => {
      const added = await addToPlan()
      if (added) setInPlan(true)
      router.replace(patternPath)
    })
  }, [pendingIntent, signedIn, inPlan, addToPlan, patternPath, router])

  function onClick(): void {
    if (!signedIn) {
      const returnTo = `${patternPath}?plan=${encodeURIComponent(patternId)}`
      router.push(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`)
      return
    }
    if (inPlan) {
      router.push('/me/planner')
      return
    }
    start(async () => {
      if (await addToPlan()) setInPlan(true)
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`pattern-detail-action ghost${inPlan ? ' is-saved' : ''}`}
      aria-pressed={inPlan}
    >
      {inPlan ? 'In your plan' : 'Add to plan'}
    </button>
  )
}
