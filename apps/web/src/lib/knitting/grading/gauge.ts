// Knit fabric gauge handling.
//
// Knitting grades differently from crochet because the working fabric
// varies more by structure. A 4 mm-needle stockinette pulls in less
// than the same yarn on the same needles in a 2x2 rib, and a cabled
// panel pulls in more than either. Garments worked entirely in one
// stitch pattern need a single gauge number; garments that change
// stitch pattern across sections (ribbed cuff, stockinette body,
// cabled yoke) need section-specific adjustments.
//
// `Gauge` is the stitches/rows per 10 cm in the dominant fabric of
// the garment. `DominantFabric` flags how that fabric typically behaves
// so the construction-shape modules can adjust hem allowances and
// ribbed-edge stitch counts.

export interface Gauge {
  /** Stitches over a 10 cm horizontal swatch. */
  stitchesPer10cm: number
  /** Rows over a 10 cm vertical swatch. */
  rowsPer10cm: number
}

export type DominantFabric =
  | 'STOCKINETTE'
  | 'GARTER'
  | 'RIB_1X1'
  | 'RIB_2X2'
  | 'CABLE'
  | 'LACE'
  | 'BRIOCHE'
  | 'COLOURWORK_STRANDED'

export interface FabricAdjustments {
  /**
   * Multiplier on body stitch count beyond what the dominant-fabric
   * swatch gauge suggests. 1.0 = trust the swatch (the standard case
   * for stockinette, ribbing, lace, colourwork — the swatch is the
   * truth). Greater than 1 covers fabrics where flat swatches under-
   * report the in-garment pull-in: cables and brioche.
   */
  bodyStitchMultiplier: number
  /**
   * Multiplier on ribbed hem stitch count relative to body stitch count.
   * Most stockinette garments use 0.9 (snug hem); brioche which has its
   * own elasticity uses 1.0.
   */
  hemStitchMultiplier: number
  /**
   * Multiplier on yarn requirement for the same surface area. Stranded
   * colourwork carries floats behind the work so a colourwork yoke
   * uses ~1.7× the yarn of a plain stockinette yoke of the same
   * dimensions. Brioche carries two yarns through every stitch so
   * uses ~2.0×. Cables pull in and carry a touch more yarn per cm of
   * fabric: ~1.15×. Stockinette is the baseline.
   */
  yarnMultiplier: number
  /**
   * Suggested swatch size in cm. Default 15; cables 20 to capture the
   * pull-in across the full repeat. Surfaced to the author prompt's
   * recommendedSwatchSizeCm.
   */
  recommendedSwatchSizeCm: number
}

export const FABRIC_ADJUSTMENTS: Record<DominantFabric, FabricAdjustments> = {
  STOCKINETTE: { bodyStitchMultiplier: 1.0, hemStitchMultiplier: 0.9, yarnMultiplier: 1.0, recommendedSwatchSizeCm: 15 },
  GARTER: { bodyStitchMultiplier: 1.0, hemStitchMultiplier: 0.95, yarnMultiplier: 1.0, recommendedSwatchSizeCm: 15 },
  RIB_1X1: { bodyStitchMultiplier: 1.0, hemStitchMultiplier: 1.0, yarnMultiplier: 1.0, recommendedSwatchSizeCm: 15 },
  RIB_2X2: { bodyStitchMultiplier: 1.0, hemStitchMultiplier: 1.0, yarnMultiplier: 1.0, recommendedSwatchSizeCm: 15 },
  CABLE: { bodyStitchMultiplier: 1.20, hemStitchMultiplier: 0.85, yarnMultiplier: 1.15, recommendedSwatchSizeCm: 20 },
  LACE: { bodyStitchMultiplier: 1.0, hemStitchMultiplier: 0.95, yarnMultiplier: 1.0, recommendedSwatchSizeCm: 15 },
  BRIOCHE: { bodyStitchMultiplier: 1.30, hemStitchMultiplier: 1.0, yarnMultiplier: 2.0, recommendedSwatchSizeCm: 15 },
  COLOURWORK_STRANDED: { bodyStitchMultiplier: 1.0, hemStitchMultiplier: 0.9, yarnMultiplier: 1.7, recommendedSwatchSizeCm: 15 },
}

export function fabricAdjustmentsFor(fabric: DominantFabric): FabricAdjustments {
  return FABRIC_ADJUSTMENTS[fabric]
}

/**
 * Standard CYC needle ranges by yarn weight category. Used by the
 * needle-yarn-weight-mismatch QC rule + the author prompt's needle
 * suggestion.
 */
export interface NeedleRange {
  /** Minimum needle size in mm. */
  minMm: number
  /** Maximum needle size in mm. */
  maxMm: number
}

export const NEEDLE_RANGE_BY_WEIGHT: Record<number, NeedleRange> = {
  0: { minMm: 1.5, maxMm: 2.25 },
  1: { minMm: 2.25, maxMm: 3.25 },
  2: { minMm: 3.25, maxMm: 3.75 },
  3: { minMm: 3.75, maxMm: 4.5 },
  4: { minMm: 4.5, maxMm: 5.5 },
  5: { minMm: 5.5, maxMm: 8.0 },
  6: { minMm: 8.0, maxMm: 12.75 },
  7: { minMm: 12.75, maxMm: 25.0 },
}

/**
 * Standard CYC gauge ranges (stitches per 10 cm in stockinette) by
 * yarn weight category. Used by the gauge-out-of-range QC rule.
 */
export interface GaugeRange {
  stitchMin: number
  stitchMax: number
}

export const GAUGE_RANGE_BY_WEIGHT: Record<number, GaugeRange> = {
  0: { stitchMin: 32, stitchMax: 44 },
  1: { stitchMin: 26, stitchMax: 36 },
  2: { stitchMin: 22, stitchMax: 28 },
  3: { stitchMin: 20, stitchMax: 24 },
  4: { stitchMin: 16, stitchMax: 22 },
  5: { stitchMin: 12, stitchMax: 16 },
  6: { stitchMin: 7, stitchMax: 11 },
  7: { stitchMin: 5, stitchMax: 8 },
}

export function needleRangeFor(weightCategory: number): NeedleRange | null {
  return NEEDLE_RANGE_BY_WEIGHT[weightCategory] ?? null
}

export function gaugeRangeFor(weightCategory: number): GaugeRange | null {
  return GAUGE_RANGE_BY_WEIGHT[weightCategory] ?? null
}
