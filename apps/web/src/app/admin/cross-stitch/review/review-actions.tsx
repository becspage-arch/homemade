'use client'

import { useTransition } from 'react'
import { publishReviewPattern, discardReviewPattern } from './actions'

/** Publish / Discard buttons for a cross-stitch REVIEW-queue row. */
export function ReviewActions({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <div className="cross-stitch-review-actions">
      <button
        type="button"
        className="admin-btn approve"
        disabled={pending}
        onClick={() => start(async () => { await publishReviewPattern(id) })}
      >
        Publish
      </button>
      <button
        type="button"
        className="admin-btn dismiss"
        disabled={pending}
        onClick={() => start(async () => { await discardReviewPattern(id) })}
      >
        Discard
      </button>
    </div>
  )
}
