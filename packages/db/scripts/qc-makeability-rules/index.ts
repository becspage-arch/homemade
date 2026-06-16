/**
 * Makeability gate — dispatcher.
 *
 * `auditMakeability(ctx)` picks the right per-type rule from the
 * (type, category, subcategory) triple and runs it. Every rule folds in the
 * generic mechanical checks (NaN / undefined / placeholder / em-dash / banned
 * phrasing / short body / untyped text node / glossary termSlug) on top of its
 * structural makeability bar.
 *
 * Result is BINARY (no warning tier): ok=true means a competent person could
 * make this from the page; ok=false means it is un-published to DRAFT with the
 * reasons recorded in `Tutorial.qcBlockReason`.
 *
 * This is the function the audit runner, the un-publish pass, and the publish
 * gate (`uploadTutorial` + the gated DRAFT->PUBLISHED flip) all share, so a row
 * is judged identically wherever it is checked.
 */
import { COUNTED_NEEDLEWORK, type MakeabilityContext, type MakeabilityResult } from './shared.js'

import { auditTutorial as recipe } from './recipe.js'
import { auditTutorial as technique } from './technique.js'
import { auditTutorial as stitch } from './stitch.js'
import { auditTutorial as practice } from './practice.js'
import { auditTutorial as growingGuide } from './growing-guide.js'
import { auditTutorial as remedy } from './remedy.js'
import { auditTutorial as herbProfile } from './herb-profile.js'
import { auditTutorial as reading } from './reading.js'
import { auditTutorial as patternCrossStitch } from './pattern-cross-stitch.js'
import { auditTutorial as patternCrochet } from './pattern-crochet.js'
import { auditTutorial as patternKnitting } from './pattern-knitting.js'
import { auditTutorial as patternNeedleworkCounted } from './pattern-needlework-counted.js'
import { auditTutorial as patternNeedleworkSurface } from './pattern-needlework-surface.js'
import { auditTutorial as patternProject } from './pattern-project.js'

export type { MakeabilityContext, MakeabilityResult, ChartFacts } from './shared.js'

/** The rule key chosen for a row — surfaced in the audit JSON for grouping. */
export function ruleKeyFor(ctx: MakeabilityContext): string {
  switch (ctx.type) {
    case 'RECIPE': return 'recipe'
    case 'TECHNIQUE': return 'technique'
    case 'STITCH': return 'stitch'
    case 'PRACTICE': return 'practice'
    case 'GROWING_GUIDE': return 'growing-guide'
    case 'REMEDY': return 'remedy'
    case 'HERB_PROFILE': return 'herb-profile'
    case 'READING': return 'reading'
    case 'PATTERN':
      switch (ctx.categorySlug) {
        case 'cross-stitch': return 'pattern-cross-stitch'
        case 'crochet': return 'pattern-crochet'
        case 'knitting': return 'pattern-knitting'
        case 'needlework':
          return COUNTED_NEEDLEWORK.has(ctx.subCategorySlug ?? '')
            ? 'pattern-needlework-counted'
            : 'pattern-needlework-surface'
        default: return 'pattern-project'
      }
    default: return 'unknown'
  }
}

const RULES: Record<string, (ctx: MakeabilityContext) => MakeabilityResult> = {
  recipe, technique, stitch, practice,
  'growing-guide': growingGuide, remedy, 'herb-profile': herbProfile, reading,
  'pattern-cross-stitch': patternCrossStitch,
  'pattern-crochet': patternCrochet,
  'pattern-knitting': patternKnitting,
  'pattern-needlework-counted': patternNeedleworkCounted,
  'pattern-needlework-surface': patternNeedleworkSurface,
  'pattern-project': patternProject,
}

/**
 * Run the makeability gate for one tutorial. An unknown (type, category) pair
 * never silently passes: it falls back to a recipe-vs-project best guess by
 * type, and if even that fails, to generic-only checks.
 */
export function auditMakeability(ctx: MakeabilityContext): MakeabilityResult {
  const key = ruleKeyFor(ctx)
  const rule = RULES[key]
  if (rule) return rule(ctx)
  // Unknown type: generic checks only (never a silent pass for broken bodies).
  return technique(ctx)
}

/** Structured value stored in `Tutorial.qcBlockReason` on a block. */
export function buildMakeabilityBlockReason(
  result: MakeabilityResult,
  meta: { ruleKey: string; blockedFromStatus: string; checkedAt: string; source: string },
): Record<string, unknown> {
  return {
    blocked: true,
    gate: 'makeability',
    ruleKey: meta.ruleKey,
    reasons: result.reasons,
    rules: result.rules,
    blockedFromStatus: meta.blockedFromStatus,
    checkedAt: meta.checkedAt,
    source: meta.source,
  }
}
