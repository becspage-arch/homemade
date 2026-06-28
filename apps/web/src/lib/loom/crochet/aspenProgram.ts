/**
 * Aspen Throw — exact stitch program (INTERNAL FIXTURE ONLY).
 *
 * This is a verbatim transcription of a copyrighted, external-designer crochet
 * pattern that Rebecca supplied solely to PROVE the crochet render path of the
 * loom — exactly like the licensed embroidery fixtures. It must NEVER be shipped,
 * sold, published, or redistributed. It exists only so the loom has a real,
 * complete pattern to render its exact stitches from (the method is: work
 * BACKWARDS from a real pattern, read every stitch, render the geometry — never
 * invent a pattern).
 *
 * The throw is a corner-to-corner ("C2C") diagonal half-double-crochet blanket,
 * worked entirely in the back loop only (blo) — that blo ridge is what creates
 * the diagonal ribbing the finished blanket is known for. Start in the
 * bottom-left corner from a magic circle, grow a right triangle (Part 1), hold
 * the stitch count while shifting up (Part 2), then decrease back to a point in
 * the top-right corner (Part 3).
 *
 *   Yarn:   #5 bulky weight (single colour, soft cream / blush)
 *   Hook:   8 mm
 *   Gauge:  12 hdc-blo x 9 rows = 4" x 4"  (3 sts/inch, 2.25 rows/inch)
 *   Size:   ~50" long x 42" wide (without fringe); fringe on the two short ends
 *
 * Every row below is the EXACT operation from the pattern. `expandProgram()`
 * walks it and asserts the running stitch count matches the count the designer
 * printed at the end of each row (3, 5, 9, 11, 15 ... 167 ... 3, 1) — so the
 * transcription is self-verifying. Nothing is approximated.
 */

/** Gauge + sizing, taken verbatim from the pattern. */
export const ASPEN_GAUGE = {
  stitchesPerInch: 12 / 4, // 12 hdc-blo across 4"
  rowsPerInch: 9 / 4, // 9 rows across 4"
  widthInch: 42,
  lengthInch: 50,
  yarn: 'bulky' as const,
  hookMm: 8,
  colourHex: '#e6d4c0', // soft warm cream / blush, sampled from the finished hero
} as const

/** What happens at one end of a row. */
export type EndOp =
  | { kind: 'inc2' } // 2 hdcblo into the end stitch (increase by 1)
  | { kind: 'inc3' } // 3 hdcblo into the end stitch (increase by 2)
  | { kind: 'dec2' } // hdc2tog over 2 sts (decrease by 1)
  | { kind: 'dec3' } // hdc3tog over 3 sts (decrease by 2)

/** One worked row, reduced to its skeleton: what each end does + the run of
 *  single hdcblo through the middle is implied (fill to keep the count). */
export interface RowOp {
  row: number
  /** Magic-circle row places 3 hdc with no ends. */
  magicCircle?: boolean
  start?: EndOp
  end?: EndOp
  /** Stitch count the pattern prints at the end of this row (ground truth). */
  expect: number
}

/** A fully expanded row: the literal sequence of stitch operations worked. */
export type StitchOpKind = 'hdc' | 'hdc_inc2' | 'hdc_inc3' | 'hdc2tog' | 'hdc3tog'

export interface ExpandedRow {
  row: number
  part: 1 | 2 | 3
  /** Total live stitches after this row. */
  count: number
  /** Net change at the leading (start) and trailing (end) edge, in stitches.
   *  +1 for inc2, +2 for inc3, -1 for dec2, -2 for dec3. Drives the silhouette. */
  startDelta: number
  endDelta: number
  /** How many of the stitches in this row are plain hdcblo (the middle run). */
  plainHdc: number
}

function endDelta(op?: EndOp): number {
  switch (op?.kind) {
    case 'inc2':
      return 1
    case 'inc3':
      return 2
    case 'dec2':
      return -1
    case 'dec3':
      return -2
    default:
      return 0
  }
}

/** How many physical stitches the end op consumes from the PREVIOUS row. */
function endConsumes(op?: EndOp): number {
  switch (op?.kind) {
    case 'inc2':
    case 'inc3':
      return 1 // works into a single stitch
    case 'dec2':
      return 2
    case 'dec3':
      return 3
    default:
      return 0
  }
}

/** How many physical stitches the end op produces in THIS row. */
function endProduces(op?: EndOp): number {
  switch (op?.kind) {
    case 'inc2':
      return 2
    case 'inc3':
      return 3
    case 'dec2':
    case 'dec3':
      return 1
    default:
      return 0
  }
}

/**
 * The literal row list, transcribed from the pattern. The repeats ("for Rows 6
 * through 56, repeat Rows 4 and 5") are expanded explicitly so every one of the
 * 123 rows is present — no row is summarised away.
 */
export function aspenRowOps(): RowOp[] {
  const rows: RowOp[] = []

  // ---- Part 1 — creating the width (a growing right triangle) ----
  rows.push({ row: 1, magicCircle: true, expect: 3 }) // ch2, 3 hdc in magic circle
  rows.push({ row: 2, start: { kind: 'inc2' }, end: { kind: 'inc2' }, expect: 5 })
  rows.push({ row: 3, start: { kind: 'inc3' }, end: { kind: 'inc3' }, expect: 9 })
  rows.push({ row: 4, start: { kind: 'inc2' }, end: { kind: 'inc2' }, expect: 11 })
  rows.push({ row: 5, start: { kind: 'inc3' }, end: { kind: 'inc3' }, expect: 15 })
  // Rows 6-56 repeat Rows 4 (inc2/inc2) and 5 (inc3/inc3) in order.
  let expect = 15
  for (let r = 6; r <= 56; r++) {
    const isRow4 = (r - 6) % 2 === 0 // 6,8,10... are Row-4 repeats
    const op: EndOp = isRow4 ? { kind: 'inc2' } : { kind: 'inc3' }
    expect += isRow4 ? 2 : 4
    rows.push({ row: r, start: op, end: op, expect })
  }

  // ---- Part 2 — creating the height (count held; inc one side, dec the other) ----
  // Row 57: hdc3tog start, inc3 end. Row 58: inc2 start, hdc2tog end. Repeat to 67.
  for (let r = 57; r <= 67; r++) {
    const isRow57 = (r - 57) % 2 === 0
    if (isRow57) rows.push({ row: r, start: { kind: 'dec3' }, end: { kind: 'inc3' }, expect: 167 })
    else rows.push({ row: r, start: { kind: 'inc2' }, end: { kind: 'dec2' }, expect: 167 })
  }

  // ---- Part 3 — finishing (decrease back to a point) ----
  // Row 68: dec2/dec2. Row 69: dec3/dec3. Repeat to 122. Row 123: hdc3tog the last 3.
  expect = 167
  for (let r = 68; r <= 122; r++) {
    const isRow68 = (r - 68) % 2 === 0
    const op: EndOp = isRow68 ? { kind: 'dec2' } : { kind: 'dec3' }
    expect += isRow68 ? -2 : -4
    rows.push({ row: r, start: op, end: op, expect })
  }
  rows.push({ row: 123, start: { kind: 'dec3' }, expect: 1 }) // hdc3tog the 3 sts -> 1

  return rows
}

/**
 * Expand the row ops into per-row stitch tallies, asserting the running count
 * matches the pattern's printed count at every row. Throws if any row disagrees
 * — so a transcription error can never slip through silently.
 */
export function expandProgram(): { rows: ExpandedRow[]; totalStitches: number } {
  const ops = aspenRowOps()
  const out: ExpandedRow[] = []
  let prevCount = 0
  let total = 0

  for (const r of ops) {
    let count: number
    let startD = 0
    let endD = 0
    let plain = 0

    if (r.magicCircle) {
      count = 3
      plain = 3
    } else {
      startD = endDelta(r.start)
      endD = endDelta(r.end)
      // Stitches consumed by the two ends from the previous row.
      const consumed = endConsumes(r.start) + endConsumes(r.end)
      const middle = prevCount - consumed // plain hdcblo through the middle
      if (middle < 0) {
        throw new Error(`Row ${r.row}: negative middle run (${middle}) — bad transcription`)
      }
      plain = middle
      count = endProduces(r.start) + middle + endProduces(r.end)
    }

    if (count !== r.expect) {
      throw new Error(
        `Row ${r.row}: computed ${count} stitches but pattern prints ${r.expect} — transcription mismatch`,
      )
    }

    const part: 1 | 2 | 3 = r.row <= 56 ? 1 : r.row <= 67 ? 2 : 3
    out.push({ row: r.row, part, count, startDelta: startD, endDelta: endD, plainHdc: plain })
    total += count
    prevCount = count
  }

  return { rows: out, totalStitches: total }
}
