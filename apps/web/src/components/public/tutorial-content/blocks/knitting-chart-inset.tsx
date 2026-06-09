/**
 * KnittingChartInset — the in-tutorial block that embeds a knitting
 * chart. Mirrors PatternInset's shape; the chart renders server-side
 * via K-2's `renderKnittingChartSvg` so the public bundle never
 * pulls in the renderer's runtime cost (charts are static for any
 * given tutorial).
 *
 * The tutorial body's TipTap `knittingChartInset` block carries a
 * K-2 `KnittingChartData` JSON. The renderer drops the chart inline
 * with a calm caption and an optional "Open in Studio" link when a
 * sibling KnittingPattern row sources the same chart.
 */

import Link from 'next/link'

import { renderKnittingChartSvg } from '@/lib/knitting/renderer'
import type { KnittingChartData } from '@/lib/knitting/renderer/types'

interface KnittingChartInsetProps {
  /** Title shown above the chart ("Cable pattern A"). */
  title?: string
  /** Caption shown beneath the chart ("Repeat rows 1-8 four times"). */
  caption?: string
  /** Chart data — the K-2 `KnittingChartData` shape. */
  data: KnittingChartData
  /** Optional Studio link when a pattern row sources this chart. */
  studioPatternSlug?: string | null
}

export function KnittingChartInset({
  title,
  caption,
  data,
  studioPatternSlug,
}: KnittingChartInsetProps) {
  const rendered = renderKnittingChartSvg(data, {
    showChartKey: true,
    showRowNumbers: true,
    showStitchCount: true,
  })

  return (
    <aside className="knitting-chart-inset" aria-label={title ?? 'Knitting chart'}>
      {title && <h3 className="knitting-chart-inset-title">{title}</h3>}
      <div
        className="knitting-chart-inset-body"
        dangerouslySetInnerHTML={{ __html: rendered.svg }}
      />
      {caption && <p className="knitting-chart-inset-caption">{caption}</p>}
      {studioPatternSlug && (
        <div className="knitting-chart-inset-actions">
          <Link
            href={`/studio/knitting?knittingPatternSlug=${encodeURIComponent(studioPatternSlug)}`}
            className="knitting-chart-inset-cta"
          >
            Follow this pattern in the Studio
          </Link>
        </div>
      )}
    </aside>
  )
}
