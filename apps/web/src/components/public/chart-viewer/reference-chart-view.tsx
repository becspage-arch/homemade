'use client'

import type { ReactNode } from 'react'

import { ChartViewerShell } from './chart-viewer-shell'

interface ReferenceChartViewProps {
  /** Pre-rendered chart content (React tree). */
  children: ReactNode
  /** Accessible name announced for the chart. */
  ariaLabel?: string
  /** When both are set, a Print button surfaces in the toolbar pointing
   *  at /chart-print/[tutorialId]/[chartIndex]. */
  tutorialId?: string | null
  chartIndex?: number | null
}

/**
 * Wraps a reference-only chart renderer (calligraphy exemplar, macramé
 * knot) with the shared zoom + pan + fullscreen + dark-mode shell. Used
 * by interactive views' preview-mode fallback too.
 *
 * No per-cell / per-row / per-step interactivity — just the universal
 * shell. If a tutorialId + chartIndex pair is passed, a Print button
 * surfaces in the toolbar.
 */
export function ReferenceChartView({
  children,
  ariaLabel,
  tutorialId,
  chartIndex,
}: ReferenceChartViewProps) {
  const canPrint = tutorialId && typeof chartIndex === 'number'
  return (
    <ChartViewerShell
      ariaLabel={ariaLabel}
      toolbar={
        canPrint ? (
          <a
            href={`/chart-print/${tutorialId}/${chartIndex}?paper=a4`}
            target="_blank"
            rel="noopener noreferrer"
            className="chart-viewer-shell__button"
            title="Open the print preview in a new tab"
          >
            Print
          </a>
        ) : null
      }
    >
      <div className="reference-chart-view__inner">{children}</div>
    </ChartViewerShell>
  )
}
