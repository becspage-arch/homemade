'use client'

import { useState } from 'react'
import type { TutorialStatus } from '@homemade/db'

interface StatusControlsProps {
  tutorialId: string
  currentStatus: TutorialStatus
  publishedAt: Date | null
  scheduledFor: Date | null
  transitionAction: (formData: FormData) => Promise<void>
}

const ALLOWED: Record<string, { target: TutorialStatus; label: string }[]> = {
  DRAFT: [
    { target: 'SCHEDULED' as TutorialStatus, label: 'schedule publish' },
    { target: 'PUBLISHED' as TutorialStatus, label: 'publish now' },
  ],
  IN_REVIEW: [
    { target: 'DRAFT' as TutorialStatus, label: 'send back to draft' },
    { target: 'PUBLISHED' as TutorialStatus, label: 'publish now' },
  ],
  SCHEDULED: [
    { target: 'DRAFT' as TutorialStatus, label: 'back to draft' },
    { target: 'PUBLISHED' as TutorialStatus, label: 'publish now' },
  ],
  PUBLISHED: [{ target: 'ARCHIVED' as TutorialStatus, label: 'archive' }],
  ARCHIVED: [{ target: 'DRAFT' as TutorialStatus, label: 'restore to draft' }],
}

export function StatusControls({
  currentStatus,
  publishedAt,
  scheduledFor,
  transitionAction,
}: StatusControlsProps) {
  const [scheduling, setScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState(() => {
    if (scheduledFor) return scheduledFor.toISOString().slice(0, 16)
    const inAWeek = new Date()
    inAWeek.setDate(inAWeek.getDate() + 7)
    return inAWeek.toISOString().slice(0, 16)
  })

  const options = ALLOWED[currentStatus] ?? []

  return (
    <div className="rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-soft-parchment)] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div
            className="text-xs uppercase tracking-[0.3em] text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            Status
          </div>
          <div
            className="mt-1 text-2xl text-[var(--color-espresso)]"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {currentStatus.toLowerCase()}
          </div>
          {publishedAt && (
            <div
              className="mt-1 text-xs text-[var(--color-warm-taupe)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              published {publishedAt.toLocaleDateString('en-GB')}
            </div>
          )}
          {scheduledFor && currentStatus === 'SCHEDULED' && (
            <div
              className="mt-1 text-xs italic text-[var(--color-warm-taupe)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              scheduled for {scheduledFor.toLocaleString('en-GB')}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((opt) => {
          if (opt.target === 'SCHEDULED') {
            return (
              <button
                key={opt.target}
                type="button"
                onClick={() => setScheduling(true)}
                className="border border-[var(--color-sage)] px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:bg-[var(--color-sage)] hover:text-[var(--color-linen-cream)]"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                {opt.label}
              </button>
            )
          }
          return (
            <form action={transitionAction} key={opt.target}>
              <input type="hidden" name="target" value={opt.target} />
              <button
                type="submit"
                className="border border-[var(--color-sage)] px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:bg-[var(--color-sage)] hover:text-[var(--color-linen-cream)]"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                {opt.label}
              </button>
            </form>
          )
        })}
      </div>

      {scheduling && (
        <form action={transitionAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="target" value="SCHEDULED" />
          <label className="block">
            <span
              className="block text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              Publish at
            </span>
            <input
              type="datetime-local"
              name="scheduledFor"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              required
              className="border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-1 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            />
          </label>
          <button
            type="submit"
            className="bg-[var(--color-sage)] px-4 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            confirm schedule
          </button>
          <button
            type="button"
            onClick={() => setScheduling(false)}
            className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-burnt-sienna)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            cancel
          </button>
        </form>
      )}
    </div>
  )
}
