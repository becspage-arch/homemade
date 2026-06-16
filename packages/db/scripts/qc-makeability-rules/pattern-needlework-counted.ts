import {
  bodyText, compose, hasMaterials, headings,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Counted needlework PATTERN (blackwork, hardanger, needlepoint, sashiko) — the
 * "PATTERN — needlework (counted)" checklist section, every item a hard block.
 * Stitches live on a chart grid, so the chart is MANDATORY.
 */
const STITCH_KEY_RE =
  /\b(stitch key|symbol|legend|floss key|thread key|chart key|key:)\b/i
const FABRIC_RE =
  /\b(aida|evenweave|linen|hardanger fabric|canvas|fabric)\b[^.]{0,40}?\b(\d+)\s*[- ]?count\b|\b\d+\s*[- ]?count\b/i
const THREAD_RE = /\b(DMC|Anchor|Madeira|floss|stranded cotton|perle|coton|thread)\b[^.]{0,30}\d|\b\d+\s*(?:skeins?|strands?)\b/i
const NEEDLE_RE = /\bneedle\b[^.]{0,20}(?:size\s*)?\d+|\bsize\s*\d+\s*(?:tapestry|crewel|chenille)?\s*needle/i
const FINISHED_RE = /\bfinished\b|\bmeasures?\b[^.]{0,20}\d|\b\d+\s*x\s*\d+\b|\b\d+(?:\.\d+)?\s*(?:cm|inch(?:es)?|in\b|")\b/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)
  const headingText = headings(ctx.body).join(' | ')

  const chartPresent =
    ctx.chart.needleworkChartData || ctx.chart.insetChartWithSymbols || ctx.chart.tutorialChartDefinition
  if (!chartPresent) reasons.push('no chart on the linked NeedleworkPattern row (mandatory for a counted discipline)')

  if (!STITCH_KEY_RE.test(text) && !/key|legend|symbol/i.test(headingText)) {
    reasons.push('no stitch key (symbol to thread + colour)')
  }
  if (!hasMaterials(ctx.body)) reasons.push('no materials list')
  if (!FABRIC_RE.test(text)) reasons.push('no fabric specified (type + count + dimensions)')
  if (!THREAD_RE.test(text)) reasons.push('no thread brand + colour numbers + amounts')
  if (!NEEDLE_RE.test(text)) reasons.push('no needle size')
  if (!FINISHED_RE.test(text) && !ctx.finishedSizeText) reasons.push('no finished dimensions')

  const attribution =
    ctx.hasDesigner || /design(ed by|er|\s+house)|\bhouse\b|adapted from|after a design/i.test(ctx.sourceNotes ?? '')
  if (!attribution) reasons.push('no designer attribution')

  // Stitch direction notes — mandatory (especially sashiko).
  const directionNotes =
    /\b(direction|work (?:from|towards)|right to left|left to right|top to bottom|bottom to top|stitch order|running stitch.{0,30}row|follow the line)\b/i.test(text)
  if (!directionNotes) reasons.push('no stitch direction notes')

  // Cut-work technique notes — mandatory when applicable (hardanger).
  if (ctx.subCategorySlug === 'hardanger') {
    const cutwork = /\b(kloster|cut[- ]?work|withdraw|cut (?:the )?(?:threads|fabric)|needleweav|wrapped bars|woven bars)\b/i.test(text)
    if (!cutwork) reasons.push('hardanger pattern has no cut-work technique notes')
  }

  return compose(ctx, 'needlework-counted:pattern', reasons)
}
