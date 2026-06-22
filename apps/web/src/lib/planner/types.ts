/**
 * Cross-craft planner — the materials-provider seam.
 *
 * The planner core (project queue, stash, roll-up, PDF export) is
 * category-agnostic. Everything craft-specific sits behind this interface:
 * given a pattern reference and the maker's per-craft settings, a provider
 * returns a normalised materials breakdown the core can roll up, diff against
 * the stash, and print. Cross-stitch is the first adapter (floss skeins);
 * crochet / knitting / needlework / sewing implement the same shape later
 * with no change to the core.
 */

import type { PlannerCraft } from '@homemade/db'

export type { PlannerCraft }

/**
 * One material a project needs — a floss colour, a yarn, a thread, a cut of
 * fabric. `key` is the stable identity used both to combine the same material
 * across several queued projects and to match it against a stash item, so two
 * providers must agree on how they build it (cross-stitch uses
 * `${brand}:${code}`, e.g. "DMC:310").
 */
export interface MaterialLine {
  key: string
  brand: string | null
  code: string | null
  name: string
  colourRgb: string | null
  /** How much is needed, in `unit`. Skeins for floss/yarn, metres for fabric. */
  quantityNeeded: number
  unit: string
  /** Short human note shown in the list, e.g. "1,247 stitches". */
  detail: string | null
}

export interface MaterialsBreakdown {
  craft: PlannerCraft
  lines: MaterialLine[]
  /** One calm sentence the planner shows above the list, e.g. a fabric note. */
  summary: string | null
  /** True when the source pattern could not be resolved (deleted / private). */
  unavailable: boolean
}

/** Display metadata the queue list needs without loading full materials. */
export interface PlannerPatternMeta {
  patternId: string
  name: string
  /** Absolute or app-relative image URL for the queue card. */
  imageUrl: string | null
  /** Short spec line, e.g. "120 × 90 · 18 colours". */
  spec: string | null
  /** Where "open" / "make this" should link. */
  href: string | null
}

export interface PlannerPatternRef {
  craft: PlannerCraft
  patternId: string
  /**
   * The signed-in maker resolving this reference. A provider returns null /
   * unavailable for a private pattern this viewer does not own, so a planner
   * never leaks another maker's work-in-progress.
   */
  viewerUserId: string | null
}

/**
 * A craft adapter. Stateless: the registry hands back a singleton.
 * `settings` is the project's `settings` JSON, shaped by this provider.
 */
export interface MaterialsProvider {
  craft: PlannerCraft
  /** Unit label for this craft's materials, e.g. "skein". */
  unit: string
  getPatternMeta(ref: PlannerPatternRef): Promise<PlannerPatternMeta | null>
  getMaterials(ref: PlannerPatternRef, settings: unknown): Promise<MaterialsBreakdown>
}

/** A material rolled up across projects, with stash applied. */
export interface RolledUpMaterial extends MaterialLine {
  /** How much of this material the maker already owns (from the stash). */
  quantityOwned: number
  /** Still to buy: max(0, needed - owned), rounded to the craft's step. */
  quantityToBuy: number
}
