/**
 * CELL ART FOR SAMPLERS — borders, bands and small motifs drawn square by
 * square, the way a counted design actually is.
 *
 * Everything in here is written as a little bitmap on squared paper rather than
 * as a curve that gets rasterised later. A cross-stitch border is a repeat of a
 * unit that has to land on whole squares and meet itself at the corner, and the
 * only way to get that right is to count it. Curves come from the illustrated
 * motifs (`motifs.ts`), which are converted art; these are the parts that have
 * to be exact.
 *
 * A design is accumulated into an `Art` map keyed by cell, so later paint wins
 * over earlier paint and a motif can sit on top of a band without a seam.
 */

export type Art = Map<string, string>

export const artKey = (x: number, y: number): string => `${x},${y}`

export function newArt(): Art {
  return new Map<string, string>()
}

export function paint(art: Art, x: number, y: number, colour: string): void {
  if (!Number.isInteger(x) || !Number.isInteger(y)) return
  art.set(artKey(x, y), colour)
}

/** Every colour used, in first-painted order. */
export function artColours(art: Art): string[] {
  const seen: string[] = []
  for (const c of art.values()) if (!seen.includes(c)) seen.push(c)
  return seen
}

/** Drop everything outside the canvas. Keeps a stray stamp from throwing. */
export function clipArt(art: Art, w: number, h: number): Art {
  const out = newArt()
  for (const [k, c] of art) {
    const [x, y] = k.split(',').map(Number)
    if (x === undefined || y === undefined) continue
    if (x >= 0 && y >= 0 && x < w && y < h) out.set(k, c)
  }
  return out
}

// ───────────────────────────── bitmaps ─────────────────────────────

/**
 * A motif written as rows of characters. `.` and space are holes; every other
 * character is a colour slot filled in by the caller. Written this way the
 * design is readable in the source, which matters because these are the pieces
 * that get counted against a finished photograph.
 */
export type Bitmap = readonly string[]

export function bitmapSize(bm: Bitmap): { w: number; h: number } {
  return { w: Math.max(0, ...bm.map((r) => r.length)), h: bm.length }
}

/**
 * Stamp a bitmap with its top-left at (x, y).
 *
 * `scale` repeats each square, which is how a counted motif is enlarged: a
 * seven-square heart drawn twice the size is a fourteen-square heart with the
 * same shape, not a blurred one. Small motifs on a big piece read as dots
 * otherwise, which is exactly what the first proof sheets showed.
 */
export function stamp(
  art: Art,
  x: number,
  y: number,
  bm: Bitmap,
  colours: Record<string, string>,
  scale = 1,
): void {
  const k = Math.max(1, Math.round(scale))
  for (let r = 0; r < bm.length; r++) {
    const row = bm[r] ?? ''
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (!ch || ch === '.' || ch === ' ') continue
      const colour = colours[ch]
      if (!colour) continue
      for (let dy = 0; dy < k; dy++) {
        for (let dx = 0; dx < k; dx++) paint(art, x + c * k + dx, y + r * k + dy, colour)
      }
    }
  }
}

/** Quarter-turn clockwise. Border tiles are square so the sides reuse the top. */
export function rotate(bm: Bitmap): Bitmap {
  const { w, h } = bitmapSize(bm)
  const out: string[] = []
  for (let c = 0; c < w; c++) {
    let row = ''
    for (let r = h - 1; r >= 0; r--) row += (bm[r] ?? '').padEnd(w, '.')[c] ?? '.'
    out.push(row)
  }
  return out
}

export function flipV(bm: Bitmap): Bitmap {
  return [...bm].reverse()
}

export function flipH(bm: Bitmap): Bitmap {
  return bm.map((r) => [...r].reverse().join(''))
}

// ───────────────────────────── border tiles ─────────────────────────────

/**
 * Square repeat units. Each is `UNIT × UNIT`, so the same tile can be turned a
 * quarter at a time and run down the sides without a redraw, and a border is
 * always a whole number of them.
 */
export const BORDER_UNIT = 8

/** A running zigzag with a dot in each trough. Oldest border there is. */
const TILE_ZIGZAG: Bitmap = [
  'A......A',
  '.A....A.',
  '..A..A..',
  '...AA...',
  '...BB...',
  '..A..A..',
  '.A....A.',
  'A......A',
]

/** Open diamonds joined corner to corner, with a contrast eye. */
const TILE_DIAMOND: Bitmap = [
  '...AA...',
  '..A..A..',
  '.A.BB.A.',
  'A.B..B.A',
  'A.B..B.A',
  '.A.BB.A.',
  '..A..A..',
  '...AA...',
]

/** A chain of small hearts on a rule. */
const TILE_HEART: Bitmap = [
  '........',
  '.AA..AA.',
  'AAAAAAAA',
  'AAAAAAAA',
  '.AAAAAA.',
  '..AAAA..',
  '...AA...',
  'BBBBBBBB',
]

/** Stem with a leaf either side. Reads as a trailing vine when repeated. */
const TILE_VINE: Bitmap = [
  '...AA...',
  '..A..A..',
  '.A....A.',
  'BBBBBBBB',
  'BBBBBBBB',
  '.A....A.',
  '..A..A..',
  '...AA...',
]

/** A meander. Sharp and architectural next to the softer bands. */
const TILE_KEY: Bitmap = [
  'AAAAAAAA',
  'A.......',
  'A.AAAAA.',
  'A.A...A.',
  'A.A.A.A.',
  'A.A.A.A.',
  '..A.A.A.',
  'AAA.AAA.',
]

/** Alternating crosses and squares, the plainest counted band of the lot. */
const TILE_CROSS: Bitmap = [
  '..A..BB.',
  '..A..BB.',
  'AAAAA...',
  '..A.....',
  '..A..BB.',
  '.....BB.',
  'AAAAA...',
  '..A.....',
]

/** Scalloped shells, for the softer nursery and coastal pieces. */
const TILE_SCALLOP: Bitmap = [
  '...AA...',
  '..A..A..',
  '.A....A.',
  'A......A',
  'A..BB..A',
  '.A.BB.A.',
  '..A..A..',
  '...AA...',
]

/** Tiny stars on a plain ground, for the celestial and night-time pieces. */
const TILE_STAR: Bitmap = [
  '...A....',
  '...A....',
  '.A.A.A..',
  '..AAA...',
  'AAAAAAA.',
  '..AAA...',
  '.A.A.A..',
  '...A....',
]

export const BORDER_TILES = {
  zigzag: TILE_ZIGZAG,
  diamond: TILE_DIAMOND,
  heart: TILE_HEART,
  vine: TILE_VINE,
  key: TILE_KEY,
  cross: TILE_CROSS,
  scallop: TILE_SCALLOP,
  star: TILE_STAR,
} as const

export type BorderTile = keyof typeof BORDER_TILES

// ───────────────────────────── spot motifs ─────────────────────────────

const M_HEART: Bitmap = [
  '.AA.AA.',
  'AAAAAAA',
  'AAAAAAA',
  'AAAAAAA',
  '.AAAAA.',
  '..AAA..',
  '...A...',
]

const M_FLOWER: Bitmap = [
  '..AA..',
  '.AAAA.',
  'AABBAA',
  'AABBAA',
  '.AAAA.',
  '..AA..',
]

const M_LEAF: Bitmap = [
  '....AA',
  '..AAAA',
  '.AAABA',
  'AAABA.',
  'AABA..',
  'ABA...',
  'BA....',
]

const M_STAR: Bitmap = [
  '...A...',
  '...A...',
  'A..A..A',
  '.AAAAA.',
  '..AAA..',
  '.AA.AA.',
  'A.....A',
]

const M_ACORN: Bitmap = [
  '...B...',
  'BBBBBBB',
  'BBBBBBB',
  '.AAAAA.',
  '.AAAAA.',
  '..AAA..',
  '...A...',
]

const M_BIRD: Bitmap = [
  '....AAA..',
  '...AAAAA.',
  '..AABAAA.',
  '.AAAAAAA.',
  'CAAAAAA..',
  '.AAAAA...',
  '..AAA....',
  '...A.A...',
]

const M_BEE: Bitmap = [
  'C.....C',
  '.CC.CC.',
  '.AAAAA.',
  'ABBBBBA',
  'AAAAAAA',
  'ABBBBBA',
  '.AAAAA.',
]

const M_HOUSE: Bitmap = [
  '....A....',
  '...AAA...',
  '..AAAAA..',
  '.AAAAAAA.',
  'AAAAAAAAA',
  'BBBCBBBBB',
  'BBBCBBDDB',
  'BBBCBBDDB',
]

const M_RINGS: Bitmap = [
  '..AAA...AAA..',
  '.A...A.A...A.',
  'A.....A.....A',
  'A....A.A....A',
  'A.....A.....A',
  '.A...A.A...A.',
  '..AAA...AAA..',
]

const M_SPRIG: Bitmap = [
  '.....B',
  '....B.',
  '.A.B..',
  '..AB..',
  '.ABA..',
  'B.A...',
  'B.....',
]

const M_PRAM: Bitmap = [
  '...AAAAA.',
  '..AAAAAAA',
  '.AAAAAAAA',
  'AAAAAAAAA',
  'AAAAAAAAA',
  '.BB...BB.',
  'B..B.B..B',
  '.BB...BB.',
]

const M_BOAT: Bitmap = [
  '....A....',
  '....AA...',
  '...AAAA..',
  '..AAAAAA.',
  '.BAAAAAAA',
  '....A....',
  'CCCCCCCCC',
  '.CCCCCCC.',
]

const M_KEY_MOTIF: Bitmap = [
  '.AA..',
  'A..A.',
  'A..A.',
  '.AA..',
  '..A..',
  '..AA.',
  '..A..',
  '..AA.',
]

const M_CAKE: Bitmap = [
  '..B.B..',
  '..A.A..',
  'CCCCCCC',
  'CAACAAC',
  'CCCCCCC',
  'CAACAAC',
  'CCCCCCC',
]

export const SPOT_MOTIFS = {
  heart: M_HEART,
  flower: M_FLOWER,
  leaf: M_LEAF,
  star: M_STAR,
  acorn: M_ACORN,
  bird: M_BIRD,
  bee: M_BEE,
  house: M_HOUSE,
  rings: M_RINGS,
  sprig: M_SPRIG,
  pram: M_PRAM,
  boat: M_BOAT,
  key: M_KEY_MOTIF,
  cake: M_CAKE,
} as const

export type SpotMotif = keyof typeof SPOT_MOTIFS

// ───────────────────────────── borders ─────────────────────────────

export interface BorderSpec {
  /** Which repeat unit. */
  tile: BorderTile
  /** Cells between the border and the edge of the linen. */
  inset: number
  /** Run the band around all four sides, or only across the top and bottom. */
  sides: 'all' | 'top-bottom'
  /** A plain rule just inside the band. */
  rule?: boolean
  /** Colour slots A and B in the tile, plus the rule. */
  colourA: string
  colourB: string
  colourRule?: string
}

/**
 * Draw a border. The repeat is centred on each run so the two ends match, and
 * the corners are filled with a small solid block: a mitred corner on a counted
 * border either takes a bespoke corner unit per tile or a block, and the block
 * is what most published charts actually use.
 */
export function drawBorder(art: Art, w: number, h: number, spec: BorderSpec): void {
  const tile = BORDER_TILES[spec.tile]
  const u = BORDER_UNIT
  const cols = { A: spec.colourA, B: spec.colourB }
  const inset = spec.inset

  const runLeft = inset
  const runRight = w - inset
  const runTop = inset
  const runBottom = h - inset

  const across = runRight - runLeft
  const down = runBottom - runTop

  const hTiles = Math.max(1, Math.floor((across - (spec.sides === 'all' ? 2 * u : 0)) / u))
  const hStart = runLeft + (spec.sides === 'all' ? u : 0) + Math.floor((across - (spec.sides === 'all' ? 2 * u : 0) - hTiles * u) / 2)

  for (let i = 0; i < hTiles; i++) {
    stamp(art, hStart + i * u, runTop, tile, cols)
    stamp(art, hStart + i * u, runBottom - u, flipV(tile), cols)
  }

  if (spec.sides === 'all') {
    const side = rotate(tile)
    const vTiles = Math.max(1, Math.floor((down - 2 * u) / u))
    const vStart = runTop + u + Math.floor((down - 2 * u - vTiles * u) / 2)
    for (let i = 0; i < vTiles; i++) {
      stamp(art, runLeft, vStart + i * u, side, cols)
      stamp(art, runRight - u, vStart + i * u, flipH(side), cols)
    }
    // Corner blocks — a solid square of the tile's main colour, which is how a
    // counted border turns a corner without a bespoke corner unit.
    for (const [cx, cy] of [
      [runLeft, runTop],
      [runRight - u, runTop],
      [runLeft, runBottom - u],
      [runRight - u, runBottom - u],
    ] as const) {
      drawCornerBlock(art, cx, cy, u, spec.colourA, spec.colourB)
    }
  }

  if (spec.rule) {
    const rc = spec.colourRule ?? spec.colourA
    const rl = runLeft + (spec.sides === 'all' ? u + 2 : 2)
    const rr = runRight - (spec.sides === 'all' ? u + 3 : 3)
    const rt = runTop + u + 2
    const rb = runBottom - u - 3
    drawRect(art, rl, rt, rr, rb, rc)
  }
}

/** A pierced square: solid ring with an eye, so the corner reads as designed. */
function drawCornerBlock(art: Art, x: number, y: number, u: number, a: string, b: string): void {
  for (let r = 0; r < u; r++) {
    for (let c = 0; c < u; c++) {
      const edge = r === 0 || c === 0 || r === u - 1 || c === u - 1
      const eye = r >= 3 && r <= u - 4 && c >= 3 && c <= u - 4
      if (edge) paint(art, x + c, y + r, a)
      else if (eye) paint(art, x + c, y + r, b)
    }
  }
}

/** A one-cell rectangle outline. */
export function drawRect(art: Art, x1: number, y1: number, x2: number, y2: number, colour: string): void {
  for (let x = x1; x <= x2; x++) {
    paint(art, x, y1, colour)
    paint(art, x, y2, colour)
  }
  for (let y = y1; y <= y2; y++) {
    paint(art, x1, y, colour)
    paint(art, x2, y, colour)
  }
}

/** A horizontal rule, one or two cells deep. */
export function drawRule(art: Art, x1: number, x2: number, y: number, colour: string, weight = 1): void {
  for (let d = 0; d < weight; d++) for (let x = x1; x <= x2; x++) paint(art, x, y + d, colour)
}

/**
 * The alphabet band a traditional sampler opens with. Drawn from the lettering
 * set rather than a bitmap so it matches the piece's own letterform, and handed
 * back as a mask for the caller to place.
 */
export const ALPHABET_ROW = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** A row of evenly spaced spot motifs, centred on the given band. */
export function motifRow(
  art: Art,
  opts: {
    motif: SpotMotif
    count: number
    left: number
    right: number
    top: number
    colours: Record<string, string>
    scale?: number
  },
): void {
  const bm = SPOT_MOTIFS[opts.motif]
  const k = Math.max(1, Math.round(opts.scale ?? 1))
  const { w } = bitmapSize(bm)
  const span = opts.right - opts.left
  if (opts.count < 1 || span < w * k) return
  const step = opts.count === 1 ? 0 : (span - w * k) / (opts.count - 1)
  for (let i = 0; i < opts.count; i++) {
    stamp(art, Math.round(opts.left + i * step), opts.top, bm, opts.colours, k)
  }
}

/** One spot motif with its centre at (cx, cy). */
export function motifAt(
  art: Art,
  motif: SpotMotif,
  cx: number,
  cy: number,
  colours: Record<string, string>,
  scale = 1,
): void {
  const bm = SPOT_MOTIFS[motif]
  const k = Math.max(1, Math.round(scale))
  const { w, h } = bitmapSize(bm)
  stamp(art, Math.round(cx - (w * k) / 2), Math.round(cy - (h * k) / 2), bm, colours, k)
}

/**
 * Clear a rectangle of art. Designs call this over a lettering slot so the
 * words sit on bare linen: type set straight over a wreath is unreadable, and
 * the gaps between the letters are where it shows.
 */
export function clearRegion(
  art: Art,
  region: { x: number; y: number; w: number; h: number },
): void {
  for (let y = region.y; y < region.y + region.h; y++) {
    for (let x = region.x; x < region.x + region.w; x++) art.delete(artKey(x, y))
  }
}

/** Clear an ellipse of art, for a wreath that wants a round opening. */
export function clearEllipse(art: Art, cx: number, cy: number, rx: number, ry: number): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      if (dx * dx + dy * dy <= 1) art.delete(artKey(x, y))
    }
  }
}

/** Merge one art layer onto another at an offset. Later paint wins. */
export function blit(target: Art, source: Art, dx: number, dy: number): void {
  for (const [k, c] of source) {
    const [x, y] = k.split(',').map(Number)
    if (x === undefined || y === undefined) continue
    paint(target, x + dx, y + dy, c)
  }
}

/** Bounding box of everything painted, or null for an empty canvas. */
export function artBounds(
  art: Art,
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const k of art.keys()) {
    const [x, y] = k.split(',').map(Number)
    if (x === undefined || y === undefined) continue
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null
}

/**
 * Remove specks: any island of painted cells smaller than `minCells`.
 *
 * Converted art comes with litter. A stray six-cell smudge where the
 * illustrator signed its work, a dot of noise in the sky, a single square of a
 * colour nothing else uses. On a photograph nobody notices; on a chart every one
 * of them is a thread you have to start, work one stitch of, and finish, and a
 * line in the floss key. Islands are found by four-way adjacency across all
 * colours, so a small eye inside a face survives (it touches the face) while a
 * detached mark does not.
 */
export function despeckle(art: Art, minCells: number): number {
  if (minCells <= 1) return 0
  const seen = new Set<string>()
  let removed = 0
  for (const key of art.keys()) {
    if (seen.has(key)) continue
    const island: string[] = []
    const stack = [key]
    seen.add(key)
    while (stack.length > 0) {
      const k = stack.pop()!
      island.push(k)
      const [x, y] = k.split(',').map(Number)
      if (x === undefined || y === undefined) continue
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const n = artKey(x + dx, y + dy)
        if (!seen.has(n) && art.has(n)) {
          seen.add(n)
          stack.push(n)
        }
      }
    }
    if (island.length < minCells) {
      for (const k of island) art.delete(k)
      removed += island.length
    }
  }
  return removed
}

/**
 * The biggest empty rectangle round a point.
 *
 * A wreath's opening is whatever the illustrator left in the middle, and it is
 * never quite where you would guess. Rather than hard-coding a slot and hoping,
 * the designs that set words inside art measure the hole and put the type in
 * what is actually there. Grows a rectangle out from the seed a line at a time,
 * taking the cheapest expansion each round, and stops when no side can move.
 */
export function clearBoxAround(
  art: Art,
  w: number,
  h: number,
  seedX: number,
  seedY: number,
  opts: { margin?: number; maxAspect?: number } = {},
): { x: number; y: number; w: number; h: number } {
  const margin = opts.margin ?? 2
  const cx = Math.max(0, Math.min(w - 1, Math.round(seedX)))
  const cy = Math.max(0, Math.min(h - 1, Math.round(seedY)))
  let x1 = cx
  let x2 = cx
  let y1 = cy
  let y2 = cy
  if (art.has(artKey(cx, cy))) return { x: cx, y: cy, w: 0, h: 0 }

  const rowClear = (y: number, a: number, b: number): boolean => {
    if (y < 0 || y >= h) return false
    for (let x = a; x <= b; x++) if (art.has(artKey(x, y))) return false
    return true
  }
  const colClear = (x: number, a: number, b: number): boolean => {
    if (x < 0 || x >= w) return false
    for (let y = a; y <= b; y++) if (art.has(artKey(x, y))) return false
    return true
  }

  let moved = true
  while (moved) {
    moved = false
    // Widen before heightening: lettering is wider than it is tall, so a slot
    // that grows sideways first ends up the shape the words actually want.
    if (colClear(x1 - 1, y1, y2)) {
      x1--
      moved = true
    }
    if (colClear(x2 + 1, y1, y2)) {
      x2++
      moved = true
    }
    const aspect = (x2 - x1 + 1) / Math.max(1, y2 - y1 + 1)
    if (!opts.maxAspect || aspect > 1) {
      if (rowClear(y1 - 1, x1, x2)) {
        y1--
        moved = true
      }
      if (rowClear(y2 + 1, x1, x2)) {
        y2++
        moved = true
      }
    }
  }

  const x = x1 + margin
  const y = y1 + margin
  return {
    x,
    y,
    w: Math.max(0, x2 - x1 + 1 - margin * 2),
    h: Math.max(0, y2 - y1 + 1 - margin * 2),
  }
}
