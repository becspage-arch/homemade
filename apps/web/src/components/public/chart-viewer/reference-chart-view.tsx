'use client'

import type { ReactNode } from 'react'

import { ChartViewerShell } from './chart-viewer-shell'

interface ReferenceChartViewProps {
  /** Pre-rendered chart content (React tree). */
  children: ReactNode
  /** Accessible name announced for the chart. */
  ariaLabel?: string
}

/**
 * Wraps a non-mark-stitch chart renderer (calligraphy exemplar, macramé
 * knot, weaving draft, knit/crochet craft chart, origami fold) with the
 * shared zoom + pan + fullscreen + dark-mode shell. Reference-mode only;
 * no per-cell / per-row / per-step interactivity.
 *
 * Knit / crochet / weaving / origami get per-row / per-step marking in a
 * later iteration. For v1 they share this thin wrapper so they at least
 * get the universal interaction layer.
 */
export function ReferenceChartView({ children, ariaLabel }: ReferenceChartViewProps) {
  return (
    <ChartViewerShell ariaLabel={ariaLabel}>
      <div className="reference-chart-view__inner">{children}</div>
    </ChartViewerShell>
  )
}
