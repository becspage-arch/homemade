/**
 * Crochet SYMBOL CHART — the Step-3 "show the stitches" validation artifact
 * (per `apps/web/src/lib/loom/RENDER_PROCESS.md`, the Crochet section).
 *
 * Built straight from the our-format structured stitch program (`expandProgram`)
 * — the SAME data the photoreal render will consume. The chart must show the
 * EXACT stitches so they can be confirmed faithful BEFORE any photo is rendered.
 *
 * Convention (standard crochet symbols):
 *   - hdc                = a vertical post with a horizontal top bar ("T").
 *   - 2-hdc / 3-hdc in 1 = an increase: 2 or 3 posts splaying from ONE base
 *                          point (the designer's "blue" / increase ends).
 *   - hdc2tog / hdc3tog  = a decrease: 2 or 3 posts converging to ONE top point
 *                          (the designer's "orange" / decrease ends).
 *   - magic ring         = the ring the first row of posts emerges from.
 *   - every stitch is worked in the BACK LOOP ONLY (a small base tick + legend).
 *
 * The blanket is worked corner-to-corner, so each row's left/right edges are
 * tracked from the per-end increase/decrease deltas: Part 1 grows a triangle,
 * Part 2 shifts (inc one side, dec the other), Part 3 decreases back to a point —
 * reproducing the true outline (see the pattern's own construction diagram).
 */

import { expandProgram, type ExpandedRow } from './aspenProgram'

export interface ChartOptions {
  /** Inclusive row range to draw (1-based). Default: all 123 rows. */
  rows?: { from: number; to: number }
  /** Pixels per stitch cell. Larger = more legible (use for zoomed corners). */
  cell?: number
  /** Title shown at the top. */
  title?: string
}

const INC = '#2563b8' // increases — matches the pattern's blue arrows
const DEC = '#e08a2c' // decreases — matches the pattern's orange arrows
const HDC = '#2a2a2a' // plain hdc
const RING = '#7a5d44'

/** Per-row horizontal extent (in stitch units) tracking the corner-to-corner
 *  shaping, so the drawn outline matches the real blanket. */
function rowEdges(rows: ExpandedRow[]): { left: number; right: number }[] {
  const edges: { left: number; right: number }[] = []
  let left = 0
  let right = 0
  rows.forEach((r, i) => {
    if (i === 0) {
      left = 0
      right = r.count - 1 // 3 sts: 0,1,2
    } else {
      left -= r.startDelta // inc at start grows leftwards; dec shrinks
      right += r.endDelta
    }
    edges.push({ left, right })
  })
  return edges
}

/** One hdc post ("T") centred at (cx) spanning [yTop, yBot]. */
function post(cx: number, yTop: number, yBot: number, colour: string): string {
  const bar = Math.min(6, (yBot - yTop) * 0.32)
  return (
    `<line x1="${cx}" y1="${yTop}" x2="${cx}" y2="${yBot}" stroke="${colour}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<line x1="${cx - bar}" y1="${yTop}" x2="${cx + bar}" y2="${yTop}" stroke="${colour}" stroke-width="1.6" stroke-linecap="round"/>`
  )
}

/** Increase group: `n` posts splaying from one base point at (bx, yBot). */
function increase(bx: number, yTop: number, yBot: number, xs: number[], colour: string): string {
  let s = ''
  for (const cx of xs) {
    const bar = Math.min(6, (yBot - yTop) * 0.32)
    s +=
      `<line x1="${bx}" y1="${yBot}" x2="${cx}" y2="${yTop}" stroke="${colour}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<line x1="${cx - bar}" y1="${yTop}" x2="${cx + bar}" y2="${yTop}" stroke="${colour}" stroke-width="1.6" stroke-linecap="round"/>`
  }
  s += `<circle cx="${bx}" cy="${yBot}" r="1.5" fill="${colour}"/>`
  return s
}

/** Decrease group: `n` posts converging to one top point at (tx, yTop). */
function decrease(tx: number, yTop: number, yBot: number, xs: number[], colour: string): string {
  let s = ''
  for (const cx of xs) {
    s += `<line x1="${cx}" y1="${yBot}" x2="${tx}" y2="${yTop}" stroke="${colour}" stroke-width="1.6" stroke-linecap="round"/>`
  }
  const bar = Math.min(7, (yBot - yTop) * 0.34)
  s += `<line x1="${tx - bar}" y1="${yTop}" x2="${tx + bar}" y2="${yTop}" stroke="${colour}" stroke-width="1.6" stroke-linecap="round"/>`
  return s
}

/** Map an end op to how many stitches it occupies in THIS row. */
function startProduces(r: ExpandedRow): number {
  if (r.row === 1) return 0
  return r.startDelta === 1 ? 2 : r.startDelta === 2 ? 3 : 1 // inc2->2, inc3->3, dec->1
}
function endProduces(r: ExpandedRow): number {
  if (r.row === 1) return 0
  return r.endDelta === 1 ? 2 : r.endDelta === 2 ? 3 : 1
}

export function buildChartSvg(options: ChartOptions = {}): string {
  const { rows } = expandProgram()
  const edges = rowEdges(rows)
  const cell = options.cell ?? 14
  const from = options.rows?.from ?? 1
  const to = options.rows?.to ?? rows.length
  const sub = rows.filter((r) => r.row >= from && r.row <= to)

  // Global stitch-x bounds across the drawn rows (to size + centre the canvas).
  let minX = Infinity
  let maxX = -Infinity
  for (const r of sub) {
    const e = edges[r.row - 1]!
    minX = Math.min(minX, e.left)
    maxX = Math.max(maxX, e.right)
  }
  const padL = 64 // room for row numbers + counts
  const padTop = 56
  const padR = 24
  const padBot = 64
  const W = (maxX - minX + 1) * cell + padL + padR
  const totalRows = to - from + 1
  const H = totalRows * cell + padTop + padBot

  // y for a row: row `from` at the BOTTOM (it's worked first), increasing upward.
  const yOf = (row: number): number => padTop + (to - row) * cell

  const parts: string[] = []
  parts.push(
    `<rect x="0" y="0" width="${W}" height="${H}" fill="#fbfaf7"/>`,
  )
  // Title
  const title = options.title ?? `Aspen Throw — crochet symbol chart (rows ${from}–${to})`
  parts.push(
    `<text x="${padL}" y="30" font-family="system-ui,Arial" font-size="20" font-weight="700" fill="#2a2a2a">${title}</text>`,
  )

  const xOf = (stitchX: number): number => padL + (stitchX - minX) * cell + cell / 2

  for (const r of sub) {
    const e = edges[r.row - 1]!
    const yBot = yOf(r.row) + cell * 0.86
    const yTop = yOf(r.row) + cell * 0.14
    const sp = startProduces(r)
    const ep = endProduces(r)
    const total = r.count

    // Row number + stitch count on the left.
    parts.push(
      `<text x="${padL - 10}" y="${yOf(r.row) + cell * 0.7}" text-anchor="end" font-family="system-ui,Arial" font-size="${Math.max(8, cell * 0.62)}" fill="#888">R${r.row}</text>`,
    )
    parts.push(
      `<text x="${W - padR}" y="${yOf(r.row) + cell * 0.7}" text-anchor="end" font-family="system-ui,Arial" font-size="${Math.max(8, cell * 0.55)}" fill="#bbb">(${r.count})</text>`,
    )

    if (r.row === 1) {
      // Magic ring with 3 hdc.
      const cx = xOf((e.left + e.right) / 2)
      parts.push(`<circle cx="${cx}" cy="${yBot + cell * 0.2}" r="${cell * 0.34}" fill="none" stroke="${RING}" stroke-width="2"/>`)
      for (let i = 0; i < 3; i++) {
        parts.push(post(xOf(e.left + i), yTop, yBot, RING))
      }
      continue
    }

    // Stitch x positions for this row, left..right.
    const xsRow: number[] = []
    for (let i = 0; i <= e.right - e.left; i++) xsRow.push(e.left + i)

    let idx = 0
    // --- start end ---
    if (r.startDelta > 0) {
      // increase: sp posts from one base
      const grp = xsRow.slice(idx, idx + sp).map(xOf)
      parts.push(increase(grp[0]!, yTop, yBot, grp, INC))
      idx += sp
    } else if (r.startDelta < 0) {
      // decrease: 1 post drawn as a converging group (visual width = -delta+1)
      const tx = xOf(xsRow[idx]!)
      const legs = []
      const nlegs = r.startDelta === -2 ? 3 : 2
      for (let k = 0; k < nlegs; k++) legs.push(tx + (k - (nlegs - 1) / 2) * cell * 0.5)
      parts.push(decrease(tx, yTop, yBot, legs, DEC))
      idx += 1
    } else {
      parts.push(post(xOf(xsRow[idx]!), yTop, yBot, HDC))
      idx += 1
    }

    // --- middle plain hdc ---
    const endStart = total - ep
    for (; idx < endStart; idx++) {
      parts.push(post(xOf(xsRow[idx]!), yTop, yBot, HDC))
    }

    // --- end end ---
    if (r.endDelta > 0) {
      const grp = xsRow.slice(idx, idx + ep).map(xOf)
      parts.push(increase(grp[grp.length - 1]!, yTop, yBot, grp, INC))
      idx += ep
    } else if (r.endDelta < 0) {
      const tx = xOf(xsRow[idx]!)
      const legs = []
      const nlegs = r.endDelta === -2 ? 3 : 2
      for (let k = 0; k < nlegs; k++) legs.push(tx + (k - (nlegs - 1) / 2) * cell * 0.5)
      parts.push(decrease(tx, yTop, yBot, legs, DEC))
      idx += 1
    } else if (idx < total) {
      parts.push(post(xOf(xsRow[idx]!), yTop, yBot, HDC))
      idx += 1
    }
  }

  // Legend.
  const ly = H - 38
  parts.push(
    `<text x="${padL}" y="${ly}" font-family="system-ui,Arial" font-size="13" fill="#555">` +
      `Every stitch in BACK LOOP ONLY (blo).  ` +
      `<tspan fill="${HDC}" font-weight="700">hdc = post + top bar</tspan>   ` +
      `<tspan fill="${INC}" font-weight="700">blue = increase (2–3 hdc fanning from one base)</tspan>   ` +
      `<tspan fill="${DEC}" font-weight="700">orange = decrease (hdc2tog / hdc3tog, joined at top)</tspan>   ` +
      `<tspan fill="${RING}" font-weight="700">○ magic ring</tspan></text>`,
  )
  parts.push(
    `<text x="${padL}" y="${ly + 20}" font-family="system-ui,Arial" font-size="12" fill="#999">` +
      `Worked corner-to-corner from the lower-left; row 1 at the bottom. Counts in (parentheses) at right.</text>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`
}
