/**
 * Knitting chart renderer — public barrel.
 *
 * Library structure:
 *
 *   apps/web/src/lib/knitting/renderer/
 *     stitch-symbols/         per-symbol SVG path definitions
 *     layout/                 grid-layout, cable-layout, direction-marker
 *     chart-types/            colourwork, lace, cable, brioche
 *     palette/                colourwork + brioche palette resolution
 *     output/                 SVG composer + PNG rasteriser
 *     render-chart.ts         main entry point
 *     verifier.ts             sanity checks
 *     types.ts                public API contract
 *
 * The contract this module exports is locked and shared with K-3 (the
 * Studio surface). K-2 implements it; K-3 builds against it.
 *
 * The renderer never invokes any AI image generation. Every output is
 * pure software composition of authored chart data.
 */

export { renderKnittingChart, renderKnittingChartSvg } from './render-chart'
export { composeChartSvg } from './output/svg-composer'
export { rasteriseSvg } from './output/png-rasteriser'
export { verifyChart } from './verifier'
export {
  getSymbol,
  getSymbolOrUnknown,
  hasSymbol,
  listSymbols,
  UNKNOWN_SYMBOL,
} from './stitch-symbols'
export { layoutColourwork } from './chart-types/colourwork'
export { layoutLace } from './chart-types/lace'
export { layoutCable } from './chart-types/cable'
export { layoutBrioche } from './chart-types/brioche'

export type {
  CableCrossing,
  ChartPaletteEntry,
  ChartReadOrigin,
  KnittingChartData,
  KnittingChartType,
  KnittingConstruction,
  KnittingSymbol,
  RenderOptions,
  RenderedChart,
  VerifyResult,
} from './types'
