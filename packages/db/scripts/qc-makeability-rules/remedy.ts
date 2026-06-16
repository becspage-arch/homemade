import {
  bodyText, compose, hasOrderedMethod, hasQuantifiedIngredients, headings,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * REMEDY (herbal-medicine) — the "REMEDY" checklist section, every item a hard
 * block. Quantified ingredients, prep steps, application/dosage, frequency,
 * contraindications + safety, the medical disclaimer, and the prepared remedy's
 * duration / storage are all MANDATORY.
 */
const DOSAGE_RE =
  /\b(dose|dosing|dosage|apply|application|take|how (?:much|often)|teaspoon|tablespoon|tsp|tbsp|\bml\b|drops?|massage|sip|gargle|inhale|compress)\b/i
const FREQUENCY_RE =
  /\b(times? (?:a|per) day|daily|twice (?:a day|daily)|once (?:a day|daily)|every \d+ hours?|morning and (?:night|evening)|before bed|as (?:needed|required)|weekly|each (?:day|night|morning)|up to \d+ times)\b/i
const SAFETY_RE =
  /\b(do not|don'?t|avoid|not (?:for|suitable|recommended)|contraindicat|caution|warning|consult|pregnan|breastfeed|allergic|patch test|side effect|when not to use|seek (?:medical|advice)|speak to|interact)\b/i
const STORAGE_RE =
  /\b(store|keeps?|shelf life|use within|refrigerat|fridge|airtight|dark (?:place|cupboard)|discard after|lasts?|will keep|best (?:used|within)|freeze|make (?:it )?fresh|use (?:it )?(?:immediately|straight away|fresh|within|the same)|drink (?:while warm|immediately|fresh|straight)|single use|do not store|once cooled|prepare fresh|use the same day)\b/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)
  const headingText = headings(ctx.body).join(' | ')

  if (!hasQuantifiedIngredients(ctx.body)) reasons.push('no ingredients list with quantities')
  if (!hasOrderedMethod(ctx)) reasons.push('no numbered preparation steps')
  if (!DOSAGE_RE.test(text)) reasons.push('no application / dosage')
  if (!FREQUENCY_RE.test(text)) reasons.push('no frequency stated')
  if (!SAFETY_RE.test(text) && !/safety|caution|contraindicat|when not to use/i.test(headingText)) {
    reasons.push('no contraindications / safety section')
  }
  const hasDisclaimer =
    !ctx.requiresMedicalDisclaimer ||
    /\b(not (?:medical|a substitute|intended to)|educational|consult (?:a|your).{0,30}(?:doctor|practitioner|herbalist|professional)|seek (?:medical|professional)|disclaimer)\b/i.test(text) ||
    /disclaimer|safety|when not to use/i.test(headingText)
  if (!hasDisclaimer) reasons.push('no medical disclaimer')
  if (!STORAGE_RE.test(text)) reasons.push('no duration / storage of the prepared remedy')

  return compose(ctx, 'herbal-medicine:remedy', reasons)
}
