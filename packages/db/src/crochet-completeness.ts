/**
 * THE CROCHET PATTERN COMPLETENESS GATE.
 *
 * A crochet pattern is complete when a competent person could pick up yarn and
 * a hook and make the thing from what the row carries — every round counted,
 * the yarn and hook named, the gauge and the finished size stated, the
 * abbreviations explained, the notions listed. This checks that, against the
 * STRUCTURED columns of `CrochetPattern` rather than against Tutorial prose
 * (the crochet catalogue's patterns are rows, not bodies), and it is the last
 * thing between a generated candidate and the live catalogue.
 *
 * BINARY. A row either passes or it is not published — there is no warning
 * tier, because there is nobody to triage warnings
 * ([[feedback_no_warning_tiers]]). Every rule below is a hard block.
 *
 * Pure: no Prisma, no network. The bulk publisher calls it before it writes,
 * and the Studio save path can call it later on exactly the same shape.
 *
 * The rules are [[feedback_content_completeness_checklist]]'s PATTERN — crochet
 * section, read against structured fields:
 *
 *   · yarn weight + hook + gauge + finished size (in cm)      → makeable
 *   · written round/row instructions, every one counted        → followable
 *   · repeats enumerated, never "to end" / "as established"    → followable
 *   · abbreviations cover every stitch the instructions use    → readable
 *   · a symbol chart on a single-piece pattern                 → readable
 *   · pieces + a build order that covers them, on a multi-piece → assemblable
 *   · notions listed; safety notes on a toy                    → safe
 *   · the name and description pass the house voice rules       → ours
 *
 * ONE DELIBERATE DIFFERENCE from the blanket checklist line "chartData
 * populated — MANDATORY": a MULTI-PIECE pattern (an amigurumi) is written-only
 * by design. A `ChartDefinition` is a single-piece shape, so charting one piece
 * of nine and calling it the pattern's chart would mislead the maker rather
 * than help her; the loom's own render-on-publish step already refuses to write
 * one for a composition. A multi-piece row therefore has to carry the stricter
 * thing instead: every piece's round-by-round instructions AND a build order
 * that names every piece. A single-piece row still needs its chart, with no
 * exceptions.
 */

import { runVoiceCheck } from '../scripts/voice-check-lib'

/** One row of the `rowsStructured` JSON, as the gate needs to read it. */
export interface CrochetStructuredRow {
  section?: string | null
  rowNumber?: number | null
  rowLabel?: string | null
  instruction?: string | null
  stitchCount?: number | null
}

/** One entry of the `pieces` JSON. */
export interface CrochetPieceRow {
  name?: string | null
  sectionLabel?: string | null
  makeQuantity?: number | null
  stitchCountTotal?: number | null
  rounds?: number[] | null
}

/** Everything the gate reads. Deliberately the shape of the DB row (plus the
 *  shelf slug, which lives on the joined SubCategory) so a caller never has to
 *  reshape a pattern to check it. */
export interface CrochetCompletenessInput {
  name?: string | null
  description?: string | null
  difficulty?: string | null
  terminologyConvention?: string | null
  primaryYarnWeightId?: string | null
  primaryHookId?: string | null
  gaugeText?: string | null
  finishedSizeText?: string | null
  estimatedHours?: number | null
  rowsStructured?: unknown
  chartData?: unknown
  notions?: string[] | null
  safetyNotes?: string | null
  abbreviationsUsed?: string[] | null
  specialStitchesUsed?: string[] | null
  craftStitchSlugs?: string[] | null
  pieces?: unknown
  buildOrder?: unknown
  pieceCount?: number | null
  /** The item-type shelf the pattern is filed on — decides the toy rules. */
  subCategorySlug?: string | null
  /** Whether the row has a designer. A pattern with no attribution never ships. */
  designerId?: string | null
}

export interface CrochetCompletenessResult {
  /** True = do NOT publish. */
  blocked: boolean
  /** Plain-English reasons, one per failed rule. */
  reasons: string[]
  /** The rule ids that failed, for aggregating across a run. */
  rules: string[]
}

/**
 * The shelves whose finished object is a toy a small child may get hold of.
 *
 * Widened 6 September 2026 with the four toy-adjacent shelves the top-of-Etsy
 * pass added. Play food and doll clothes are played with by the same children;
 * a keyring charm and a dolls house miniature are small enough to swallow and
 * live at handbag height, which is exactly where a toddler finds them. All four
 * therefore need safety notes before they can publish.
 */
export const CROCHET_TOY_SHELVES = new Set([
  'amigurumi',
  'doll',
  'animal-toy',
  'baby-toy-lovey',
  'play-food',
  'doll-clothes',
  'keyring-charm',
  'miniature',
])

/**
 * The UK abbreviations the loom's written instructions can emit, plus the
 * common hand-authored ones. Anything matched here in an instruction has to
 * appear in `abbreviationsUsed`, so the pattern page can build its legend.
 *
 * Order matters on the way out only for readability; matching is by word
 * boundary, longest first, so `dc2tog` is not read as a bare `dc`.
 */
export const CROCHET_UK_ABBREVIATIONS = [
  'trtr2tog',
  'dtr2tog',
  'htr2tog',
  'dc2tog',
  'tr2tog',
  'dc-blo',
  'dc-flo',
  'trtr',
  'FPtr',
  'BPtr',
  'sl st',
  'bobble',
  'dtr',
  'htr',
  'ch',
  'dc',
  'tr',
] as const

/**
 * Repeat shorthand a maker cannot follow: the count has to be written out.
 *
 * "in each st around" is NOT on this list and must not be. It is how every real
 * pattern worked in a spiral is written, and it is completely determinate: the
 * round's own stitch count says how many. What is banned is shorthand that
 * leaves the maker to work the number out from a row she cannot see.
 */
const UNENUMERATED_REPEAT = /\b(to end|to the end|as established|as set|as before|until the end)\b/i

/** Placeholder / broken-render strings that must never reach a published row. */
const PLACEHOLDER = /\bNaN\b|\bundefined\b|\[object Object\]|\bTODO\b|\bTBD\b|\bFIXME\b|lorem ipsum|(instructions|steps).{0,12}\bgo(es)? here\b/i

/** Long dashes. Zero, anywhere, per the voice lock. */
const LONG_DASH = /[—–]/

/** A stitch count at the end of an instruction: "... (24 sts)" / "(1 st)". */
const STITCH_COUNT = /\((\d+)\s*sts?\)\s*$/

/**
 * Lines that legitimately carry no stitch count, because they are not worked
 * rows: the finishing lines the loom writes, the assembly steps, a piece
 * heading, and the yarn notes a colourwork pattern needs ("Change to the teal
 * yarn"). Everything else is a worked row and must be counted.
 */
const UNCOUNTED_LINE =
  /^(fasten off|weave in|sew |stuff |fit the|join |block |repeat rows|assembly\b|make \d|start with |change to |cut the |carry the |work every stitch )/i

function text(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function asRows(raw: unknown): CrochetStructuredRow[] {
  return Array.isArray(raw) ? (raw as CrochetStructuredRow[]) : []
}

function asPieces(raw: unknown): CrochetPieceRow[] {
  return Array.isArray(raw) ? (raw as CrochetPieceRow[]) : []
}

function asStrings(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []
}

/** Which of the known abbreviations an instruction line actually uses. */
export function abbreviationsIn(instruction: string): string[] {
  const found: string[] = []
  let rest = instruction
  for (const abbr of CROCHET_UK_ABBREVIATIONS) {
    // Escape the one abbreviation with a hyphen; the rest are word characters.
    const pattern = new RegExp(`(^|[^A-Za-z0-9-])${abbr.replace(/[-]/g, '\\-')}(?![A-Za-z0-9-])`, 'i')
    if (pattern.test(rest)) {
      found.push(abbr)
      // Blank the matches so a longer abbreviation is not counted twice as its
      // own shorter tail (dc2tog would otherwise also register dc).
      rest = rest.replace(new RegExp(abbr.replace(/[-]/g, '\\-'), 'gi'), ' ')
    }
  }
  return found
}

/**
 * Check one crochet pattern row. Empty `reasons` = publishable.
 *
 * Every rule is a block. A caller that wants to know WHY reads `reasons`; a
 * caller that only wants a decision reads `blocked`.
 */
export function checkCrochetPatternCompleteness(
  input: CrochetCompletenessInput,
): CrochetCompletenessResult {
  const reasons: string[] = []
  const rules: string[] = []
  const fail = (rule: string, reason: string): void => {
    rules.push(rule)
    reasons.push(reason)
  }

  const name = text(input.name).trim()
  const description = text(input.description).trim()
  const rows = asRows(input.rowsStructured)
  const pieces = asPieces(input.pieces)
  const buildOrder = asStrings(input.buildOrder)
  const notions = asStrings(input.notions)
  const abbreviations = asStrings(input.abbreviationsUsed)
  const stitchSlugs = asStrings(input.craftStitchSlugs)
  const multiPiece = (input.pieceCount ?? 1) > 1 || pieces.length > 1

  // ── Identity ─────────────────────────────────────────────────────────────
  if (name.length < 3) fail('name', 'The pattern has no name.')
  if (description.length < 40) {
    fail('description', 'The description is missing or too short to tell a maker what the pattern is.')
  }
  if (!input.designerId) fail('designer', 'The pattern has no designer attribution.')
  if (input.terminologyConvention !== 'uk') {
    fail('terminology', 'The pattern does not declare UK crochet terms.')
  }
  if (!input.difficulty) fail('difficulty', 'The pattern has no difficulty level.')
  if (!input.estimatedHours || input.estimatedHours <= 0) {
    fail('estimated-hours', 'The pattern does not say roughly how long it takes to make.')
  }

  // ── Voice (the same rules the tutorial upload gate runs) ─────────────────
  if (LONG_DASH.test(name) || LONG_DASH.test(description)) {
    fail('voice-dash', 'The name or description contains a long dash.')
  }
  const voice = runVoiceCheck({ title: name, excerpt: description })
  for (const err of voice.errors) {
    fail(`voice-${err.kind}`, `Voice: ${err.message}`)
  }

  // ── Materials ────────────────────────────────────────────────────────────
  if (!input.primaryYarnWeightId) fail('yarn-weight', 'No yarn weight is set on the pattern.')
  if (!input.primaryHookId) fail('hook', 'No hook size is set on the pattern.')
  const gauge = text(input.gaugeText).trim()
  if (gauge.length < 8) fail('gauge', 'The pattern states no gauge.')
  else if (!/10\s*cm|10cm/i.test(gauge)) {
    fail('gauge-units', 'The gauge is not stated over 10 cm.')
  }
  const size = text(input.finishedSizeText).trim()
  if (!size) fail('finished-size', 'The pattern states no finished size.')
  else if (!/\bcm\b/i.test(size)) fail('finished-size-units', 'The finished size is not stated in centimetres.')
  if (notions.length === 0) {
    fail('notions', 'The pattern lists no notions (hook, markers, needle, stuffing and the like).')
  }

  // ── The instructions ─────────────────────────────────────────────────────
  if (rows.length === 0) {
    fail('rows', 'The pattern has no written rows or rounds.')
  } else {
    const uncounted: string[] = []
    const unenumerated: string[] = []
    const placeholders: string[] = []
    const dashes: string[] = []
    const usedAbbreviations = new Set<string>()
    for (const row of rows) {
      const instruction = text(row.instruction).trim()
      if (!instruction) {
        uncounted.push(text(row.rowLabel) || 'a row with no instruction')
        continue
      }
      if (PLACEHOLDER.test(instruction)) placeholders.push(instruction.slice(0, 60))
      if (LONG_DASH.test(instruction)) dashes.push(instruction.slice(0, 60))
      if (UNENUMERATED_REPEAT.test(instruction)) unenumerated.push(instruction.slice(0, 60))
      for (const abbr of abbreviationsIn(instruction)) usedAbbreviations.add(abbr)
      const section = text(row.section)
      const exempt = /assembly|finishing/i.test(section) || UNCOUNTED_LINE.test(instruction)
      if (!exempt && !STITCH_COUNT.test(instruction)) uncounted.push(instruction.slice(0, 60))
    }
    if (uncounted.length) {
      fail(
        'row-stitch-counts',
        `${uncounted.length} row${uncounted.length === 1 ? '' : 's'} end without a stitch count, starting with "${uncounted[0]}".`,
      )
    }
    if (unenumerated.length) {
      fail(
        'repeats-enumerated',
        `${unenumerated.length} row${unenumerated.length === 1 ? '' : 's'} use an open-ended repeat instead of writing the count out, starting with "${unenumerated[0]}".`,
      )
    }
    if (placeholders.length) {
      fail('placeholder', `An instruction carries a placeholder or broken value: "${placeholders[0]}".`)
    }
    if (dashes.length) fail('voice-dash-rows', `An instruction contains a long dash: "${dashes[0]}".`)

    const missing = [...usedAbbreviations].filter(
      (abbr) => !abbreviations.some((a) => a.toLowerCase() === abbr.toLowerCase()),
    )
    if (missing.length) {
      fail(
        'abbreviations',
        `The abbreviation key does not explain ${missing.join(', ')}, which the instructions use.`,
      )
    }
  }
  if (stitchSlugs.length === 0) {
    fail('stitch-slugs', 'The pattern names no stitches, so it cannot link to the stitch library.')
  }

  // ── The chart, and the multi-piece alternative ───────────────────────────
  if (multiPiece) {
    if (pieces.length === 0) {
      fail('pieces', 'A multi-piece pattern lists no pieces.')
    } else {
      const unroundedPieces = pieces.filter((p) => !(p.rounds?.length) && !(p.stitchCountTotal ?? 0))
      if (unroundedPieces.length) {
        fail('piece-rounds', `${unroundedPieces.length} piece(s) carry no round counts.`)
      }
      const sections = new Set(rows.map((r) => text(r.section)).filter(Boolean))
      const uncovered = pieces
        .map((p) => text(p.sectionLabel) || text(p.name))
        .filter((label) => label && !sections.has(label))
      if (uncovered.length) {
        fail('piece-instructions', `No round-by-round instructions for: ${uncovered.join(', ')}.`)
      }
      const ordered = new Set(buildOrder.map((s) => s.toLowerCase()))
      const unordered = pieces
        .map((p) => text(p.sectionLabel) || text(p.name))
        .filter((label) => label && !ordered.has(label.toLowerCase()))
      if (buildOrder.length === 0) fail('build-order', 'A multi-piece pattern has no build order.')
      else if (unordered.length) {
        fail('build-order-coverage', `The build order does not include: ${unordered.join(', ')}.`)
      }
      const assembly = rows.some((r) => /assembly/i.test(text(r.section)))
      if (!assembly) fail('assembly', 'A multi-piece pattern has no assembly instructions.')
    }
  } else if (!input.chartData) {
    fail('chart', 'A single-piece pattern has no symbol chart.')
  }

  // ── Safety ───────────────────────────────────────────────────────────────
  const shelf = text(input.subCategorySlug)
  if (CROCHET_TOY_SHELVES.has(shelf) && text(input.safetyNotes).trim().length < 20) {
    fail('safety-notes', 'A toy pattern carries no safety notes.')
  }

  return { blocked: reasons.length > 0, reasons, rules }
}
