// SPDX-License-Identifier: MIT
// Wrapper-side types for the freesewing grading layer. These are the
// Homemade-facing shapes; freesewing's internal types are deliberately
// not re-exported across this boundary. Engine swap stays a one-file
// change because Studio + API + content authoring only see these.

export type CalibrationMode = 'PRINT' | 'PROJECTOR' | 'BROWSE'

export type GenderFamily = 'WOMENS' | 'MENS' | 'UNISEX' | 'KIDS' | 'BABIES'

export type SewingSkillLevelTier =
  | 'ABSOLUTE_BEGINNER'
  | 'BEGINNER'
  | 'IMPROVER'
  | 'CONFIDENT_BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT'

/**
 * Per-design option metadata. Mirrors freesewing's documented option
 * shape (https://freesewing.dev/reference/api/option) but narrowed to
 * the subset the personalisation Studio needs to render controls:
 *
 *   - `pct`  : percentage slider (stored as a fraction; min/max in pct)
 *   - `mm`   : millimetre slider
 *   - `bool` : toggle
 *   - `enum` : dropdown of named options
 *
 * Freesewing's engine accepts options as a Record<string, primitive>; we
 * pass the raw value through unchanged. The renderer reads `type` to
 * pick the control, the freesewing pattern reads the value to draft.
 */
export type SewingDesignOptionMeta =
  | {
      type: 'pct'
      label: string
      description?: string
      /** Default expressed as a percentage (e.g. 4 for "4%"). */
      default: number
      min: number
      max: number
      step?: number
    }
  | {
      type: 'mm'
      label: string
      description?: string
      /** Default in millimetres. */
      default: number
      min: number
      max: number
      step?: number
    }
  | {
      type: 'bool'
      label: string
      description?: string
      default: boolean
    }
  | {
      type: 'enum'
      label: string
      description?: string
      default: string
      values: { value: string; label: string }[]
    }

export interface SewingDesignConfig {
  /** Stable slug. Used everywhere outside the wrapper. */
  slug: string
  /** Display name shown in catalogue listings + Studio. */
  name: string
  /** One-paragraph blurb shown on the design picker card. */
  description?: string
  /** npm package the design lives in. Recorded on SewingPattern rows. */
  freesewingPackage: string
  /** Lazy import returning the freesewing module namespace. */
  importer: () => Promise<Record<string, unknown>>
  /** Exported constructor name on the design package (e.g. 'Bella'). */
  designExportName: string
  /** Demographic axis. */
  genderFamily: GenderFamily
  /** Sewing-side skill ladder. */
  skillLevel: SewingSkillLevelTier
  /** Freesewing measurement keys this design needs. */
  requiredMeasurements: string[]
  /** Freesewing measurement keys this design can use if present. */
  optionalMeasurements: string[]
  /** Per-design ease tolerance for verifier output (default 0.05). */
  verifyTolerance?: number
  /**
   * Surfaceable design options. The renderer walks this map in entry
   * order so authors control which option appears first in the panel.
   * Keys match freesewing's option names exactly so the wrapper can
   * forward without translation.
   */
  options?: Record<string, SewingDesignOptionMeta>
}

export interface DrafterOptions {
  /** Per-design freesewing options keyed by option name. */
  designOptions?: Record<string, number | string | boolean>
  /** Override seam allowance in cm. Freesewing default is 1 cm. */
  seamAllowanceCm?: number
  /** Override locale for measurement labels in the drawn SVG. */
  locale?: string
}

export interface DrafterPartMeta {
  name: string
  /** Bounding-box width in mm as freesewing reports it. */
  widthMm: number
  /** Bounding-box height in mm. */
  heightMm: number
}

export interface DrafterOutput {
  /** Rendered SVG as a string. Tile / projector overlays are applied. */
  svg: string
  /** Per-part bounding box list for the tiler + browse renderer. */
  partList: DrafterPartMeta[]
  /** Deterministic SHA-256 of (designSlug, measurements, options, mode). */
  cacheKey: string
  /**
   * Voice-checked footer credit string. Empty on PROJECTOR mode by the
   * locked attribution rule.
   */
  attribution: string
  /** Engine version pulled from @freesewing/core's package.json. */
  freesewingVersion: string
  /** Calibration mode this output was rendered for. */
  calibrationMode: CalibrationMode
}

export interface VerificationResult {
  ok: boolean
  issues: string[]
}
