import {
  bodyText, compose, hasActionableSteps, hasMaterialsGenerous,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Project-shape PATTERN (home-repair, pottery-ceramics, wood-natural-craft,
 * sustainability, paper-word, animals-smallholding, fibre-arts).
 *
 * HARD makeability bar: action-verb-led step-by-step instructions. If you can
 * follow the steps, you can make it.
 *
 * The brief also lists materials/tools, a cut list (wood + home-repair), and a
 * clay body + firing (pottery). These are FLAGGED, not blocked, because applied
 * as hard rules they un-publish makeable content:
 *   - "cut list / measurements" fails repair + care tasks that cut nothing
 *     (bleeding a radiator, conditioning a leather belt, replacing a heater
 *     element);
 *   - "clay body / firing" fails polymer clay (oven-baked, not kiln-fired) and
 *     decorating-on-bisqueware (no clay forming, already fired);
 *   - "materials list" fails makeable tasks that name their materials inline.
 * A subtype-aware version could enforce these on true build/throw projects;
 * that is flagged in the hand-off rather than guessed at here.
 */
const MEASUREMENT_RE = /\b\d+(?:\.\d+)?\s*(?:mm|cm|m\b|metres?|inch(?:es)?|in\b|"|ft|feet)\b/gi

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []   // blocking
  const flags: string[] = []     // non-blocking — kept + flagged
  const text = bodyText(ctx.body)

  if (!hasActionableSteps(ctx)) {
    reasons.push('no step-by-step instructions (no list, method heading with action verbs, or step run)')
  }

  if (!hasMaterialsGenerous(ctx)) {
    flags.push('no materials / tools list')
  }
  if (ctx.categorySlug === 'wood-natural-craft' || ctx.categorySlug === 'home-repair') {
    if ((text.match(MEASUREMENT_RE)?.length ?? 0) < 2) {
      flags.push('few/no measurements (a dimensioned cut list helps build projects)')
    }
  }
  if (ctx.categorySlug === 'pottery-ceramics') {
    const clayBody = /\b(clay|earthenware|stoneware|porcelain|terracotta|air[- ]dry|polymer)\b/i.test(text)
    const firingOrDry = /\b(fire|firing|kiln|bisque|glaze|air[- ]dry|air dry|leather[- ]hard|greenware|dry(ing)?|bake|oven|cure|cured)\b/i.test(text)
    if (!clayBody) flags.push('no clay body stated')
    if (!firingOrDry) flags.push('no firing / drying / baking instruction')
  }

  return compose(ctx, `${ctx.categorySlug}:pattern`, reasons, flags)
}
