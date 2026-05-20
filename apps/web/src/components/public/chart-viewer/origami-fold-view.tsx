'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { OrigamiFoldBasic } from '@/lib/chart-renderers/origami-fold-basic'
import type { OrigamiFoldDefinition } from '@/lib/chart-renderers/types'
import { ChartViewerShell } from './chart-viewer-shell'
import { useTimeTracker } from './use-time-tracker'

interface OrigamiFoldViewProps {
  definition: OrigamiFoldDefinition
  tutorialId: string
  chartIndex: number
}

/**
 * Interactive origami fold-diagram view. Wraps the existing
 * `OrigamiFoldBasic` server renderer in the shared zoom/pan/fullscreen
 * shell, and adds per-step marking with progress sync via the
 * chart-progress API.
 *
 * Per-step marking: each step gets a "Mark done" toggle in the
 * step-list panel below the chart. Completed steps fade in the legend
 * list (and a tick appears). The current step (the lowest unmarked
 * step) is highlighted.
 *
 * Progress sync uses the same /api/me/chart-progress endpoint as the
 * cross-stitch viewer, but writes the `markedSteps` array (1-indexed)
 * instead of `markedCells`.
 */
export function OrigamiFoldView({
  definition,
  tutorialId,
  chartIndex,
}: OrigamiFoldViewProps) {
  const [markedSteps, setMarkedSteps] = useState<Set<number>>(new Set())
  const [loaded, setLoaded] = useState(false)
  useTimeTracker(tutorialId, chartIndex, loaded)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/me/chart-progress/${tutorialId}/${chartIndex}`)
        if (!res.ok) return
        const data = (await res.json()) as { markedSteps?: number[] }
        if (cancelled) return
        setMarkedSteps(new Set(Array.isArray(data.markedSteps) ? data.markedSteps : []))
      } catch {
        // Silent — fresh chart.
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tutorialId, chartIndex])

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!loaded) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      void fetch(`/api/me/chart-progress/${tutorialId}/${chartIndex}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          markedSteps: Array.from(markedSteps).sort((a, b) => a - b),
        }),
      }).catch(() => {})
    }, 400)
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [markedSteps, loaded, tutorialId, chartIndex])

  const toggleStep = useCallback((stepNumber: number) => {
    setMarkedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepNumber)) next.delete(stepNumber)
      else next.add(stepNumber)
      return next
    })
  }, [])

  const totalSteps = definition.steps.length
  const completedCount = markedSteps.size
  const currentStep = definition.steps.find((s) => !markedSteps.has(s.stepNumber))?.stepNumber ?? null

  const toolbar = (
    <span className="cross-stitch-status">
      Step {currentStep ?? totalSteps} of {totalSteps} · {completedCount} done
    </span>
  )

  const legend = (
    <ol className="origami-step-list">
      {definition.steps.map((step) => {
        const isMarked = markedSteps.has(step.stepNumber)
        const isCurrent = step.stepNumber === currentStep
        return (
          <li
            key={step.stepNumber}
            className={[
              'origami-step-list__item',
              isMarked ? 'origami-step-list__item--marked' : '',
              isCurrent ? 'origami-step-list__item--current' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              type="button"
              className="origami-step-list__toggle"
              aria-pressed={isMarked}
              onClick={() => toggleStep(step.stepNumber)}
            >
              <span className="origami-step-list__check" aria-hidden="true">
                {isMarked ? '✓' : ''}
              </span>
              <span className="origami-step-list__label">
                Step {step.stepNumber}
                {step.caption ? ` — ${step.caption}` : ''}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )

  return (
    <ChartViewerShell
      toolbar={toolbar}
      legend={legend}
      ariaLabel={definition.title ?? 'Origami fold diagram'}
      className="chart-viewer-shell--origami"
    >
      <OrigamiFoldBasic definition={definition} />
    </ChartViewerShell>
  )
}
