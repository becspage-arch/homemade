'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { WeavingDraft } from '@/lib/chart-renderers/weaving-draft'
import type { WeavingDraftDefinition } from '@/lib/chart-renderers/types'
import { ChartViewerShell } from './chart-viewer-shell'
import { useTimeTracker } from './use-time-tracker'

interface WeavingDraftViewProps {
  definition: WeavingDraftDefinition
  tutorialId: string
  chartIndex: number
}

/**
 * Interactive weaving-draft viewer.
 *
 * Wraps the existing `WeavingDraft` server renderer in the shared shell
 * and adds per-pick marking (each entry of `treadling[]` is one pick).
 * Picks are 1-indexed, matching the `markedRows` field's semantics in
 * the chart-progress storage.
 */
export function WeavingDraftView({
  definition,
  tutorialId,
  chartIndex,
}: WeavingDraftViewProps) {
  const totalPicks = definition.treadling.length

  const [markedRows, setMarkedRows] = useState<Set<number>>(new Set())
  const [loaded, setLoaded] = useState(false)
  const [ruleMode, setRuleMode] = useState(false)
  useTimeTracker(tutorialId, chartIndex, loaded)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/me/chart-progress/${tutorialId}/${chartIndex}`)
        if (!res.ok) return
        const data = (await res.json()) as { markedRows?: number[] }
        if (cancelled) return
        setMarkedRows(new Set(Array.isArray(data.markedRows) ? data.markedRows : []))
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
          markedRows: Array.from(markedRows).sort((a, b) => a - b),
        }),
      }).catch(() => {})
    }, 400)
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [markedRows, loaded, tutorialId, chartIndex])

  const togglePick = useCallback((pickNumber: number) => {
    setMarkedRows((prev) => {
      const next = new Set(prev)
      if (next.has(pickNumber)) next.delete(pickNumber)
      else next.add(pickNumber)
      return next
    })
  }, [])

  const currentPick =
    definition.treadling.findIndex((_, i) => !markedRows.has(i + 1)) + 1 || totalPicks
  const completedCount = markedRows.size

  const toolbar = (
    <>
      <span className="cross-stitch-status">
        Pick {currentPick} of {totalPicks} · {completedCount} done
      </span>
      <button
        type="button"
        className="chart-viewer-shell__button"
        aria-pressed={ruleMode}
        onClick={() => setRuleMode((r) => !r)}
        title="Rule mode dims completed picks in the list"
      >
        Rule mode
      </button>
      <a
        href={`/chart-print/${tutorialId}/${chartIndex}?paper=a4`}
        target="_blank"
        rel="noopener noreferrer"
        className="chart-viewer-shell__button"
        title="Open the print preview in a new tab"
      >
        Print
      </a>
    </>
  )

  const legend = (
    <div className="craft-chart-rows">
      <div className="craft-chart-rows__grid">
        {definition.treadling.map((treadle, i) => {
          const pickNumber = i + 1
          const isMarked = markedRows.has(pickNumber)
          const isCurrent = pickNumber === currentPick
          return (
            <button
              type="button"
              key={pickNumber}
              className={[
                'craft-chart-rows__row',
                isCurrent ? 'craft-chart-rows__row--current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                ruleMode && isMarked && !isCurrent
                  ? { opacity: 0.35 }
                  : undefined
              }
              aria-pressed={isMarked}
              onClick={() => togglePick(pickNumber)}
              title={`Pick ${pickNumber} — treadle ${treadle}`}
            >
              {pickNumber} · t{treadle}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <ChartViewerShell
      toolbar={toolbar}
      legend={legend}
      ariaLabel={definition.title ?? 'Weaving draft'}
      className="chart-viewer-shell--weaving"
    >
      <WeavingDraft definition={definition} />
    </ChartViewerShell>
  )
}
