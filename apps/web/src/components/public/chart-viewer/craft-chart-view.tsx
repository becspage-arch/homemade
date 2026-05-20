'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CraftChart } from '@/lib/craft-charts/svg-chart'
import type { ChartDefinition } from '@/lib/craft-charts/types'
import { ChartViewerShell } from './chart-viewer-shell'
import { useTimeTracker } from './use-time-tracker'

interface CraftChartViewProps {
  definition: ChartDefinition
  tutorialId: string
  chartIndex: number
}

/**
 * Interactive knit / crochet chart viewer.
 *
 * Wraps the existing `CraftChart` server renderer in the shared shell
 * (pinch-zoom, pan, fullscreen, dark mode). Adds per-row marking via the
 * shared chart-progress API:
 *
 *   - The chart definition has `rounds[]` (in-the-round) or `rows[]`
 *     (flat). The viewer treats each round / row as a single markable
 *     unit, surfaced as a button below the chart.
 *   - The current row is the lowest unmarked round / row in the chart's
 *     authored order. It's highlighted in the row list and surfaced in
 *     the toolbar status.
 *   - Marking is per-row, not per-cell (knitters work in rows, not
 *     individual stitches, and apps like knitCompanion follow that
 *     convention).
 */
export function CraftChartView({
  definition,
  tutorialId,
  chartIndex,
}: CraftChartViewProps) {
  // Extract the ordered list of rows / rounds the user can mark. The
  // chart-progress storage uses `markedRows` as the numeric key — the
  // same field powers both layouts.
  const orderedRows = useMemo(() => extractRows(definition), [definition])
  const totalRows = orderedRows.length

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

  const toggleRow = useCallback((rowNumber: number) => {
    setMarkedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) next.delete(rowNumber)
      else next.add(rowNumber)
      return next
    })
  }, [])

  const currentRow =
    orderedRows.find((r) => !markedRows.has(r.rowNumber))?.rowNumber ?? null
  const completedCount = markedRows.size
  const layoutLabel = definition.layout === 'round' ? 'Round' : 'Row'

  const toolbar = (
    <>
      <span className="cross-stitch-status">
        {layoutLabel} {currentRow ?? totalRows} of {totalRows} · {completedCount} done
      </span>
      <button
        type="button"
        className="chart-viewer-shell__button"
        aria-pressed={ruleMode}
        onClick={() => setRuleMode((r) => !r)}
        title="Rule mode dims completed rows in the list"
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
        {orderedRows.map((row) => {
          const isMarked = markedRows.has(row.rowNumber)
          const isCurrent = row.rowNumber === currentRow
          return (
            <button
              type="button"
              key={row.rowNumber}
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
              onClick={() => toggleRow(row.rowNumber)}
              title={row.label}
            >
              {row.label}
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
      ariaLabel={definition.title ?? 'Craft chart'}
      className="chart-viewer-shell--craft"
    >
      <CraftChart definition={definition} />
    </ChartViewerShell>
  )
}

function extractRows(definition: ChartDefinition): { rowNumber: number; label: string }[] {
  if (definition.layout === 'round') {
    return (definition.rounds ?? []).map((r) => ({
      rowNumber: r.roundNumber,
      label: r.label ?? `Rnd ${r.roundNumber}`,
    }))
  }
  return (definition.rows ?? []).map((r) => ({
    rowNumber: r.rowNumber,
    label: r.label ?? `Row ${r.rowNumber}${r.rightSide === false ? ' WS' : ''}`,
  }))
}
