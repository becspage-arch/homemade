/**
 * THE JUNE STARTER CROCHET ROWS: what to do with each of the six.
 *
 * Six hand-built rows from June 2026 are PUBLIC (unseen, because crochet is
 * hidden) and fail the completeness gate: no designer, no time, no notions,
 * rows without a written stitch count, and five with no image. The go-live
 * readiness report (17 October) asks for each to be fixed or culled.
 *
 * This module is pure (no Prisma). It holds, per pattern:
 *   - the recommended action and the reason that is recorded on the row;
 *   - the FIELD FIXES that can be made from what the row already says. A
 *     stitch count is only ever added where the row's own text makes it
 *     certain, and each one is checked against the June author's structured
 *     `stitchCount` (two independent sources must agree, or the fix is not
 *     offered). Every replaced instruction is matched on its exact old text,
 *     so a row that has changed since this was written is refused, not
 *     overwritten.
 *
 * `scripts/crochet-starter-fix.ts` reads the live rows, prints the plan and,
 * only with `--apply`, writes it after a JSON backup.
 */

import { checkCrochetPatternCompleteness, type CrochetCompletenessInput } from './crochet-completeness'

export type StarterAction = 'cull' | 'fix'

/** One instruction replacement. `from` must match the live text exactly. */
export interface InstructionEdit {
  rowLabel: string
  from: string
  to: string
  /** The count `to` ends with. Must equal the row's stored `stitchCount`. */
  count: number
  /** How the count follows from the row text, in a maker's words. */
  derivation: string
}

/** A help note that breaks the voice rules (a long dash) and its fix. */
export interface HelpNoteEdit {
  rowLabel: string
  from: string
  to: string
}

export interface StarterFix {
  instructions: InstructionEdit[]
  /** A line appended after the last row ("Fasten off and weave in the ends."). */
  finishingLine: string
  helpNotes?: HelpNoteEdit[]
  /** Drop `referencePhotoMediaId` from every row (the June Flux round photos). */
  dropRoundPhotos?: boolean
  /** Unlink the thumbnail (the June Flux image; the Media row is kept). */
  dropThumbnail?: boolean
  /** A corrected gauge, only where the old one contradicts the row itself. */
  gaugeText?: { from: string; to: string; why: string }
  /** A corrected hero alt text (the Media row), only for a voice fault. */
  heroAlt?: { from: string; to: string }
  notions: string[]
  /** Completeness rules the fix cannot honestly clear. Empty = the fix clears them all. */
  unfixable: { rule: string; why: string }[]
}

export interface StarterPlan {
  slug: string
  /** What it is, in one line. */
  what: string
  recommended: StarterAction
  /** Recorded on the row with a cull. */
  cullReason: string
  /** Whether the loom engine can rebuild it today, and why. */
  engine: string
  fix: StarterFix
}

/**
 * The bulk publisher's own time rule (`estimateHours` in
 * `apps/web/src/lib/studio/generation/bulk/crochet.ts`): one hour per 400
 * stitches, at least one. Copied, not imported, because packages/db cannot
 * depend on the web app; the test pins the two to the same numbers.
 */
export function estimateHoursFromStitches(totalStitches: number): number {
  return Math.max(1, Math.ceil(totalStitches / 400))
}

const FOUNDATION_19 =
  'Make a foundation chain of 20 chains. Work 1 dc in the 2nd chain from the hook, then 1 dc in each of the next 18 chains.'
const FOUNDATION_19_EDIT: InstructionEdit = {
  rowLabel: 'Row 1',
  from: FOUNDATION_19,
  to: `${FOUNDATION_19} (19 sts)`,
  count: 19,
  derivation: '1 dc in the 2nd chain, then 1 dc in each of the next 18: 1 + 18 = 19 dc.',
}

const EDGING_NOTIONS = ['Tapestry needle for weaving in the ends']
const MOTIF_NOTIONS = ['Tapestry needle for weaving in the ends', 'Rust-proof pins for blocking']

const NO_EDGING_ENGINE =
  'No. Edgings are not a buildable shelf: CROCHET_FORMS has no edging lane and the loom has no picot, shell-on-a-strip or chain-loop row form, so it cannot make or render this. Nothing can give it an exact hero today.'

export const STARTER_PLANS: StarterPlan[] = [
  {
    slug: 'crochet-picot-edging',
    what: 'A two-row picot trim in 4-ply cotton, 19 dc then 9 picots, about 12 by 2 cm.',
    recommended: 'cull',
    cullReason:
      'June starter row: no image, and the loom cannot build or render an edging yet, so it has no exact hero. Text fixes are ready in crochet-starter-plan.ts for when an edging lane exists.',
    engine: NO_EDGING_ENGINE,
    fix: {
      instructions: [
        FOUNDATION_19_EDIT,
        {
          rowLabel: 'Row 2',
          from: 'Ch 1 and turn. 1 dc in the first dc. [Ch 3, sl st into the 3rd chain from the hook to make a picot, skip 1 dc, 1 dc in the next dc] 9 times. Nine picots sit between 10 anchor stitches. Fasten off.',
          to: 'Ch 1 and turn. 1 dc in the first dc. [Ch 3, sl st into the 3rd chain from the hook to make a picot, skip 1 dc, 1 dc in the next dc] 9 times. Nine picots sit between 10 anchor stitches. (10 sts)',
          count: 10,
          derivation:
            '1 dc, then 9 repeats of one dc: 1 + 9 = 10 dc (the row itself says 10 anchor stitches; picots are not counted). It uses 1 + 9 x 2 = 19 dc of Row 1, all of them.',
        },
      ],
      finishingLine: 'Fasten off and weave in the ends.',
      notions: EDGING_NOTIONS,
      unfixable: [],
    },
  },
  {
    slug: 'crochet-shell-lace-edging',
    what: 'A two-row scalloped trim in 4-ply cotton, 19 dc then 3 five-treble shells, about 12 by 4 cm.',
    recommended: 'cull',
    cullReason:
      'June starter row: no image, and the loom cannot build or render an edging yet, so it has no exact hero. Text fixes are ready in crochet-starter-plan.ts for when an edging lane exists.',
    engine: NO_EDGING_ENGINE,
    fix: {
      instructions: [
        FOUNDATION_19_EDIT,
        {
          rowLabel: 'Row 2',
          from: 'Ch 1 and turn. 1 dc in the first dc. [Skip 2 dc, 5 tr in the next dc to make a shell, skip 2 dc, 1 dc in the next dc] 3 times. Three shells sit between 4 anchor stitches. Fasten off.',
          to: 'Ch 1 and turn. 1 dc in the first dc. [Skip 2 dc, 5 tr in the next dc to make a shell, skip 2 dc, 1 dc in the next dc] 3 times. Three shells sit between 4 anchor stitches. (19 sts)',
          count: 19,
          derivation:
            '1 dc, then 3 repeats of 5 tr and 1 dc: 1 + 3 x 6 = 19 (4 dc and 15 tr). It uses 1 + 3 x 6 = 19 dc of Row 1, all of them.',
        },
      ],
      finishingLine: 'Fasten off and weave in the ends.',
      notions: EDGING_NOTIONS,
      unfixable: [],
    },
  },
  {
    slug: 'crochet-simple-chain-loop-edging',
    what: 'A two-row chain-loop trim in 4-ply cotton, 19 dc then 6 five-chain loops, about 12 by 3 cm.',
    recommended: 'cull',
    cullReason:
      'June starter row: no image, and the loom cannot build or render an edging yet, so it has no exact hero. Text fixes are ready in crochet-starter-plan.ts for when an edging lane exists.',
    engine: NO_EDGING_ENGINE,
    fix: {
      instructions: [
        FOUNDATION_19_EDIT,
        {
          rowLabel: 'Row 2',
          from: 'Ch 1 and turn. 1 dc in the first dc. [Ch 5, skip 2 dc, 1 dc in the next dc] 6 times. Six chain loops sit between 7 anchor stitches. Fasten off.',
          to: 'Ch 1 and turn. 1 dc in the first dc. [Ch 5, skip 2 dc, 1 dc in the next dc] 6 times. Six chain loops sit between 7 anchor stitches. (7 sts)',
          count: 7,
          derivation:
            '1 dc, then 6 repeats of one dc: 1 + 6 = 7 dc (the row itself says 7 anchor stitches; the chain loops are not counted). It uses 1 + 6 x 3 = 19 dc of Row 1, all of them.',
        },
      ],
      finishingLine: 'Fasten off and weave in the ends.',
      notions: EDGING_NOTIONS,
      unfixable: [],
    },
  },
  {
    slug: 'crochet-solid-hexagon-motif',
    what: 'A two-round solid treble hexagon in DK cotton, 18 then 54 tr, about 9 cm across the points.',
    recommended: 'cull',
    cullReason:
      'June starter row: no image, no gauge over 10 cm (the row gives only its own size, so a stitch gauge would be invented), and the loom cannot build a six-cornered round yet.',
    engine:
      'No. The motif shelf builds only row-worked squares (grid) and spiral discs. There is no cornered round (polygon increases at fixed corners with chain spaces), so a hexagon cannot be made or rendered. The June SVG chart renderer can draw it, but that drawing is a flat diagram, nowhere near the bar.',
    fix: {
      instructions: [
        {
          rowLabel: 'Round 1',
          from: 'Form a magic ring. Ch 3 (counts as the first treble), 2 tr into the ring, ch 1, [3 tr into the ring, ch 1] 5 times. Sl st to the top of the ch 3 to join, then pull the tail to close the ring.',
          to: 'Form a magic ring. Ch 3 (counts as the first treble), 2 tr into the ring, ch 1, [3 tr into the ring, ch 1] 5 times. Sl st to the top of the ch 3 to join, then pull the tail to close the ring. (18 sts)',
          count: 18,
          derivation: '3 tr (with the ch 3), then 5 repeats of 3 tr: 3 + 5 x 3 = 18 tr.',
        },
        {
          rowLabel: 'Round 2',
          from: 'Sl st into the next ch-1 corner space. Ch 3, then 2 tr, ch 1, 3 tr all into the same corner space. [1 tr in each of the next 3 tr, then 3 tr, ch 1, 3 tr into the next ch-1 corner space] 5 times. 1 tr in each of the next 3 tr. Sl st to the top of the ch 3 to join. Fasten off.',
          to: 'Sl st into the next ch-1 corner space. Ch 3, then 2 tr, ch 1, 3 tr all into the same corner space. [1 tr in each of the next 3 tr, then 3 tr, ch 1, 3 tr into the next ch-1 corner space] 5 times. 1 tr in each of the next 3 tr. Sl st to the top of the ch 3 to join. (54 sts)',
          count: 54,
          derivation: '6 corners of 3 + 3 tr and 6 sides of 3 tr: 6 x 6 + 6 x 3 = 54 tr.',
        },
      ],
      finishingLine: 'Fasten off and weave in the ends.',
      notions: MOTIF_NOTIONS,
      unfixable: [
        {
          rule: 'gauge-units',
          why: 'The gauge is the motif\'s own size (9 cm point to point). A stitch gauge over 10 cm is not in the row and cannot be worked out from it without inventing a number.',
        },
      ],
    },
  },
  {
    slug: 'crochet-solid-treble-square-motif',
    what: 'A three-round solid treble square in DK cotton, 12, 36 then 60 tr, about 10 cm.',
    recommended: 'cull',
    cullReason:
      'June starter row: no image, and the loom cannot build a cornered round with chain-space corners yet, so it has no exact hero. Text fixes are ready in crochet-starter-plan.ts.',
    engine:
      'No. The motif shelf builds only row-worked squares (grid, worked back and forth) and spiral discs. A square worked in the round from a magic ring with ch-2 corners needs a cornered-round construction the loom does not have. A row-worked square would be a different pattern, not this one.',
    fix: {
      instructions: [
        {
          rowLabel: 'Round 1',
          from: 'Form a magic ring. Ch 3 (counts as the first treble), 2 tr into the ring, ch 2, [3 tr into the ring, ch 2] 3 times. Sl st to the top of the ch 3 to join, then pull the tail to close the ring.',
          to: 'Form a magic ring. Ch 3 (counts as the first treble), 2 tr into the ring, ch 2, [3 tr into the ring, ch 2] 3 times. Sl st to the top of the ch 3 to join, then pull the tail to close the ring. (12 sts)',
          count: 12,
          derivation: '3 tr (with the ch 3), then 3 repeats of 3 tr: 3 + 3 x 3 = 12 tr.',
        },
        {
          rowLabel: 'Round 2',
          from: 'Sl st into the next ch-2 corner space. Ch 3, then 2 tr, ch 2, 3 tr all into the same corner space. [1 tr in each of the next 3 tr, then 3 tr, ch 2, 3 tr into the next ch-2 corner space] 3 times. 1 tr in each of the next 3 tr. Sl st to the top of the ch 3 to join.',
          to: 'Sl st into the next ch-2 corner space. Ch 3, then 2 tr, ch 2, 3 tr all into the same corner space. [1 tr in each of the next 3 tr, then 3 tr, ch 2, 3 tr into the next ch-2 corner space] 3 times. 1 tr in each of the next 3 tr. Sl st to the top of the ch 3 to join. (36 sts)',
          count: 36,
          derivation: '4 corners of 3 + 3 tr and 4 sides of 3 tr: 4 x 6 + 4 x 3 = 36 tr.',
        },
        {
          rowLabel: 'Round 3',
          from: 'Sl st into the next ch-2 corner space. Ch 3, then 2 tr, ch 2, 3 tr all into the same corner space. [1 tr in each of the next 9 tr, then 3 tr, ch 2, 3 tr into the next ch-2 corner space] 3 times. 1 tr in each of the next 9 tr. Sl st to the top of the ch 3 to join. Fasten off.',
          to: 'Sl st into the next ch-2 corner space. Ch 3, then 2 tr, ch 2, 3 tr all into the same corner space. [1 tr in each of the next 9 tr, then 3 tr, ch 2, 3 tr into the next ch-2 corner space] 3 times. 1 tr in each of the next 9 tr. Sl st to the top of the ch 3 to join. (60 sts)',
          count: 60,
          derivation: '4 corners of 3 + 3 tr and 4 sides of 9 tr: 4 x 6 + 4 x 9 = 60 tr. Each side of Round 2 holds 3 + 3 + 3 = 9 tr, which is what the row works into.',
        },
      ],
      finishingLine: 'Fasten off and weave in the ends.',
      notions: MOTIF_NOTIONS,
      unfixable: [],
    },
  },
  {
    slug: 'granny-square-basic-three-round',
    what: 'The classic three-round granny square in two colours of DK cotton, 12, 24 then 36 tr in clusters of three, 10 cm blocked.',
    recommended: 'cull',
    cullReason:
      'June starter row: its hero is a June SVG diagram in three colours for a two-colour pattern, so not an exact hero; its thumbnail and round photos are free Flux generations of a different square. The loom cannot build a granny (cornered rounds with chain spaces) yet.',
    engine:
      'No. Same gap as the solid square: the loom has no cornered round with chain-space corners and side spaces. The flat motif kit has chain spaces (the appliqué motifs use them), so this is the nearest engine job to bring a real granny back, but it is new construction, not a preset.',
    fix: {
      instructions: [
        {
          rowLabel: 'Round 1 (centre colour)',
          from: 'Form a magic ring. Ch 3 (counts as first treble), 2 tr into the ring, ch 2 (first corner space), [3 tr into the ring, ch 2] three more times. Sl st to the top of the beginning ch-3 to join. Pull the tail to close the ring. Fasten off centre colour, leaving a 10 cm tail.',
          to: 'Form a magic ring. Ch 3 (counts as first treble), 2 tr into the ring, ch 2 (first corner space), [3 tr into the ring, ch 2] three more times. Sl st to the top of the beginning ch-3 to join. Pull the tail to close the ring. (12 sts)',
          count: 12,
          derivation: '3 tr (with the ch 3), then three more groups of 3 tr: 3 + 3 x 3 = 12 tr in 4 clusters. The "fasten off centre colour" moves to the start of Round 2, where the colour changes.',
        },
        {
          rowLabel: 'Round 2 (outer colour)',
          from: 'Join the outer colour with a sl st into any ch-2 corner space. Ch 3 (counts as first treble), [2 tr into the same corner space, ch 2, 3 tr into the same corner space], the first corner is now formed. Then: ch 1, *(3 tr, ch 2, 3 tr) all into the next ch-2 corner space, ch 1, repeat from * twice more. Sl st to the top of the beginning ch-3 to join.',
          to: 'Fasten off the centre colour, leaving a 10 cm tail. Join the outer colour with a sl st into any ch-2 corner space. Ch 3 (counts as first treble), [2 tr into the same corner space, ch 2, 3 tr into the same corner space], the first corner is now formed. Then: ch 1, *(3 tr, ch 2, 3 tr) all into the next ch-2 corner space, ch 1, repeat from * twice more. Sl st to the top of the beginning ch-3 to join. (24 sts)',
          count: 24,
          derivation: '4 corners of 3 + 3 tr: 4 x 6 = 24 tr in 8 clusters.',
        },
        {
          rowLabel: 'Round 3 (outer colour, continuous)',
          from: 'Sl st across the next 2 trebles to bring the hook to the corner space. Ch 3 (counts as first treble), 2 tr into the corner space, ch 2, 3 tr into the same corner space (first corner formed). *Ch 1, 3 tr into the next ch-1 side space, ch 1, (3 tr, ch 2, 3 tr) into the next ch-2 corner space*, repeat from * to * twice more. Ch 1, 3 tr into the final ch-1 side space, ch 1. Sl st to the top of the beginning ch-3 to join. Fasten off, leaving a 10 cm tail for weaving in.',
          to: 'Sl st across the next 2 trebles to bring the hook to the corner space. Ch 3 (counts as first treble), 2 tr into the corner space, ch 2, 3 tr into the same corner space (first corner formed). *Ch 1, 3 tr into the next ch-1 side space, ch 1, (3 tr, ch 2, 3 tr) into the next ch-2 corner space*, repeat from * to * twice more. Ch 1, 3 tr into the final ch-1 side space, ch 1. Sl st to the top of the beginning ch-3 to join. (36 sts)',
          count: 36,
          derivation: '4 corners of 3 + 3 tr and 4 sides of 3 tr: 4 x 6 + 4 x 3 = 36 tr in 12 clusters.',
        },
      ],
      finishingLine: 'Fasten off, leaving a 10 cm tail, and weave in the ends.',
      helpNotes: [
        {
          rowLabel: 'Round 1 (centre colour)',
          from: 'First time? The magic ring is the trickiest part of any granny square. Work the round before you pull the tail to close — once the stitches anchor the ring, the centre will stay shut. If you pull the tail too early the loop slides free.',
          to: 'First time? The magic ring is the trickiest part of any granny square. Work the round before you pull the tail to close. Once the stitches anchor the ring, the centre will stay shut. If you pull the tail too early the loop slides free.',
        },
      ],
      dropRoundPhotos: true,
      dropThumbnail: true,
      gaugeText: {
        from: 'Each three-round granny square measures 9 to 10 cm across the diagonal in DK cotton on a 4 mm hook, before blocking. Blocked, the squares settle to 10 by 10 cm.',
        to: 'Each three-round granny square measures 9 to 10 cm across in DK cotton on a 4 mm hook, before blocking. Blocked, the squares settle to 10 by 10 cm.',
        why: 'A 10 by 10 cm square is 14 cm across the diagonal, so "9 to 10 cm across the diagonal" contradicts the blocked size on the same row. "Across" (side to side) is the reading that agrees with it. Rebecca to glance at this one.',
      },
      heroAlt: {
        from: 'Granny square, three rounds — finished piece render',
        to: 'Granny square, three rounds, finished piece render',
      },
      notions: MOTIF_NOTIONS,
      unfixable: [],
    },
  },
]

/** The six slugs, in the order the report lists them. */
export const STARTER_SLUGS = STARTER_PLANS.map((p) => p.slug)

/** One structured row as the June rows store it (extra keys are kept). */
export type StarterRow = Record<string, unknown> & {
  section?: string | null
  rowLabel?: string | null
  rowNumber?: number | null
  instruction?: string | null
  stitchCount?: number | null
  isRoundNotRow?: boolean | null
  helpNote?: string | null
  referencePhotoMediaId?: string | null
}

export interface FixedRows {
  rows: StarterRow[]
  /** Problems that stop the fix: a `from` that no longer matches, a count that disagrees. */
  refusals: string[]
}

const COUNT_AT_END = /\((\d+) sts\)$/

/**
 * Apply a plan's instruction, help-note and round-photo edits to the live
 * rows. Pure. Refuses (and leaves the rows as they were) when any `from` does
 * not match exactly, or when a derived count disagrees with the row's stored
 * `stitchCount`.
 */
export function applyRowFixes(liveRows: StarterRow[], fix: StarterFix): FixedRows {
  const refusals: string[] = []
  const rows: StarterRow[] = liveRows.map((r) => ({ ...r }))
  for (const edit of fix.instructions) {
    const row = rows.find((r) => r.rowLabel === edit.rowLabel)
    if (!row) {
      refusals.push(`no row labelled "${edit.rowLabel}"`)
      continue
    }
    if (row.instruction !== edit.from) {
      refusals.push(`"${edit.rowLabel}" no longer reads as it did in June; not touching it`)
      continue
    }
    const written = Number(COUNT_AT_END.exec(edit.to)?.[1])
    if (written !== edit.count) refusals.push(`"${edit.rowLabel}": the new text ends in ${written}, the plan says ${edit.count}`)
    if (row.stitchCount !== edit.count) {
      refusals.push(`"${edit.rowLabel}": derived count ${edit.count} disagrees with the stored stitchCount ${String(row.stitchCount)}`)
    }
    row.instruction = edit.to
  }
  for (const note of fix.helpNotes ?? []) {
    const row = rows.find((r) => r.rowLabel === note.rowLabel)
    if (!row || row.helpNote !== note.from) {
      refusals.push(`help note on "${note.rowLabel}" no longer reads as it did in June`)
      continue
    }
    row.helpNote = note.to
  }
  if (fix.dropRoundPhotos) for (const row of rows) delete row.referencePhotoMediaId
  const last = rows[rows.length - 1]
  const nextNumber = Math.max(0, ...rows.map((r) => (typeof r.rowNumber === 'number' ? r.rowNumber : 0))) + 1
  rows.push({
    section: last?.section ?? 'Pattern',
    rowLabel: fix.finishingLine,
    rowNumber: nextNumber,
    instruction: fix.finishingLine,
    isRoundNotRow: last?.isRoundNotRow ?? false,
  })
  return refusals.length ? { rows: liveRows, refusals } : { rows, refusals }
}

/** Total stitches over the counted rows, for the time rule. */
export function totalStitches(rows: StarterRow[]): number {
  return rows.reduce((n, r) => n + (typeof r.stitchCount === 'number' ? r.stitchCount : 0), 0)
}

/** The fields a fix would write on the CrochetPattern row (designer passed in). */
export interface FixedFields {
  designerId: string
  estimatedHours: number
  notions: string[]
  rowsStructured: StarterRow[]
  gaugeText?: string
  thumbnailMediaId?: null
}

export interface FixOutcome {
  fields: FixedFields | null
  refusals: string[]
  /** Completeness reasons still failing after the fix. */
  stillFailing: string[]
  /** The rule ids still failing (to compare with `unfixable`). */
  stillFailingRules: string[]
}

/** Build the field fix for one live row and re-run the completeness gate on it. */
export function planFix(
  live: CrochetCompletenessInput & { rowsStructured?: unknown; gaugeText?: string | null },
  plan: StarterPlan,
  houseDesignerId: string,
): FixOutcome {
  const liveRows = Array.isArray(live.rowsStructured) ? (live.rowsStructured as StarterRow[]) : []
  const { rows, refusals } = applyRowFixes(liveRows, plan.fix)
  const fields: FixedFields = {
    designerId: houseDesignerId,
    estimatedHours: estimateHoursFromStitches(totalStitches(rows)),
    notions: plan.fix.notions,
    rowsStructured: rows,
  }
  if (plan.fix.gaugeText) {
    if (live.gaugeText !== plan.fix.gaugeText.from) refusals.push('the gauge no longer reads as it did in June')
    else fields.gaugeText = plan.fix.gaugeText.to
  }
  if (plan.fix.dropThumbnail) fields.thumbnailMediaId = null
  const after = checkCrochetPatternCompleteness({ ...live, ...fields })
  return {
    fields: refusals.length ? null : fields,
    refusals,
    stillFailing: after.reasons,
    stillFailingRules: after.rules,
  }
}
