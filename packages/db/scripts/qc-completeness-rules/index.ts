/**
 * Content-completeness gate — dispatcher.
 *
 * `checkCompleteness(ctx)` runs the generic checks (leaked NaN / undefined /
 * placeholder / empty / too-short body) that fire on every category, then the
 * per-category structural rule (one file per category in this directory). The
 * result is BINARY: ok=true means the row is a real, makeable / readable piece
 * of content and may publish; ok=false means it stays DRAFT with the reasons
 * recorded in `Tutorial.qcBlockReason` for the qc-fix pass to pick up.
 *
 * This is the function the autopilot publish path (`uploadTutorial`) and the
 * batch DRAFT->PUBLISHED flippers import to block broken content before it
 * goes live — closing the hole that shipped ~894 skeleton patterns.
 *
 * Importing one more category file (a new craft category) is the only change
 * needed to extend coverage; an unknown category falls back to generic-only
 * checks (it never silently passes broken content).
 */
import {
  bodyText,
  genericChecks,
  type CategoryRule,
  type CompletenessContext,
  type CompletenessResult,
} from './shared.js'

import { rule as cooking } from './cooking.js'
import { rule as baking } from './baking.js'
import { rule as herbalMedicine } from './herbal-medicine.js'
import { rule as naturalHome } from './natural-home.js'
import { rule as crochet } from './crochet.js'
import { rule as knitting } from './knitting.js'
import { rule as needlework } from './needlework.js'
import { rule as crossStitch } from './cross-stitch.js'
import { rule as sewing } from './sewing.js'
import { rule as fibreArts } from './fibre-arts.js'
import { rule as woodNaturalCraft } from './wood-natural-craft.js'
import { rule as potteryCeramics } from './pottery-ceramics.js'
import { rule as paperWord } from './paper-word.js'
import { rule as homeRepair } from './home-repair.js'
import { rule as animalsSmallholding } from './animals-smallholding.js'
import { rule as sustainability } from './sustainability.js'
import { rule as garden } from './garden.js'
import { rule as mindset } from './mindset.js'

const RULES: CategoryRule[] = [
  cooking, baking, herbalMedicine, naturalHome, crochet, knitting, needlework,
  crossStitch, sewing, fibreArts, woodNaturalCraft, potteryCeramics, paperWord,
  homeRepair, animalsSmallholding, sustainability, garden, mindset,
]

const RULE_BY_SLUG = new Map<string, CategoryRule>(RULES.map((r) => [r.slug, r]))

/** Every category slug that has a dedicated completeness rule. */
export const COVERED_CATEGORIES = RULES.map((r) => r.slug)

export type { CompletenessContext, CompletenessResult } from './shared.js'

/**
 * Run the completeness gate for one tutorial. Generic checks always run; the
 * per-category rule runs on top. Unknown categories get generic-only coverage.
 */
export function checkCompleteness(ctx: CompletenessContext): CompletenessResult {
  const text = bodyText(ctx.body)
  const generic = genericChecks(text)
  const reasons = [...generic.reasons]
  const rules = [...generic.rules]

  const categoryRule = RULE_BY_SLUG.get(ctx.categorySlug)
  if (categoryRule) {
    for (const reason of categoryRule.check(ctx, text)) {
      reasons.push(reason)
      rules.push(`${ctx.categorySlug}:${ctx.type.toLowerCase()}`)
    }
  }
  return { ok: reasons.length === 0, reasons, rules }
}

/**
 * Build the structured value stored in `Tutorial.qcBlockReason` when a publish
 * is blocked. Kept here so every call site records the same shape.
 */
export function buildQcBlockReason(
  result: CompletenessResult,
  meta: { blockedFromStatus: string; checkedAt: string; source: string },
): Record<string, unknown> {
  return {
    blocked: true,
    reasons: result.reasons,
    rules: result.rules,
    blockedFromStatus: meta.blockedFromStatus,
    checkedAt: meta.checkedAt,
    source: meta.source,
  }
}
