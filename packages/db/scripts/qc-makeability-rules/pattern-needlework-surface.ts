import {
  bodyText, compose, hasActionableSteps, hasMaterials, hasNodeType, headings,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Surface needlework PATTERN (surface-embroidery, ribbon, stumpwork,
 * candlewicking, goldwork, foundations) — the "PATTERN — needlework (surface)"
 * checklist section, every item a hard block. Not chart-led: it needs a
 * transferable outline, a placement guide, a stitch reference, materials, a
 * finished size, and attribution.
 */
const STITCH_NAMES_RE =
  /\b(chain stitch|satin stitch|stem stitch|french knot|back ?stitch|split stitch|fly stitch|seed stitch|long and short|fishbone|feather stitch|couching|bullion|lazy daisy|detached chain|woven wheel|stumpwork|padded satin|coral stitch|cretan stitch)\b/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)
  const headingText = headings(ctx.body).join(' | ')

  // Pattern outline — a transferable image / inset, or detailed positioning text.
  const outline =
    hasNodeType(ctx.body, 'image') || ctx.chart.hasChartNode || ctx.chart.tutorialChartDefinition ||
    /\b(transfer|outline|trace|template|design (?:lines?|onto)|position the design|iron[- ]?on)\b/i.test(text)
  if (!outline) reasons.push('no pattern outline (transferable image or detailed positioning text)')

  // Stitch placement guide — which stitch goes where, worked through.
  if (!hasActionableSteps(ctx)) reasons.push('no stitch placement guide (which stitch goes where, worked through)')

  // Stitch reference list — what each stitch is.
  if (!STITCH_NAMES_RE.test(text) && !/stitches used|stitch (?:guide|reference|library)/i.test(headingText)) {
    reasons.push('no stitch reference list (what each stitch is)')
  }

  if (!hasMaterials(ctx.body)) reasons.push('no materials list')
  if (!/\b(linen|cotton|calico|muslin|felt|canvas|aida|even ?weave|fabric|ground fabric)\b/i.test(text)) {
    reasons.push('no fabric specified (type + dimensions)')
  }
  if (!/\b(DMC|Anchor|Madeira|floss|stranded cotton|perle|coton|ribbon|cord|thread|silk)\b/i.test(text)) {
    reasons.push('no thread / ribbon / cord brand + colour list')
  }
  if (!/\bneedle\b/i.test(text)) reasons.push('no needle sizes')
  if (!/\bfinished\b|\bmeasures?\b[^.]{0,20}\d|\b\d+(?:\.\d+)?\s*(?:cm|inch(?:es)?|in\b|")\b/i.test(text) && !ctx.finishedSizeText) {
    reasons.push('no finished dimensions')
  }

  const attribution =
    ctx.hasDesigner || /design(ed by|er|\s+house)|\bhouse\b|adapted from|after a design/i.test(ctx.sourceNotes ?? '')
  if (!attribution) reasons.push('no designer attribution')

  return compose(ctx, 'needlework-surface:pattern', reasons)
}
