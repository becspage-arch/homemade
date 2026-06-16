import {
  bodyText, compose, hasBrokenFoundation, hasFinishing, hasFoundationCount,
  hasGauge, hasMaterials, hasPatternCrossReference, hasRowRound, hasStitchGlossary,
  hasTruncatedStitchInstruction, hasUnenumeratedRepeat, rowsWithoutStitchCounts,
  type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Crochet PATTERN — the "PATTERN — crochet" checklist section, every item a hard
 * block. NO OR with written-only: a chart is MANDATORY *and* written row/round
 * instructions are MANDATORY (the locked checklist killed the chart-OR-written
 * clause the previous gate carried).
 */
const YARN_WEIGHT_RE =
  /\b(lace|light fingering|fingering|sock|4[\s-]?ply|sport|dk|double knit(?:ting)?|aran|worsted|chunky|bulky|super[\s-]?chunky|super[\s-]?bulky|jumbo|yarn weight)\b/i
const HOOK_MM_RE = /\bhook\b[^.]{0,30}?\d+(?:\.\d+)?\s*mm|\b\d+(?:\.\d+)?\s*mm\b[^.]{0,30}?hook/i
const FINISHED_RE =
  /\bfinished\b|\bmeasures?\b|\bsize\b[^.]{0,30}\d|\b\d+(?:\.\d+)?\s*(?:cm|mm|inch(?:es)?|in\b|")\b[^.]{0,20}(?:wide|tall|high|long|diameter|across|deep)/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  const hasChart = ctx.chart.crochetChartData || ctx.chart.tutorialChartDefinition || ctx.chart.insetChartWithSymbols
  if (!hasChart) {
    reasons.push('no chart on the linked CrochetPattern row (mandatory)')
  }

  if (!hasRowRound(text)) {
    reasons.push('no written row/round-by-round instructions')
  } else {
    if (hasBrokenFoundation(text)) {
      reasons.push('foundation chain count is broken (NaN / undefined / 0)')
    } else if (!hasFoundationCount(text)) {
      reasons.push('no positive foundation chain / stitch count in the instructions')
    }
    if (hasTruncatedStitchInstruction(text)) {
      reasons.push('truncated instruction — a stitch group says "work" with no stitch count')
    }
    const { rows, counted } = rowsWithoutStitchCounts(text)
    if (rows > 0 && counted < rows) {
      reasons.push(`not every row carries an explicit stitch count (${counted} counts for ${rows} rows)`)
    }
    if (hasUnenumeratedRepeat(text)) {
      reasons.push('a repeat is not fully enumerated (e.g. "to end" / "as established")')
    }
    if (hasPatternCrossReference(text)) {
      reasons.push('cross-references another pattern — must be standalone')
    }
  }

  if (!hasMaterials(ctx.body)) reasons.push('no materials list')
  if (!YARN_WEIGHT_RE.test(text)) reasons.push('no yarn weight stated')
  if (!HOOK_MM_RE.test(text)) reasons.push('no hook size in mm')
  if (!hasGauge(ctx)) reasons.push('no gauge stated')
  if (!FINISHED_RE.test(text) && !ctx.finishedSizeText) reasons.push('no finished dimensions')
  if (!hasStitchGlossary(ctx, text)) reasons.push('no stitch glossary / abbreviations key')
  if (!hasFinishing(ctx, text)) reasons.push('no finishing instructions (weaving ends, blocking)')

  return compose(ctx, 'crochet:pattern', reasons)
}
