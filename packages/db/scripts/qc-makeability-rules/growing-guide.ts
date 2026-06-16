import { bodyText, compose, type MakeabilityContext, type MakeabilityResult } from './shared.js'

/**
 * GROWING_GUIDE (garden). Needs sowing (time + depth + spacing), hardiness /
 * climate, care, harvest (time + signs of readiness), and common problems +
 * remedies. Region metadata derives at render (translation-is-free lock), so
 * we read these from the body prose, not from override columns.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  // NB: no trailing \b on stems — it would block inflected forms ("watering",
  // "sowing", "problems", "propagation").
  const sowing = /\b(sow|plant|propagat|cutting|seed|divide|transplant)/i.test(text)
  const sowingTime = /\b(spring|summer|autumn|fall|winter|march|april|may|june|july|august|september|october|november|february|january|early|late|month|after the last frost|when the soil|week)/i.test(text)
  const sowingDepthOrSpacing = /\b\d+(?:\.\d+)?\s*(?:mm|cm|m\b|inch|in\b|")|\bapart\b|\bspac/i.test(text) || /\bdeep\b|\bthin to\b|\bdepth\b|\bdrill\b|\brows?\b/i.test(text)
  if (!(sowing && sowingTime)) reasons.push('no sowing / planting time')
  if (!sowingDepthOrSpacing) reasons.push('no sowing depth or spacing')

  const climate = /\b(hardiness|hardy|zone|climate|frost|tender|half-hardy|overwinter|° ?c|temperature|\bsun\b|shade|shelter|sheltered|sunny)/i.test(text)
  if (!climate) reasons.push('no hardiness / climate guidance')

  const care = /\b(water|feed|mulch|weed|prune|stake|pinch|care|maintain|moist|fertilis|fertiliz|hoe|thin out|liquid feed)/i.test(text)
  if (!care) reasons.push('no care instructions')

  const harvest = /\b(harvest|pick|crop|lift|gather|ready (?:to|when)|when (?:they|the|it).{0,40}ready|usable|cut .* stems|pull)/i.test(text)
  if (!harvest) reasons.push('no harvest time / signs of readiness')

  const problems = /\b(problem|pest|disease|aphid|slug|snail|mildew|\brot\b|bolt|common mistake|what can go wrong|trouble|go wrong|fix|remedy|if the|caterpillar|black ?fly|white ?fly)/i.test(text)
  if (!problems) reasons.push('no common problems + remedies')

  return compose(ctx, 'garden:growing-guide', reasons)
}
