/**
 * `renderKnittingChart` — main public entry point.
 *
 * Routes by chart type to the per-type layout module, composes the
 * SVG, optionally rasterises to PNG, and returns the result alongside
 * any warnings the verifier surfaces.
 */

import { layoutBrioche } from './chart-types/brioche'
import { layoutCable } from './chart-types/cable'
import { layoutColourwork } from './chart-types/colourwork'
import { layoutLace } from './chart-types/lace'
import type { ChartLayout } from './chart-types/shared'
import { composeChartSvg } from './output/svg-composer'
import { rasteriseSvg } from './output/png-rasteriser'
import type { KnittingChartData, RenderOptions, RenderedChart } from './types'
import { verifyChart } from './verifier'

export async function renderKnittingChart(
  data: KnittingChartData,
  options: RenderOptions,
): Promise<RenderedChart> {
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

  const wantSvg = options.outputFormat === 'SVG' || options.outputFormat === 'BOTH'
  const wantPng = options.outputFormat === 'PNG' || options.outputFormat === 'BOTH'

  let pngBuffer: Buffer | undefined
  if (wantPng) {
    pngBuffer = await rasteriseSvg(composed.svg, {
      width: options.pixelWidth ?? Math.round(composed.width),
      height: options.pixelHeight ?? Math.round(composed.height),
    })
  }

  return {
    svg: wantSvg ? composed.svg : undefined,
    pngBuffer,
    width: composed.width,
    height: composed.height,
    warnings: verdict.warnings,
  }
}

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

/** Synchronous SVG-only path. Convenient for client renders + tests
 *  where pulling sharp into scope is unnecessary. */
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
