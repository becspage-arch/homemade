/**
 * Barrel module. Public entry points for the crochet finished-piece
 * renderer.
 *
 * Library structure:
 *
 *   apps/web/src/lib/crochet/renderer/
 *     stitch-shapes/          per-stitch SVG path definitions
 *     layout/                 round + row + motif (square/hexagon) layout engines
 *     palette/                colour application + defaults
 *     output/                 SVG composer + PNG rasteriser
 *     render-pattern.ts       main entry point (chartData → SVG + verdict)
 *     render-swatch.ts        small-swatch render for stitch master-table previews
 *     verifier.ts             sanity checks on a rendered chart
 *     types.ts                shared types
 *
 * Author-side note: chartData is populated by author prompts at write
 * time. The renderer is the only thing that turns chartData into a hero
 * image; no AI image generation is involved. The same library powers:
 *   - hero / thumbnail Media rows for CrochetPattern motifs
 *   - swatch previews for Stitch rows that Pipeline C couldn't fully
 *     describe via chartSymbol alone (joining methods, specialty stitches)
 */

export { renderPattern } from './render-pattern'
export type { RenderResult } from './render-pattern'
export { renderSwatch, renderSwatchToPng } from './render-swatch'
export type { SwatchOptions, SwatchResult } from './render-swatch'
export { rasterise } from './output/png-rasteriser'
export { composeSvg } from './output/svg-composer'
export {
  defaultPalette,
  singleColourPalette,
  shiftColour,
} from './palette/apply-colours'
export {
  getStitchShape,
  listStitchShapes,
  hasStitchShape,
  UNKNOWN_STITCH,
} from './stitch-shapes'
export { verify } from './verifier'
export type {
  StitchShape,
  StitchPlacement,
  LayoutResult,
  MotifShape,
  RendererPalette,
  RenderOptions,
  VerifyResult,
} from './types'
