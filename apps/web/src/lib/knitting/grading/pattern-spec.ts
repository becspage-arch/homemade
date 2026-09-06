// What a stored KnittingPattern row has to say about grading.
//
// The grading library is pure: give it a construction shape, a gauge and an
// ease preset and it writes every size. This module is the one place that
// reads a stored pattern row and decides whether the row says enough for the
// grader to run, and what it says. It stays pure too — no Prisma import, no
// database — so the caller passes a plain object and the answer is testable.
//
// The rule the Studio relies on: `deriveGradableSpec` returns null whenever
// the row cannot be graded honestly. A null answer means the size table and
// the "Fit it to me" panel do not render at all, rather than showing numbers
// the pattern never claimed.

import type { ConstructionShape, GarmentType, ShapeOptions } from './types'
import type { DominantFabric, Gauge } from './gauge'
import type { EasePreset } from './ease-presets'
import { EASE_PRESETS } from './ease-presets'
import type { SizeName } from './size-charts'
import { listAllSizes } from './size-charts'
import type { SockConstruction, SockHeelStyle, SockOptions } from '../sock/types'
import { listAllFootSizes } from '../sock/sock-sizes'

/** The KnittingPattern columns grading reads. All optional — a row missing
 *  any of them simply grades to null. */
export interface KnittingGradingSource {
  slug?: string | null
  name?: string | null
  projectShape?: string | null
  constructionDirection?: string | null
  inTheRoundMethod?: string | null
  techniqueDisciplines?: string[] | null
  craftTechniqueTags?: string[] | null
  specialStitchesUsed?: string[] | null
  easePresetSlug?: string | null
  gaugeInPatternStitch?: unknown
  gaugeText?: string | null
  yarnWeightStandard?: string | null
  sizesGraded?: unknown
}

export interface GarmentGradableSpec {
  kind: 'GARMENT'
  constructionShape: ConstructionShape
  garmentType: GarmentType
  gauge: Gauge
  easePreset: EasePreset
  sizes: SizeName[]
  options: ShapeOptions
}

export interface SockGradableSpec {
  kind: 'SOCK'
  construction: SockConstruction
  heelStyle: SockHeelStyle
  gauge: Gauge
  sizes: string[]
  options: SockOptions
}

export type KnittingGradableSpec = GarmentGradableSpec | SockGradableSpec

// ── Standard size sets ──────────────────────────────────────────────────────

/** The size run a graded garment shows by default. Women's chart; a pattern
 *  that names its own sizes overrides it. */
export const DEFAULT_GARMENT_SIZES: SizeName[] = [
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
]

/** The size run a graded sock shows by default: the adult women's and men's
 *  shoe sizes, the bulk of what people knit socks for. */
export const DEFAULT_SOCK_SIZES: string[] = [
  'W_4UK_37EU_6US', 'W_5UK_38EU_7US', 'W_6UK_39EU_8US', 'W_7UK_40EU_9US',
  'M_8UK_42EU_9US', 'M_9UK_43EU_10US', 'M_10UK_44EU_11US', 'M_11UK_45EU_12US',
]

const KNOWN_SIZES = new Set<string>(listAllSizes())
const KNOWN_FOOT_SIZES = new Set<string>(listAllFootSizes())

export function isKnownSize(size: string): size is SizeName {
  return KNOWN_SIZES.has(size)
}

export function isKnownFootSize(size: string): boolean {
  return KNOWN_FOOT_SIZES.has(size)
}

// ── Gauge ───────────────────────────────────────────────────────────────────

/**
 * Read a gauge out of the structured `gaugeInPatternStitch` JSON, falling
 * back to the human-written `gaugeText`. Returns null when neither yields a
 * usable pair of numbers — a pattern with no gauge cannot be graded.
 */
export function readGauge(source: KnittingGradingSource): Gauge | null {
  const structured = source.gaugeInPatternStitch
  if (structured && typeof structured === 'object' && !Array.isArray(structured)) {
    const g = structured as Record<string, unknown>
    const sts = toPositiveNumber(g.stitchesPer10cm)
    const rows = toPositiveNumber(g.rowsPer10cm)
    if (sts && rows) return { stitchesPer10cm: sts, rowsPer10cm: rows }
  }
  return parseGaugeText(source.gaugeText)
}

/**
 * Pull "22 sts x 30 rows = 10 cm" style phrasing apart. Handles rounds as
 * well as rows, and converts a per-inch or over-4-inches gauge to the
 * per-10 cm numbers the library works in.
 */
export function parseGaugeText(text: string | null | undefined): Gauge | null {
  if (!text) return null
  const lower = text.toLowerCase()
  const stitchMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:sts?\b|stitches?\b)/)
  const rowMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:rows?\b|rnds?\b|rounds?\b)/)
  if (!stitchMatch || !rowMatch) return null
  let sts = Number(stitchMatch[1])
  let rows = Number(rowMatch[1])
  if (!(sts > 0) || !(rows > 0)) return null

  // Gauge quoted over 4 inches is the same span as 10 cm, so it needs no
  // conversion. Gauge quoted per single inch does.
  const perInch = /(?:per|\/|in)\s*(?:1\s*)?(?:inch|in\b|")/.test(lower) &&
    !/4\s*(?:inch|in\b|")/.test(lower)
  if (perInch) {
    sts = sts * 3.937
    rows = rows * 3.937
  }
  return { stitchesPer10cm: round1(sts), rowsPer10cm: round1(rows) }
}

// ── Ease ────────────────────────────────────────────────────────────────────

const EASE_BY_LABEL = new Map<string, EasePreset>(
  (Object.entries(EASE_PRESETS) as Array<[EasePreset, { label: string }]>).map(
    ([preset, descriptor]) => [normalise(descriptor.label), preset],
  ),
)

/**
 * Resolve the stored `easePresetSlug` onto a library preset. Accepts the
 * preset name in any casing or with hyphens ("positive-4"), and the
 * plain-English label the preset carries ("relaxed"). Returns null when the
 * row names nothing recognisable, so the caller picks the default.
 */
export function readEasePreset(slug: string | null | undefined): EasePreset | null {
  if (!slug) return null
  const key = normalise(slug)
  if (key in EASE_PRESETS) return key as EasePreset
  return EASE_BY_LABEL.get(normalise(slug)) ?? null
}

// ── Shape and fabric ────────────────────────────────────────────────────────

const GARMENT_TYPE_BY_PROJECT_SHAPE: Record<string, GarmentType> = {
  SWEATER: 'PULLOVER',
  CARDIGAN: 'CARDIGAN',
  VEST: 'VEST',
}

/**
 * Which of the six construction shapes this row is. A tag naming the shape
 * outright wins; otherwise the build direction decides, with the yoke /
 * raglan split settled by the tags and by whether the pattern is stranded
 * colourwork (a colourwork sweater worked top-down is a yoke).
 */
export function readConstructionShape(
  source: KnittingGradingSource,
): ConstructionShape | null {
  const tags = tagSet(source)
  if (tags.has('contiguous') || tags.has('contiguous set in')) return 'CONTIGUOUS_SET_IN'
  if (tags.has('raglan')) return 'TOP_DOWN_RAGLAN'
  if (tags.has('yoke') || tags.has('circular yoke')) return 'TOP_DOWN_YOKE'
  if (tags.has('drop shoulder') || tags.has('dropped shoulder')) return 'DROP_SHOULDER'
  if (tags.has('set in sleeve') || tags.has('set in sleeves') || tags.has('set in')) {
    return 'BOTTOM_UP_SET_IN'
  }
  if (tags.has('side to side') || tags.has('cuff to cuff')) return 'SIDE_TO_SIDE'

  const disciplines = new Set(source.techniqueDisciplines ?? [])
  switch (source.constructionDirection) {
    case 'TOP_DOWN':
      return disciplines.has('COLOURWORK') ? 'TOP_DOWN_YOKE' : 'TOP_DOWN_RAGLAN'
    case 'BOTTOM_UP':
    case 'MULTI_PIECE':
      return 'BOTTOM_UP_SET_IN'
    case 'SIDE_TO_SIDE':
      return 'SIDE_TO_SIDE'
    case 'SINGLE_PIECE':
      return 'DROP_SHOULDER'
    default:
      return null
  }
}

/** The fabric the body is mostly worked in, which sets the pull-in and yarn
 *  multipliers. Falls back to stockinette. */
export function readDominantFabric(source: KnittingGradingSource): DominantFabric {
  const disciplines = new Set(source.techniqueDisciplines ?? [])
  if (disciplines.has('CABLE_ARAN')) return 'CABLE'
  if (disciplines.has('BRIOCHE_DOUBLEKNIT')) return 'BRIOCHE'
  if (disciplines.has('COLOURWORK')) return 'COLOURWORK_STRANDED'
  if (disciplines.has('LACE')) return 'LACE'
  const tags = tagSet(source)
  if (tags.has('garter') || tags.has('garter stitch')) return 'GARTER'
  if (tags.has('2x2 rib') || tags.has('rib 2x2')) return 'RIB_2X2'
  if (tags.has('1x1 rib') || tags.has('rib 1x1') || tags.has('ribbing')) return 'RIB_1X1'
  return 'STOCKINETTE'
}

const YARN_WEIGHT_CATEGORY: Record<string, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
  LACE: 1,
  FINGERING: 1,
  SPORT: 2,
  DK: 3,
  WORSTED: 4,
  ARAN: 4,
  BULKY: 5,
  SUPER_BULKY: 6,
  JUMBO: 7,
}

export function readYarnWeightCategory(
  standard: string | null | undefined,
): 1 | 2 | 3 | 4 | 5 | 6 | 7 | null {
  if (!standard) return null
  return YARN_WEIGHT_CATEGORY[standard] ?? null
}

// ── Socks ───────────────────────────────────────────────────────────────────

export function readSockConstruction(
  source: KnittingGradingSource,
): SockConstruction | null {
  const tags = tagSet(source)
  if (tags.has('toe up') || tags.has('toe-up')) return 'TOE_UP'
  if (tags.has('cuff down') || tags.has('cuff-down')) return 'CUFF_DOWN'
  switch (source.constructionDirection) {
    case 'BOTTOM_UP':
      return 'TOE_UP'
    case 'TOP_DOWN':
    case 'SINGLE_PIECE':
      return 'CUFF_DOWN'
    default:
      return null
  }
}

export function readSockHeelStyle(source: KnittingGradingSource): SockHeelStyle {
  const tags = tagSet(source)
  if (tags.has('afterthought heel') || tags.has('afterthought')) return 'AFTERTHOUGHT'
  if (tags.has('german short row') || tags.has('german short rows')) return 'SHORT_ROW_GERMAN'
  if (tags.has('japanese short row') || tags.has('japanese short rows')) return 'SHORT_ROW_JAPANESE'
  if (tags.has('dutch heel') || tags.has('dutch short row')) return 'SHORT_ROW_DUTCH'
  if (tags.has('short row heel') || tags.has('short row')) return 'SHORT_ROW_GERMAN'
  return 'FLAP_AND_GUSSET'
}

// ── The one entry point ─────────────────────────────────────────────────────

/**
 * What this pattern row lets the grader do, or null when it lets it do
 * nothing. Null covers every honest gap: a project shape with no graded
 * construction (a scarf, a blanket), a garment whose build direction the row
 * never recorded, and any row with no usable gauge.
 */
export function deriveGradableSpec(
  source: KnittingGradingSource,
): KnittingGradableSpec | null {
  const gauge = readGauge(source)
  if (!gauge) return null

  if (source.projectShape === 'SOCK') {
    const construction = readSockConstruction(source)
    if (!construction) return null
    return {
      kind: 'SOCK',
      construction,
      heelStyle: readSockHeelStyle(source),
      gauge,
      sizes: sockSizesFor(source),
      options: {
        yarnWeightCategory: clampSockYarnWeight(
          readYarnWeightCategory(source.yarnWeightStandard),
        ),
      },
    }
  }

  const garmentType = source.projectShape
    ? GARMENT_TYPE_BY_PROJECT_SHAPE[source.projectShape]
    : undefined
  if (!garmentType) return null

  const constructionShape = readConstructionShape(source)
  if (!constructionShape) return null

  const options: ShapeOptions = { dominantFabric: readDominantFabric(source) }
  const yarnWeightCategory = readYarnWeightCategory(source.yarnWeightStandard)
  if (yarnWeightCategory) options.yarnWeightCategory = yarnWeightCategory

  return {
    kind: 'GARMENT',
    constructionShape,
    garmentType,
    gauge,
    easePreset: readEasePreset(source.easePresetSlug) ?? 'ZERO',
    sizes: garmentSizesFor(source),
    options,
  }
}

// ── Internals ───────────────────────────────────────────────────────────────

function garmentSizesFor(source: KnittingGradingSource): SizeName[] {
  const named = sizeNamesFromGraded(source.sizesGraded).filter(isKnownSize)
  return named.length > 0 ? named : DEFAULT_GARMENT_SIZES
}

function sockSizesFor(source: KnittingGradingSource): string[] {
  const named = sizeNamesFromGraded(source.sizesGraded).filter(isKnownFootSize)
  return named.length > 0 ? named : DEFAULT_SOCK_SIZES
}

function sizeNamesFromGraded(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const name = (entry as Record<string, unknown>).name
    if (typeof name === 'string' && name) out.push(name)
  }
  return out
}

function tagSet(source: KnittingGradingSource): Set<string> {
  const all = [
    ...(source.craftTechniqueTags ?? []),
    ...(source.specialStitchesUsed ?? []),
  ]
  return new Set(all.map(normaliseTag))
}

/** Tags arrive as "drop-shoulder", "Drop Shoulder" or "drop_shoulder". */
function normaliseTag(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
}

function normalise(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]+/g, '_')
}

function toPositiveNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** The sock yarn estimator only knows categories 1-5. */
function clampSockYarnWeight(
  category: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null,
): 1 | 2 | 3 | 4 | 5 | undefined {
  if (!category) return undefined
  return category > 5 ? 5 : (category as 1 | 2 | 3 | 4 | 5)
}
