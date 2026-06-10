/**
 * Client-safe barrel for the crochet renderer. Excludes `rasterise` and
 * `renderSwatchToPng` which import `sharp` (a Node native module). Any
 * client-side surface that needs the SVG renderer imports from here.
 * Server-side scripts that need PNG output keep using `./index.ts`.
 */

export { renderPattern } from './render-pattern'
export type { RenderResult } from './render-pattern'
export { renderSwatch } from './render-swatch'
export type { SwatchOptions, SwatchResult } from './render-swatch'
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
