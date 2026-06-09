/**
 * Client-safe entry into the knitting chart renderer. Mirrors
 * `renderKnittingChartSvg` from `./render-chart.ts` but avoids
 * importing the PNG rasteriser, which pulls in `sharp` — a Node
 * native module that breaks the client bundle.
 *
 * Public-facing surfaces (KnittingChartViewport, KnittingChartInset,
 * the print page chart inset) call into this module. Server-side
 * code that needs PNG output keeps using `./index.ts` /
 * `./render-chart.ts`.
 */

import { layoutBrioche } from './chart-types/brioche'
import { layoutCable } from './chart-types/cable'
import { layoutColourwork } from './chart-types/colourwork'
import { layoutLace } from './chart-types/lace'
import type { ChartLayout } from './chart-types/shared'
import { composeChartSvg } from './output/svg-composer'
import type { KnittingChartData, RenderOptions } from './types'
import { verifyChart } from './verifier'

function layoutFor(data: KnittingChartData): ChartLayout {
  switch (data.type) {
    case 'COLOURWORK':
      return layoutColourwork(data)
    case 'LACE':
      return layoutLace(data)
    case 'CABLE':
      return layoutCable(data)
    case 'BRIOCHE':
      return layoutBrioche(data)
  }
}

export function renderKnittingChartSvg(
  data: KnittingChartData,
  options: Omit<RenderOptions, 'outputFormat' | 'pixelWidth' | 'pixelHeight'> = {},
): { svg: string; width: number; height: number; warnings: string[] } {
  const layout = layoutFor(data)
  const composed = composeChartSvg(layout, {
    cellPx: options.cellPx,
    showRowNumbers: options.showRowNumbers,
    showStitchCount: options.showStitchCount,
    showChartKey: options.showChartKey,
    theme: options.theme,
    title: data.metadata?.title,
  })
  const verdict = verifyChart({ data, layout, svgLength: composed.svg.length })
  return {
    svg: composed.svg,
    width: composed.width,
    height: composed.height,
    warnings: verdict.warnings,
  }
}

export type { KnittingChartData, KnittingChartType, RenderOptions } from './types'
