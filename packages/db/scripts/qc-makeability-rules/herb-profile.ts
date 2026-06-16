import {
  bodyText, compose,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * HERB_PROFILE (herbal-medicine) — the "HERB_PROFILE" checklist section, every
 * item a hard block. Common name + Latin binomial, identification, habitat +
 * range, parts used, a traditional-uses section, and cautions / contraindications
 * are MANDATORY. Modern evidence + wildcrafting notes are mandatory only when
 * applicable, so they are not blanket-blocked.
 *
 * No in-body medical disclaimer is required. The site-wide disclaimer is the
 * single source ([[feedback_content_completeness_checklist]], locked 2026-06-16).
 * The cautions / contraindications section below is a different, retained rule.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  if (!/\b[A-Z][a-z]+\s+[a-z]{3,}\b/.test(text)) reasons.push('no Latin binomial (Genus species)')

  const identification = /\b(identif|description|recognise|recognize|leaves|leaf|flower|stem|root|appearance|looks? like|grows? (?:up )?to|the (?:herb|plant) (?:has|is))\b/i.test(text)
  if (!identification) reasons.push('no identification description (leaf, flower, stem, root)')

  const habitat = /\b(habitat|native|range|grows? (?:in|wild)|found (?:in|across)|origin|distribution|woodland|hedgerow|meadow|cultivat|thrives? in)\b/i.test(text)
  if (!habitat) reasons.push('no habitat / range')

  const partsUsed = /\b(parts? used|leaves|flowers?|roots?|seeds?|bark|aerial parts|rhizome|berr(?:y|ies)|stems?|whole (?:herb|plant))\b/i.test(text)
  if (!partsUsed) reasons.push('no parts used')

  const traditional = /\b(traditional|historically|folk (?:use|medicine)|long (?:used|been used)|herbalists?|old remed|in the past|used (?:for|to)|remedy|remedies)\b/i.test(text)
  if (!traditional) reasons.push('no traditional uses section')

  const cautions = /\b(caution|safety|do not|avoid|contraindicat|side effect|pregnan|allergic|interact|consult|not (?:for|suitable))\b/i.test(text)
  if (!cautions) reasons.push('no cautions / contraindications')

  return compose(ctx, 'herbal-medicine:herb-profile', reasons)
}
