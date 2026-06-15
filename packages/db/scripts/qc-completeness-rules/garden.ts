import { craftRule, hasSteps, wordCount, type CategoryRule } from './shared.js'

/**
 * Garden: GROWING_GUIDE + TECHNIQUE rows must be actionable — either a step
 * structure or substantial guide prose (planting calendar, sowing/harvest
 * narrative). We do NOT gate on region metadata (hemisphere / climate zone):
 * `regionsApplicable` derives at render from the master species + hardiness
 * data (see the garden translation-is-free + schema-gaps locks), so an empty
 * override column is correct, not broken. Region-metadata enforcement is
 * therefore intentionally out of this gate; flagged in the hand-off.
 */
export const rule: CategoryRule = {
  slug: 'garden',
  check: (ctx, text) => {
    const reasons = craftRule()(ctx, text)
    if (ctx.type === 'GROWING_GUIDE' && !hasSteps(ctx.body, text) && wordCount(text) < 120) {
      reasons.push('growing guide has no steps and only thin prose')
    }
    return reasons
  },
}
