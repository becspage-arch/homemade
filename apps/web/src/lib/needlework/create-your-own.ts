import 'server-only'
import sharp from 'sharp'

import { bitmapToStitches } from './illustration-engine'
import { buildPatternDocument, type PatternDocument } from './engine/document'
import {
  toStoredVectorData,
  type NeedleworkSurfacePattern,
  type StoredNeedleworkVectorData,
  type NeedleworkRegionAnnotation,
} from './pattern'

/**
 * Customer create-your-own — the NEEDLEWORK converter.
 *
 * The premium "describe an idea / upload a photo → your own thread-painting
 * pattern" feature runs the SAME rigorous engine as our bulk catalogue routine
 * (apps/web/scripts/needlework-paint.ts): an approved illustration/photo goes
 * through `bitmapToStitches` (the reusable pure core — directional long-and-short
 * field, per-stitch DMC) → `buildPatternDocument` (the printable document:
 * registered outline, dense colour/stitch map, floss key, stitch key, steps) →
 * `toStoredVectorData` (the canonical stored shape the Studio + the loom render
 * read). Only the CALLER differs: Flux/an upload here, Flux for the bulk routine.
 *
 * This is the front half. The loom hero render (`renderHero`, on Fargate) is the
 * back half; it runs asynchronously off the saved pattern (see the
 * `needlework/hero.render` Inngest job) so the customer isn't held for the
 * minutes a photoreal render takes — their full, stitchable document is ready
 * the instant this returns.
 */

/** The warm even-weave linen the loom + catalogue use. Shared with the render. */
export const NEEDLEWORK_FABRIC_HEX = '#ece4d2'

export interface NeedleworkCreateSettings {
  /** Finished width in mm (height follows the framed aspect). */
  widthMm: number
  /** round → wooden hoop; rect → the design's aspect; none → frameless. */
  frame: 'round' | 'rect' | 'none'
  /** Denser stitching — better for detailed subjects + faces. */
  detail: boolean
  /** Stitch the WHOLE image (a full scene with no plain ground to remove). */
  fullScene: boolean
}

export const DEFAULT_NEEDLEWORK_CREATE_SETTINGS: NeedleworkCreateSettings = {
  widthMm: 200,
  frame: 'round',
  detail: true,
  fullScene: false,
}

export interface NeedleworkConversion {
  canonical: NeedleworkSurfacePattern
  document: PatternDocument
  vectorData: StoredNeedleworkVectorData
  regionAnnotations: NeedleworkRegionAnnotation[]
  /** 'HOOP' | 'SLATE_FRAME' | 'NONE' — the engine's frame decision. */
  frameType: string
  finishedSizeMm: { width: number; height: number }
  colourCount: number
  stitchCount: number
}

/**
 * Turn an approved image (Flux illustration or an uploaded photo) into a full
 * surface-embroidery pattern — the exact same chain the catalogue routine runs,
 * lifted out of the script so the customer feature and the bulk build share ONE
 * converter rather than two.
 */
export async function convertImageToNeedleworkPattern(
  imageBytes: Buffer,
  name: string,
  settings: NeedleworkCreateSettings,
): Promise<NeedleworkConversion> {
  // Same working resolution + raw-RGB extraction as needlework-paint.ts run().
  const WORK = 460
  const { data, info } = await sharp(imageBytes)
    .resize(WORK, WORK, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { stitchedElements, frameType, finishedSizeMm, outline } = bitmapToStitches(
    data,
    info.width,
    info.height,
    {
      mode: 'dense',
      frame: settings.frame,
      bleed: settings.fullScene,
      detail: settings.detail,
      widthMm: settings.widthMm,
    },
  )

  const canonical: NeedleworkSurfacePattern = {
    stitchedElements,
    finishedSizeMm,
    fabricSpec: { material: 'linen', colourHex: NEEDLEWORK_FABRIC_HEX, count: null },
    defaultThread: { type: 'stranded-cotton', weight: '3-strand' },
    frameType,
    outline,
  }
  const document = buildPatternDocument(stitchedElements, finishedSizeMm, { title: name, outline })
  const { vectorData, regionAnnotations } = toStoredVectorData(canonical, { document })

  return {
    canonical,
    document,
    vectorData,
    regionAnnotations,
    frameType,
    finishedSizeMm,
    colourCount: document.flossKey.length,
    stitchCount: stitchedElements.length,
  }
}
