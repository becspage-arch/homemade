'use client'

/**
 * CrochetChartView — the chart-view variant of the active project. Wraps
 * the existing CraftChart SVG renderer (used by chart-bearing tutorial
 * bodies) and overlays the same row counter the written view drives. So
 * marking Round 1 from the chart marks the corresponding section in the
 * written view too — they share the same `completedRows` map keyed by
 * (section, rowNumber).
 *
 * Left-handed mode mirrors the rendered chart horizontally without
 * touching the underlying definition.
 */

import { useMemo } from 'react'

import { CraftChart } from '@/lib/craft-charts/svg-chart'
import type { ChartDefinition } from '@/lib/craft-charts/types'
import type { TerminologyMode } from './types'

interface Props {
  chartData: unknown
  terminology: TerminologyMode
  leftHanded: boolean
  completedRows: Record<string, number[]>
  currentSection: string | null
  onMarkComplete: (section: string, rowNumber: number) => void
  onUnmark: (section: string, rowNumber: number) => void
}

const CHART_SECTION = 'Chart'

export function CrochetChartView({
  chartData,
  terminology,
  leftHanded,
  completedRows,
  currentSection: _currentSection,
  onMarkComplete,
  onUnmark,
}: Props) {
  const definition = useMemo<ChartDefinition | null>(() => {
    if (!chartData || typeof chartData !== 'object') return null
    const candidate = chartData as ChartDefinition
    if (!candidate.layout || !candidate.craft) return null
    // Apply the terminology toggle without mutating the original.
    return { ...candidate, terminologyConvention: terminology }
  }, [chartData, terminology])

  const orderedRows = useMemo(() => {
    if (!definition) return []
    if (definition.layout === 'round') {
      return (definition.rounds ?? []).map((r) => ({
        rowNumber: r.roundNumber,
        label: r.label ?? `Rnd ${r.roundNumber}`,
      }))
    }
    return (definition.rows ?? []).map((r) => ({
      rowNumber: r.rowNumber,
      label: r.label ?? `Row ${r.rowNumber}`,
    }))
  }, [definition])

  if (!definition) {
    return (
      <div className="crochet-studio-chart-empty">
        <p>This pattern does not carry a chart. Switch back to the Written view.</p>
      </div>
    )
  }

  const completed = new Set(completedRows[CHART_SECTION] ?? [])
  const currentRowNumber = orderedRows.find((r) => !completed.has(r.rowNumber))?.rowNumber ?? null
  const layoutLabel = definition.layout === 'round' ? 'Round' : 'Row'

  return (
    <div className={`crochet-studio-chart${leftHanded ? ' is-left-handed' : ''}`}>
      <div className="crochet-studio-chart-svg">
        <CraftChart definition={definition} />
      </div>
      <div className="crochet-studio-chart-rows" role="group" aria-label="Rounds">
        <p className="crochet-studio-chart-status">
          {layoutLabel} {currentRowNumber ?? orderedRows.length} of {orderedRows.length} ·{' '}
          {completed.size} done
        </p>
        <ul className="crochet-studio-chart-row-list">
          {orderedRows.map((row) => {
            const isComplete = completed.has(row.rowNumber)
            const isCurrent = row.rowNumber === currentRowNumber
            return (
              <li key={row.rowNumber}>
                <button
                  type="button"
                  aria-pressed={isComplete}
                  className={[
                    'crochet-studio-chart-row',
                    isComplete ? 'is-complete' : '',
                    isCurrent ? 'is-current' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() =>
                    isComplete
                      ? onUnmark(CHART_SECTION, row.rowNumber)
                      : onMarkComplete(CHART_SECTION, row.rowNumber)
                  }
                >
                  {row.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
