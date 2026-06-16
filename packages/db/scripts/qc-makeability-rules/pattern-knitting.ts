import {
  bodyText, compose, hasFinishing, hasFoundationCount, hasGauge, hasMaterials,
  hasPatternCrossReference, hasRowRound, hasStitchGlossary, hasUnenumeratedRepeat,
  rowsWithoutStitchCounts, type MakeabilityContext, type MakeabilityResult,
} from './shared.js'

/**
 * Knitting PATTERN — the "PATTERN — knitting" checklist section, every item a
 * hard block. NO OR with written-only: a chart is MANDATORY *and* written
 * instructions are MANDATORY.
 */
const YARN_WEIGHT_RE =
  /\b(lace|light fingering|fingering|sock|4[\s-]?ply|sport|dk|double knit(?:ting)?|aran|worsted|chunky|bulky|super[\s-]?chunky|super[\s-]?bulky|jumbo|yarn weight)\b/i
const NEEDLE_MM_RE = /\bneedles?\b[^.]{0,30}?\d+(?:\.\d+)?\s*mm|\b\d+(?:\.\d+)?\s*mm\b[^.]{0,30}?needle|\bUS\s*\d+\b/i
const NEEDLE_TYPE_RE = /\b(straight|circular|double[- ]pointed|dpns?|interchangeable|magic loop)\b/i
const CAST_ON_METHOD_RE = /\b(long[- ]?tail|cable|knitted|backward[- ]?loop|provisional|tubular|german twisted|judy'?s magic|crochet (?:provisional|chain))\b[^.]{0,20}cast[- ]?on|cast[- ]?on\b[^.]{0,30}\b(method|long[- ]?tail|cable|knitted|provisional|tubular)\b/i
const BIND_OFF_METHOD_RE = /\b(bind|cast)[- ]?off\b[^.]{0,30}\b(knitwise|purlwise|in pattern|loosely|stretchy|tubular|three[- ]needle|sewn|picot|i-?cord|suspended)\b|\b(three[- ]needle|tubular|sewn|picot|i-?cord)\b[^.]{0,20}(bind|cast)[- ]?off/i
const FINISHED_RE =
  /\bfinished\b|\bmeasures?\b|\bsize\b[^.]{0,30}\d|\b\d+(?:\.\d+)?\s*(?:cm|mm|inch(?:es)?|in\b|")\b[^.]{0,20}(?:wide|tall|high|long|chest|bust|circumference|across|deep)/i

export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  const hasChart = ctx.chart.knittingChartData || ctx.chart.tutorialChartDefinition || ctx.chart.insetChartWithSymbols
  if (!hasChart) {
    reasons.push('no chart on the linked KnittingPattern row (mandatory)')
  }

  if (!hasRowRound(text) && !/\bcast[- ]?on\b/i.test(text)) {
    reasons.push('no written row/round-by-round instructions')
  } else {
    if (/\bcast[- ]?on\s*(?:NaN|undefined|0)\b/i.test(text)) {
      reasons.push('cast-on count is broken (NaN / undefined / 0)')
    } else if (!hasFoundationCount(text)) {
      reasons.push('no positive cast-on / stitch count in the instructions')
    }
    if (!hasRowRound(text)) reasons.push('no row/round instructions (cast-on mentioned but no rows worked)')
    const { rows, counted } = rowsWithoutStitchCounts(text)
    if (rows > 0 && counted < rows) {
      reasons.push(`not every row carries an explicit stitch count (${counted} counts for ${rows} rows)`)
    }
    if (hasUnenumeratedRepeat(text)) reasons.push('a repeat is not fully enumerated (e.g. "to end" / "as established")')
    if (hasPatternCrossReference(text)) reasons.push('cross-references another pattern — must be standalone')
  }

  if (!hasMaterials(ctx.body)) reasons.push('no materials list')
  if (!YARN_WEIGHT_RE.test(text)) reasons.push('no yarn weight stated')
  if (!NEEDLE_MM_RE.test(text)) reasons.push('no needle size in mm')
  if (!NEEDLE_TYPE_RE.test(text)) reasons.push('no needle type (straights / circular / DPN)')
  if (!hasGauge(ctx)) reasons.push('no gauge stated')
  if (!FINISHED_RE.test(text) && !ctx.finishedSizeText) reasons.push('no finished dimensions')
  if (!CAST_ON_METHOD_RE.test(text)) reasons.push('no cast-on method specified')
  if (!BIND_OFF_METHOD_RE.test(text)) reasons.push('no bind-off method specified')
  if (!hasStitchGlossary(ctx, text)) reasons.push('no stitch glossary / abbreviations key')
  if (!hasFinishing(ctx, text)) reasons.push('no finishing instructions')

  return compose(ctx, 'knitting:pattern', reasons)
}
