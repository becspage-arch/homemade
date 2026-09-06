/**
 * Parking — the working method dense charts are stitched with.
 *
 * A parker works one row (or column, or 10x10 block) at a time rather than
 * one colour at a time. When a colour's run inside the current line ends,
 * the needle is left hanging in the next square where that same colour
 * appears further along the working order. Nothing is counted twice and no
 * needle is ever hunted for.
 *
 * This module is the whole computation, kept pure: no React, no store, no
 * DOM. It turns a pattern plus a working direction into per-colour ordered
 * cell lists, then answers "where is this colour parked?" in constant
 * amortised time as cells are marked stitched and unmarked again.
 *
 * Shape of the data
 * -----------------
 * Every cell gets a `rank`: its position in the chosen working order.
 * Ranks only ever get compared, so the gaps that partial edge blocks leave
 * in the block ordering do not matter.
 *
 *   rows     rank = y * width + x            line = y      (the row)
 *   columns  rank = x * height + y           line = x      (the column)
 *   blocks   10x10 blocks in reading order,  line = block index
 *            rows inside each block
 *
 * Cost
 * ----
 * `buildParkingIndex` is one pass plus one sort over the stitched cells,
 * paid once per working order and then reused. After that:
 *
 *   applyMark        O(1)
 *   parkedCellFor    O(1) amortised (each colour's cursor only walks
 *                    forward, so the whole session costs one pass over
 *                    that colour's cells)
 *   refreshParked    O(colours) amortised, independent of chart size
 *
 * An unmark (undo, or tapping a finished square again) rewinds the affected
 * colour's cursor straight to that cell's slot, which is O(1) because the
 * slot is stored in a lookup rather than searched for.
 */

import { cellKey, type PatternData } from '@homemade/db/pattern'

/** The working orders a stitcher can pick between. */
export type ParkingDirection = 'rows' | 'columns' | 'blocks'

export const PARKING_DIRECTIONS: ParkingDirection[] = ['rows', 'columns', 'blocks']

/** Side of the square block the "blocks" working order walks. Ten matches
 *  the heavy grid rule every chart is drawn with, which is the whole reason
 *  grid parkers count in tens. */
export const PARKING_BLOCK_SIZE = 10

export const DEFAULT_PARKING_DIRECTION: ParkingDirection = 'rows'

/** A cell in working order. `rank` is its position in that order. */
export interface ParkedCell {
  x: number
  y: number
  rank: number
}

export interface ParkingIndex {
  direction: ParkingDirection
  width: number
  height: number
  /** How many lines the working order splits the chart into. */
  lineCount: number
  /** Palette symbol -> that colour's cells, sorted by rank. */
  bySymbol: Map<string, ParkedCell[]>
  /** Cell key -> the cell's slot inside its colour's array. */
  slot: Map<string, number>
  /** Cell key -> the palette symbol drawn there. */
  symbolAt: Map<string, string>
  /** Palette symbol -> first slot that might still be unstitched. */
  cursor: Map<string, number>
  /** Line index -> how many of its cells are still unstitched. */
  lineRemaining: Int32Array
}

// ───────────────────────────────────────────────────────────────────────────
// Ordering
// ───────────────────────────────────────────────────────────────────────────

/** Position of a cell in the given working order. Comparable, not dense. */
export function cellRank(
  x: number,
  y: number,
  direction: ParkingDirection,
  width: number,
  height: number,
): number {
  if (direction === 'columns') return x * height + y
  if (direction === 'blocks') {
    const b = PARKING_BLOCK_SIZE
    const blocksPerRow = Math.ceil(width / b)
    const blockIndex = Math.floor(y / b) * blocksPerRow + Math.floor(x / b)
    return blockIndex * b * b + (y % b) * b + (x % b)
  }
  return y * width + x
}

/** One past the highest rank the working order can produce for this grid.
 *  Rows and columns are dense; blocks leave gaps in the partial edge
 *  blocks, which costs a little scratch space and nothing else. */
function maxRankFor(direction: ParkingDirection, width: number, height: number): number {
  if (direction === 'blocks') {
    const b = PARKING_BLOCK_SIZE
    return Math.ceil(width / b) * Math.ceil(height / b) * b * b
  }
  return width * height
}

/** Which line (row / column / block) a cell belongs to. */
export function lineIndexOf(
  x: number,
  y: number,
  direction: ParkingDirection,
  width: number,
): number {
  if (direction === 'columns') return x
  if (direction === 'blocks') {
    const b = PARKING_BLOCK_SIZE
    return Math.floor(y / b) * Math.ceil(width / b) + Math.floor(x / b)
  }
  return y
}

/** How many lines the working order splits a grid of this size into. */
export function lineCountFor(
  direction: ParkingDirection,
  width: number,
  height: number,
): number {
  if (direction === 'columns') return width
  if (direction === 'blocks') {
    const b = PARKING_BLOCK_SIZE
    return Math.ceil(width / b) * Math.ceil(height / b)
  }
  return height
}

/**
 * Inclusive cell bounds of one line, for the highlight the viewport draws.
 * Bounds are clamped to the grid so a partial edge block reads correctly.
 */
export function lineBounds(
  line: number,
  direction: ParkingDirection,
  width: number,
  height: number,
): { x0: number; y0: number; x1: number; y1: number } {
  if (direction === 'columns') {
    const x = clamp(line, 0, width - 1)
    return { x0: x, y0: 0, x1: x, y1: height - 1 }
  }
  if (direction === 'blocks') {
    const b = PARKING_BLOCK_SIZE
    const blocksPerRow = Math.ceil(width / b)
    const total = blocksPerRow * Math.ceil(height / b)
    const idx = clamp(line, 0, Math.max(0, total - 1))
    const bx = idx % blocksPerRow
    const by = Math.floor(idx / blocksPerRow)
    return {
      x0: bx * b,
      y0: by * b,
      x1: Math.min(width - 1, bx * b + b - 1),
      y1: Math.min(height - 1, by * b + b - 1),
    }
  }
  const y = clamp(line, 0, height - 1)
  return { x0: 0, y0: y, x1: width - 1, y1: y }
}

/** Human wording for a line, used in copy: "row 41", "block 7". */
export function lineLabel(line: number, direction: ParkingDirection): string {
  if (direction === 'columns') return `column ${line + 1}`
  if (direction === 'blocks') return `block ${line + 1}`
  return `row ${line + 1}`
}

/** Human wording for a cell position: "row 41, col 12". One-based, because
 *  that is how a stitcher counts squares off a printed chart. */
export function cellLabel(cell: { x: number; y: number }): string {
  return `row ${cell.y + 1}, col ${cell.x + 1}`
}

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n
}

// ───────────────────────────────────────────────────────────────────────────
// Building the index
// ───────────────────────────────────────────────────────────────────────────

/**
 * Build the per-colour ordered cell lists for one working order. Paid once
 * per direction; every parked-position answer afterwards reads off it.
 */
export function buildParkingIndex(
  pattern: PatternData,
  direction: ParkingDirection,
): ParkingIndex {
  const width = pattern.grid.width
  const height = pattern.grid.height
  const lines = lineCountFor(direction, width, height)

  const bySymbol = new Map<string, ParkedCell[]>()
  const slot = new Map<string, number>()
  const symbolAt = new Map<string, string>()
  const cursor = new Map<string, number>()
  const lineRemaining = new Int32Array(lines)

  // Palette order seeds the map so a colour with no cells still answers
  // "nothing parked" rather than being absent.
  for (const entry of pattern.palette) bySymbol.set(entry.symbol, [])

  // Bucket the cells by rank rather than sorting them. Ranks are dense
  // enough (at most one slot per grid square, plus the unused corners of
  // partial edge blocks) that a single scratch array beats a comparison
  // sort, and it keeps the build to one pass per cell.
  const maxRank = maxRankFor(direction, width, height)
  const rankToCell = new Int32Array(maxRank).fill(-1)
  const cells = pattern.grid.cells
  // Cell keys are built once and kept, so the second pass never pays for
  // the same string twice. On a 240x255 chart that is 61,200 strings
  // instead of 122,400.
  const keys = new Array<string>(cells.length)
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]!
    // Cells outside the declared grid would corrupt the line counters, so
    // they are skipped rather than trusted.
    if (cell.x < 0 || cell.y < 0 || cell.x >= width || cell.y >= height) continue
    rankToCell[cellRank(cell.x, cell.y, direction, width, height)] = i
    const k = cellKey(cell.x, cell.y)
    keys[i] = k
    symbolAt.set(k, cell.s)
  }

  for (let rank = 0; rank < maxRank; rank++) {
    const i = rankToCell[rank]!
    if (i < 0) continue
    const cell = cells[i]!
    let bucket = bySymbol.get(cell.s)
    if (!bucket) {
      bucket = []
      bySymbol.set(cell.s, bucket)
    }
    slot.set(keys[i]!, bucket.length)
    bucket.push({ x: cell.x, y: cell.y, rank })
  }
  for (const symbol of bySymbol.keys()) cursor.set(symbol, 0)

  const index: ParkingIndex = {
    direction,
    width,
    height,
    lineCount: lines,
    bySymbol,
    slot,
    symbolAt,
    cursor,
    lineRemaining,
  }
  resetProgress(index, new Set())
  return index
}

/**
 * Rebuild every cursor and line counter from a progress set. Used on first
 * load, after a cross-device sync lands a different progress set, and after
 * "clear all stitched". One pass over the chart.
 */
export function resetProgress(index: ParkingIndex, stitched: ReadonlySet<string>): void {
  index.lineRemaining.fill(0)
  for (const [symbol, cells] of index.bySymbol) {
    for (const c of cells) {
      if (stitched.has(cellKey(c.x, c.y))) continue
      index.lineRemaining[lineIndexOf(c.x, c.y, index.direction, index.width)]! += 1
    }
    // The cursor sits on the first cell that is not already finished.
    let cur = 0
    while (cur < cells.length && stitched.has(cellKey(cells[cur]!.x, cells[cur]!.y))) cur++
    index.cursor.set(symbol, cur)
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Reading and updating
// ───────────────────────────────────────────────────────────────────────────

/**
 * Record one cell changing state. O(1): the line counter moves by one, and
 * an unmark rewinds that colour's cursor straight to the freed slot.
 *
 * `symbol` is optional; when it is left out the index looks the cell up.
 */
export function applyMark(
  index: ParkingIndex,
  x: number,
  y: number,
  value: boolean,
  symbol?: string,
): void {
  const k = cellKey(x, y)
  const sym = symbol ?? index.symbolAt.get(k)
  if (!sym) return
  const line = lineIndexOf(x, y, index.direction, index.width)
  if (line < 0 || line >= index.lineRemaining.length) return
  if (value) {
    index.lineRemaining[line]! -= 1
  } else {
    index.lineRemaining[line]! += 1
    const s = index.slot.get(k)
    if (s !== undefined) {
      const cur = index.cursor.get(sym)
      if (cur === undefined || s < cur) index.cursor.set(sym, s)
    }
  }
}

/**
 * Where this colour is parked: its first unstitched cell in working order,
 * or null when the colour is finished. Amortised O(1) — the cursor only
 * walks forward, and an unmark rewinds it directly.
 */
export function parkedCellFor(
  index: ParkingIndex,
  symbol: string,
  stitched: ReadonlySet<string>,
): ParkedCell | null {
  const cells = index.bySymbol.get(symbol)
  if (!cells || cells.length === 0) return null
  let cur = index.cursor.get(symbol) ?? 0
  while (cur < cells.length && stitched.has(cellKey(cells[cur]!.x, cells[cur]!.y))) cur++
  index.cursor.set(symbol, cur)
  return cur < cells.length ? cells[cur]! : null
}

/** Every colour's parked cell in one map. O(colours), amortised. */
export function refreshParked(
  index: ParkingIndex,
  stitched: ReadonlySet<string>,
): Map<string, ParkedCell> {
  const out = new Map<string, ParkedCell>()
  for (const symbol of index.bySymbol.keys()) {
    const cell = parkedCellFor(index, symbol, stitched)
    if (cell) out.set(symbol, cell)
  }
  return out
}

/**
 * The colour to pick up next: the one parked earliest in working order.
 * Ties cannot happen because two colours never share a square.
 */
export function nextColourUp(parked: ReadonlyMap<string, ParkedCell>): string | null {
  let bestSymbol: string | null = null
  let bestRank = Infinity
  for (const [symbol, cell] of parked) {
    if (cell.rank < bestRank) {
      bestRank = cell.rank
      bestSymbol = symbol
    }
  }
  return bestSymbol
}

/** Does this line still hold unstitched squares? */
export function lineHasWork(index: ParkingIndex, line: number): boolean {
  if (line < 0 || line >= index.lineRemaining.length) return false
  return index.lineRemaining[line]! > 0
}

/**
 * First line at or after `from` that still has work, wrapping once to the
 * start so finishing the last row sends the stitcher back to anything left
 * behind. Returns `from` when the whole chart is done.
 */
export function nextLineWithWork(index: ParkingIndex, from: number): number {
  const n = index.lineRemaining.length
  if (n === 0) return 0
  const start = clamp(from, 0, n - 1)
  for (let i = start; i < n; i++) if (index.lineRemaining[i]! > 0) return i
  for (let i = 0; i < start; i++) if (index.lineRemaining[i]! > 0) return i
  return start
}

/** Previous line with work, wrapping backwards. Powers the "back a row" step. */
export function previousLineWithWork(index: ParkingIndex, from: number): number {
  const n = index.lineRemaining.length
  if (n === 0) return 0
  const start = clamp(from, 0, n - 1)
  for (let i = start - 1; i >= 0; i--) if (index.lineRemaining[i]! > 0) return i
  for (let i = n - 1; i > start; i--) if (index.lineRemaining[i]! > 0) return i
  return start
}

/** Coerce a stored string back to a direction, falling back to rows. */
export function parseParkingDirection(raw: string | null | undefined): ParkingDirection {
  return raw === 'columns' || raw === 'blocks' || raw === 'rows' ? raw : DEFAULT_PARKING_DIRECTION
}
