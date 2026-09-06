/**
 * Chart symbol assignment.
 *
 * A cross-stitch chart is only as good as its symbols. Two colours that sit
 * next to each other in the picture and carry near-identical glyphs — ◐ beside
 * ◑, ▴ beside ▵, ○ beside ◯ — cost the stitcher a trip to the key on every
 * stitch, and that is the complaint dense charts attract most often.
 *
 * So symbols are not handed out in catalogue order. Every glyph carries two
 * pieces of metadata:
 *
 *   family  A confusable group. Glyphs in one family read as the same mark at
 *           printed size: the half-filled circles are one family, the small
 *           triangles another, filled and hollow of the same outline a third.
 *           Two colours that touch in the chart never share a family, and two
 *           colours that look alike never share one either.
 *
 *   weight  'light' for hollow, thin-stroke glyphs; 'solid' for everything
 *           with real ink in it. The renderer draws a symbol in near-white on
 *           a dark cell and near-black on a pale one (`symbolOnFill`), so a
 *           light glyph earns its keep on dark floss and disappears on pale
 *           floss. Light glyphs are therefore reserved for dark floss.
 *
 * The catalogue is ordered most-distinctive first, and colours are served in
 * descending stitch count, so the colours the stitcher meets most often get
 * the marks that are hardest to mistake.
 *
 * Constraints are relaxed in a fixed order when a palette runs the pool dry,
 * and the adjacency rule is the very last to go — a confusable pair is
 * tolerable between two colours that never meet on the cloth, and never
 * tolerable between two that do.
 */

export type SymbolWeight = 'light' | 'solid'

export interface SymbolSpec {
  glyph: string
  /** Confusable group. Glyphs sharing one read as the same mark when small. */
  family: string
  weight: SymbolWeight
}

/**
 * Confusable groups, in catalogue order — most distinctive first.
 *
 * The head of the list is the set of marks a stitcher can tell apart across a
 * room: a cross, a disc, a triangle, a square, a diamond, a star, the card
 * suits. Letters and digits follow (legible, but a chart of nothing but
 * letters is hard to scan), then the geometric fill variants, then the
 * quadrant and block glyphs that only earn a place on a very dense chart.
 *
 * Every glyph here is inside the ranges DejaVu Sans covers, which is the font
 * the chart renderer and the PDF export both embed, so none render as tofu.
 */
const FAMILY_ORDER: Array<{ family: string; glyphs: string[] }> = [
  // ── Tier A: the iconic marks, readable across a room ───────────────────
  { family: 'ex', glyphs: ['×', '✕', 'X'] },
  { family: 'circle', glyphs: ['●', '○', '◯', '◌'] },
  { family: 'triangle-up', glyphs: ['▲', '△'] },
  { family: 'square', glyphs: ['■', '□', '▣', '▢'] },
  { family: 'diamond', glyphs: ['◆', '◇'] },
  { family: 'star', glyphs: ['★', '☆'] },
  { family: 'plus', glyphs: ['✚', '✜'] },
  { family: 'heart', glyphs: ['♥', '♡'] },
  { family: 'spade', glyphs: ['♠', '♤'] },
  { family: 'club', glyphs: ['♣', '♧'] },
  { family: 'suit-diamond', glyphs: ['♦', '♢'] },
  { family: 'sparkle', glyphs: ['✦', '✱', '✧'] },
  { family: 'polygon', glyphs: ['⬟', '⬢', '⬣'] },
  { family: 'circle-dot', glyphs: ['◉', '◎', '◍'] },
  { family: 'triangle-large', glyphs: ['►', '◄', '▻', '◅'] },
  // The small directional triangles are one group: at printed size ▴ ▵ ▸ ▹
  // ▾ ▿ ◂ ◃ are the same speck of ink pointing somewhere.
  { family: 'triangle-small', glyphs: ['▴', '▵', '▸', '▹', '▾', '▿', '◂', '◃'] },
  { family: 'half-circle', glyphs: ['◐', '◑', '◒', '◓'] },

  // ── Tier B: letters and digits, one family per confusable set ──────────
  { family: 'oval', glyphs: ['O', '0', 'Q', 'D'] },
  { family: 'ess', glyphs: ['S', 's', '5'] },
  { family: 'aitch', glyphs: ['H', 'h'] },
  { family: 'em', glyphs: ['M', 'm'] },
  { family: 'dubya', glyphs: ['W', 'w'] },
  { family: 'kay', glyphs: ['K', 'k'] },
  { family: 'ay', glyphs: ['A', 'a'] },
  { family: 'eff', glyphs: ['E', 'F'] },
  { family: 'eff-lower', glyphs: ['e', 'f'] },
  { family: 'arr', glyphs: ['R', 'r'] },
  { family: 'tee', glyphs: ['T', 't'] },
  { family: 'zed', glyphs: ['Z', 'z', '2'] },
  { family: 'gee', glyphs: ['G', '6'] },
  { family: 'nine', glyphs: ['9', 'g', 'q'] },
  { family: 'bee', glyphs: ['B', '8', 'b'] },
  { family: 'pee', glyphs: ['P', 'p'] },
  { family: 'en', glyphs: ['N', 'n'] },
  { family: 'why', glyphs: ['Y', 'y'] },
  { family: 'cee', glyphs: ['C', 'c'] },
  { family: 'yoo', glyphs: ['U', 'u'] },
  { family: 'vee', glyphs: ['V', 'v'] },
  { family: 'jay', glyphs: ['J', 'j'] },
  { family: 'ell', glyphs: ['L'] },
  { family: 'eye', glyphs: ['I', '1'] },
  { family: 'dee', glyphs: ['d'] },
  { family: 'three', glyphs: ['3'] },
  { family: 'four', glyphs: ['4'] },
  { family: 'seven', glyphs: ['7'] },

  // ── Tier C: partly-filled shapes ───────────────────────────────────────
  { family: 'quarter-circle', glyphs: ['◔', '◕'] },
  { family: 'half-disc', glyphs: ['◖', '◗'] },
  { family: 'inverse-circle', glyphs: ['◘', '◙'] },
  { family: 'half-square', glyphs: ['◧', '◨', '◩', '◪', '◫'] },
  { family: 'quadrant-square', glyphs: ['◰', '◱', '◲', '◳'] },
  { family: 'quadrant-circle', glyphs: ['◴', '◵', '◶', '◷'] },
  { family: 'corner-triangle', glyphs: ['◢', '◣', '◤', '◥'] },
  { family: 'bar-horizontal', glyphs: ['▬', '▭'] },
  { family: 'bar-vertical', glyphs: ['▮', '▯'] },
  { family: 'parallelogram', glyphs: ['▰', '▱'] },

  // ── Tier D: hatches and blocks — only reached on a very dense chart ────
  { family: 'square-lined', glyphs: ['▤', '▥'] },
  { family: 'square-grid', glyphs: ['▦', '▩'] },
  { family: 'square-diagonal', glyphs: ['▧', '▨'] },
  { family: 'block-large', glyphs: ['▙', '▛', '▜', '▟'] },
  { family: 'block-diagonal', glyphs: ['▚', '▞'] },
  { family: 'block-small', glyphs: ['▖', '▗', '▘', '▝'] },
]

/**
 * Hollow and thin-stroke glyphs. The renderer draws a symbol in near-white on
 * a dark cell, so these read well there and wash out on pale floss.
 */
const LIGHT_GLYPHS = new Set([
  '○', '◯', '◌', '◎', '△', '▵', '▿', '▹', '◃', '▻', '◅',
  '□', '▢', '◇', '☆', '♤', '♧', '♡', '♢', '✧',
  '▭', '▯', '▱', 'I', '1', 'J', 'j', 'T', 't', 'v', 'y', 'r', 'c', '7',
])

/**
 * Flattened round-robin: one glyph from every family before any family gives
 * up a second. The first pass through the catalogue is therefore a set of
 * mutually distinct marks, which is what a chart of forty colours draws on,
 * and the later passes are the variants a showpiece needs.
 */
export const SYMBOL_SPECS: SymbolSpec[] = (() => {
  const out: SymbolSpec[] = []
  const deepest = Math.max(...FAMILY_ORDER.map((f) => f.glyphs.length))
  for (let round = 0; round < deepest; round++) {
    for (const f of FAMILY_ORDER) {
      const glyph = f.glyphs[round]
      if (glyph === undefined) continue
      out.push({
        glyph,
        family: f.family,
        weight: LIGHT_GLYPHS.has(glyph) ? 'light' : 'solid',
      })
    }
  }
  return out
})()

/** Catalogue order, distinctive first. The chart symbol vocabulary. */
export const SYMBOL_GLYPHS: string[] = SYMBOL_SPECS.map((s) => s.glyph)

const SPEC_BY_GLYPH = new Map(SYMBOL_SPECS.map((s) => [s.glyph, s]))

export function symbolSpec(glyph: string): SymbolSpec | undefined {
  return SPEC_BY_GLYPH.get(glyph)
}

/**
 * Luminance cut at which the renderer switches from dark ink to light ink
 * (`symbolOnFill` in render-helpers). At or below it the glyph is drawn in
 * near-white, which is exactly where a light-weight glyph belongs.
 */
const DARK_FLOSS_LUMINANCE = 0.58

/**
 * Two colours closer than this in RGB read as the same colour on a printed
 * chart, so they get glyphs from different families even when they never
 * touch. 52 is about the gap between two adjacent DMC shades of one hue.
 */
const CLOSE_COLOUR_DISTANCE = 52

export interface SymbolColour {
  /** Caller's stable id for the colour — a floss code, usually. */
  key: string
  /** '#rrggbb' as the chart will print it. */
  rgb: string
  /** Stitch count. The busiest colours are served first. */
  count: number
}

/**
 * Assign one distinct glyph per colour.
 *
 * `adjacency` maps a colour key to the keys it touches anywhere in the chart
 * (8-neighbourhood). Pass an empty map to assign on colour similarity alone.
 *
 * Returns key → glyph. When there are more colours than glyphs in the
 * catalogue the surplus gets '?', which is the behaviour the caller's clamp
 * exists to prevent.
 */
export function assignChartSymbols(
  colours: SymbolColour[],
  adjacency: Map<string, Set<string>>,
): Map<string, string> {
  // Busiest colour first, with a deterministic tie-break so the same chart
  // always produces the same key.
  const order = colours
    .slice()
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))

  const luminance = new Map(order.map((c) => [c.key, relativeLuminance(c.rgb)]))
  const rgbTuple = new Map(order.map((c) => [c.key, hexToRgb(c.rgb)]))

  const assigned = new Map<string, string>()
  /** Family → the colour keys already carrying a glyph from it. */
  const familyUsers = new Map<string, string[]>()
  const usedGlyphs = new Set<string>()

  for (const colour of order) {
    const neighbours = adjacency.get(colour.key) ?? EMPTY_SET
    const isDark = (luminance.get(colour.key) ?? 1) <= DARK_FLOSS_LUMINANCE
    const mine = rgbTuple.get(colour.key)!

    // A family clashes when a colour already using it touches this one, or
    // looks enough like it that the pair would be read as one colour.
    const familyClashes = (family: string): { touching: boolean; lookalike: boolean } => {
      let touching = false
      let lookalike = false
      for (const other of familyUsers.get(family) ?? []) {
        if (neighbours.has(other)) touching = true
        const theirs = rgbTuple.get(other)
        if (theirs && rgbDistance(mine, theirs) < CLOSE_COLOUR_DISTANCE) lookalike = true
      }
      return { touching, lookalike }
    }

    // Relaxations, strictest first. The adjacency rule survives longest: a
    // confusable pair is fine between colours that never meet, and never fine
    // between two that do.
    const stages: Array<(spec: SymbolSpec) => boolean> = [
      // 1. A family nobody has touched at all, correct weight for the floss.
      (spec) => !familyUsers.has(spec.family) && weightFits(spec, isDark),
      // 2. Reuse a family, but not one an adjacent or lookalike colour holds.
      (spec) => {
        const c = familyClashes(spec.family)
        return !c.touching && !c.lookalike && weightFits(spec, isDark)
      },
      // 3. Give up the weight preference.
      (spec) => {
        const c = familyClashes(spec.family)
        return !c.touching && !c.lookalike
      },
    ]

    let chosen: SymbolSpec | undefined
    for (const accepts of stages) {
      chosen = SYMBOL_SPECS.find((spec) => !usedGlyphs.has(spec.glyph) && accepts(spec))
      if (chosen) break
    }

    // 4. Past that the palette has genuinely run the pool dry, so a family has
    //    to be shared with a colour of similar shade. Take the sharing that
    //    hurts least: the family whose existing holders sit furthest away in
    //    colour, and still never one an adjacent colour holds.
    if (!chosen) {
      let bestGap = -1
      for (const spec of SYMBOL_SPECS) {
        if (usedGlyphs.has(spec.glyph)) continue
        if (familyClashes(spec.family).touching) continue
        let gap = Number.POSITIVE_INFINITY
        for (const other of familyUsers.get(spec.family) ?? []) {
          const theirs = rgbTuple.get(other)
          if (theirs) gap = Math.min(gap, rgbDistance(mine, theirs))
        }
        if (gap > bestGap) {
          bestGap = gap
          chosen = spec
        }
      }
    }

    // 5. Nothing left that avoids a neighbour. Take the first free glyph.
    if (!chosen) chosen = SYMBOL_SPECS.find((spec) => !usedGlyphs.has(spec.glyph))

    const glyph = chosen?.glyph ?? '?'
    assigned.set(colour.key, glyph)
    if (chosen) {
      usedGlyphs.add(glyph)
      const users = familyUsers.get(chosen.family)
      if (users) users.push(colour.key)
      else familyUsers.set(chosen.family, [colour.key])
    }
  }

  return assigned
}

const EMPTY_SET: ReadonlySet<string> = new Set()

function weightFits(spec: SymbolSpec, isDarkFloss: boolean): boolean {
  return spec.weight === 'solid' || isDarkFloss
}

/**
 * Which colours touch which, over the 8-neighbourhood of the finished grid.
 * Built once from the cells the chart will actually carry, so it reflects the
 * chart after confetti reduction rather than the raw quantiser output.
 */
export function buildAdjacency(
  cells: Array<{ x: number; y: number; s: string }>,
  width: number,
  height: number,
): Map<string, Set<string>> {
  const at = new Map<number, string>()
  for (const c of cells) at.set(c.y * width + c.x, c.s)

  const adjacency = new Map<string, Set<string>>()
  const link = (a: string, b: string) => {
    if (a === b) return
    let sa = adjacency.get(a)
    if (!sa) adjacency.set(a, (sa = new Set()))
    sa.add(b)
    let sb = adjacency.get(b)
    if (!sb) adjacency.set(b, (sb = new Set()))
    sb.add(a)
  }

  // Right, down, down-right and down-left cover every 8-neighbour pair once.
  for (const c of cells) {
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
      [1, 1],
      [-1, 1],
    ] as const) {
      const nx = c.x + dx
      const ny = c.y + dy
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const other = at.get(ny * width + nx)
      if (other !== undefined) link(c.s, other)
    }
  }
  return adjacency
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return [0, 0, 0]
  const v = m[1]
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ]
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

function rgbDistance(a: [number, number, number], b: [number, number, number]): number {
  // Weighted Euclidean — cheap, and closer to how the eye ranks the channels
  // than a flat distance.
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db) / Math.sqrt(9)
}
