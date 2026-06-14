import type { StitchShape } from '../types'

/**
 * Knitting stitch faces + a couple of extra crochet stitches the chart
 * engine was missing. The finished-piece renderer shares one stitch-shape
 * registry across crafts (the chart engine renders both crochet and
 * knitting `chartDefinition`s), so knitting's knit / purl / yarn-over /
 * decrease faces live here alongside crochet.
 *
 * Drawn in unit space: base at (0, 0), top at (0, -heightUnits), width
 * spanning roughly x = [-0.5, +0.5].
 */

/** Knit stitch — the stockinette "V" face. */
export const KNIT: StitchShape = {
  key: 'knit',
  label: 'knit',
  heightUnits: 1,
  widthUnits: 1,
  path: 'M -0.40 -0.92 L 0 -0.20 L 0.40 -0.92',
  flavour: 'stroke',
}

/** Purl stitch — the horizontal bump. */
export const PURL: StitchShape = {
  key: 'purl',
  label: 'purl',
  heightUnits: 1,
  widthUnits: 1,
  path: 'M -0.38 -0.42 Q 0 -0.86 0.38 -0.42',
  flavour: 'stroke',
}

/** Yarn over — an eyelet / hole. */
export const YARN_OVER: StitchShape = {
  key: 'yarn-over',
  label: 'yarn over',
  heightUnits: 1,
  widthUnits: 1,
  path: 'M -0.30 -0.50 A 0.30 0.30 0 1 1 0.30 -0.50 A 0.30 0.30 0 1 1 -0.30 -0.50 Z',
  flavour: 'stroke',
}

/** Knit two together — right-leaning decrease. */
export const K2TOG: StitchShape = {
  key: 'k2tog',
  label: 'k2tog',
  heightUnits: 1,
  widthUnits: 1,
  path: 'M -0.36 -0.90 L 0.32 -0.14',
  flavour: 'stroke',
}

/** Slip slip knit — left-leaning decrease. */
export const SSK: StitchShape = {
  key: 'ssk',
  label: 'ssk',
  heightUnits: 1,
  widthUnits: 1,
  path: 'M 0.36 -0.90 L -0.32 -0.14',
  flavour: 'stroke',
}

/** Spike stitch — a long stitch worked down into a lower row. */
export const SPIKE: StitchShape = {
  key: 'spike-stitch',
  label: 'spike stitch',
  heightUnits: 1.9,
  widthUnits: 1,
  path: 'M 0 0 L 0 -1.9',
  flavour: 'stroke',
}

/** Bullion stitch — a tall coiled stitch. */
export const BULLION: StitchShape = {
  key: 'bullion-stitch',
  label: 'bullion stitch',
  heightUnits: 1.8,
  widthUnits: 1,
  path:
    'M 0 0 L 0 -1.7 ' +
    'M -0.17 -0.40 L 0.17 -0.40 ' +
    'M -0.17 -0.80 L 0.17 -0.80 ' +
    'M -0.17 -1.20 L 0.17 -1.20',
  flavour: 'stroke',
}
