'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface PatternPlanButtonProps {
  patternId: string
  craft?: string
  initialInPlan: boolean
  /** False when no one is signed in — tapping routes through sign-in. */
  signedIn: boolean
}

/**
 * Add-to-planner button for the pattern detail page. Adding to the plan is a
 * free signed-in carrot (the premium parts are the materials roll-up and
 * export inside /me/planner), so this only needs sign-in. Anonymous readers
 * are sent to sign-in and returned to the planner.
 */
export function PatternPlanButton({
  patternId,
  craft = 'CROSS_STITCH',
  initialInPlan,
  signedIn,
}: PatternPlanButtonProps) {
  const router = useRouter()
  const [inPlan, setInPlan] = useState(initialInPlan)
  const [pending, start] = useTransition()

  function onClick(): void {
    if (!signedIn) {
      router.push('/sign-in?redirect_url=/me/planner')
      return
    }
    if (inPlan) {
      router.push('/me/planner')
      return
    }
    start(async () => {
      const res = await fetch('/api/studio/planner/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ craft, patternId }),
      })
      // 409 means it's already in the plan — treat as success.
      if (res.ok || res.status === 409) {
        setInPlan(true)
      }
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
