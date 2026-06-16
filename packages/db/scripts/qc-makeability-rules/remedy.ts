import {
  bodyText, compose, hasActionableSteps, hasQuantifiedIngredients, headings,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * REMEDY (herbal-medicine). Needs a quantified ingredients list, a preparation
 * method (steps), an application / dosage, contraindications + safety notes,
 * and the locked medical disclaimer.
 */
const DOSAGE_RE =
  /\b(dose|dosing|dosage|apply|application|take|use\b|how (?:much|often)|times? (?:a|per) day|teaspoon|tablespoon|tsp|tbsp|ml|drops?|twice daily|once daily|every \d+ hours)\b/i

const SAFETY_RE =
  /\b(do not|don'?t|avoid|not (?:for|suitable|recommended)|contraindicat|caution|warning|consult|pregnan|breastfeed|allergic|patch test|side effect|when not to use|seek (?:medical|advice)|speak to)\b/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)
  const headingText = headings(ctx.body).join(' | ')

  if (!hasQuantifiedIngredients(ctx.body)) {
    reasons.push('no ingredients list with quantities')
  }
  if (!hasActionableSteps(ctx)) {
    reasons.push('no preparation method (steps)')
  }
  if (!DOSAGE_RE.test(text)) {
    reasons.push('no application / dosage')
  }
  if (!SAFETY_RE.test(text)) {
    reasons.push('no contraindications / safety notes')
  }
  const hasDisclaimer =
    !ctx.requiresMedicalDisclaimer ||
    /\b(not (?:medical|a substitute|intended to)|educational|consult (?:a|your).{0,30}(?:doctor|practitioner|herbalist|professional)|seek (?:medical|professional)|disclaimer)\b/i.test(text) ||
    /disclaimer|safety|when not to use/i.test(headingText)
  if (!hasDisclaimer) {
    reasons.push('no medical disclaimer')
  }
  return compose(ctx, 'herbal-medicine:remedy', reasons)
}
