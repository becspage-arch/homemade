import {
  bodyText, compose, headings,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * HERB_PROFILE (herbal-medicine). Needs a common name + Latin binomial, an
 * identification description, habitat + range, parts used, traditional + modern
 * uses, cautions / contraindications, and the locked medical disclaimer.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)
  const headingText = headings(ctx.body).join(' | ')

  // Latin binomial: two capitalised-then-lowercase Latin words (Genus species).
  const binomial = /\b[A-Z][a-z]+\s+[a-z]{3,}\b/.test(text)
  if (!binomial) {
    reasons.push('no Latin binomial (Genus species)')
  }
  const identification = /\b(identif|description|recognise|recognize|leaves|flower|stem|grows? (?:up )?to|appearance|looks? like|the herb)\b/i.test(text)
  if (!identification) {
    reasons.push('no identification description')
  }
  const habitat = /\b(habitat|native|range|grows? (?:in|wild)|found (?:in|across)|origin|distribution|woodland|hedgerow|meadow|cultivat)\b/i.test(text)
  if (!habitat) {
    reasons.push('no habitat / range')
  }
  const partsUsed = /\b(parts? used|leaves|flowers?|roots?|seeds?|bark|aerial parts|rhizome|berr(?:y|ies)|stems?)\b/i.test(text)
  if (!partsUsed) {
    reasons.push('no parts used')
  }
  const uses = /\b(traditional|historically|modern|today|used (?:for|to)|documented use|evidence|studied|remedy|remedies)\b/i.test(text)
  if (!uses) {
    reasons.push('no traditional / modern uses')
  }
  const cautions = /\b(caution|safety|do not|avoid|contraindicat|side effect|pregnan|allergic|interact|consult)\b/i.test(text)
  if (!cautions) {
    reasons.push('no cautions / contraindications')
  }
  const hasDisclaimer =
    !ctx.requiresMedicalDisclaimer ||
    /\b(not (?:medical|a substitute|intended)|educational|consult (?:a|your).{0,30}(?:doctor|practitioner|herbalist|professional)|seek (?:medical|professional)|disclaimer)\b/i.test(text) ||
    /disclaimer|safety/i.test(headingText)
  if (!hasDisclaimer) {
    reasons.push('no medical disclaimer')
  }
  return compose(ctx, 'herbal-medicine:herb-profile', reasons)
}
