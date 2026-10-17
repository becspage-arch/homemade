/**
 * Yarn shade names.
 *
 * A tapestry pattern lists YARN, not floss, so the converted palette is named
 * the way a yarn band is: plain shade names a maker can shop by. There is no
 * DMC / Anchor / Madeira mapping here on purpose. Cross-stitch resolves its
 * colours against a floss table because floss codes are a real, buyable
 * standard; yarn has no cross-brand code, so a name and the colour itself is
 * the useful thing.
 */

export interface YarnShade {
  name: string
  hex: string
}

/** A working set of shade names covering the range a stash actually holds. */
export const YARN_SHADES: YarnShade[] = [
  { name: 'White', hex: '#f7f5f0' },
  { name: 'Cream', hex: '#efe6d2' },
  { name: 'Buttermilk', hex: '#f2e3b8' },
  { name: 'Oatmeal', hex: '#ddd0b8' },
  { name: 'Linen', hex: '#c9bda6' },
  { name: 'Silver', hex: '#c6c6c4' },
  { name: 'Storm', hex: '#9a9c9e' },
  { name: 'Slate', hex: '#6d7479' },
  { name: 'Charcoal', hex: '#41444a' },
  { name: 'Black', hex: '#1b1a19' },
  { name: 'Blush', hex: '#f0c9c1' },
  { name: 'Rose', hex: '#d98f92' },
  { name: 'Coral', hex: '#e2705c' },
  { name: 'Poppy', hex: '#c42b2b' },
  { name: 'Brick', hex: '#a9432f' },
  { name: 'Raspberry', hex: '#b83a5c' },
  { name: 'Wine', hex: '#6e2337' },
  { name: 'Fuchsia', hex: '#c1478f' },
  { name: 'Lilac', hex: '#bda6d1' },
  { name: 'Plum', hex: '#7a5486' },
  { name: 'Damson', hex: '#4b3352' },
  { name: 'Terracotta', hex: '#c4744c' },
  { name: 'Rust', hex: '#9c4a1e' },
  { name: 'Ochre', hex: '#c9902f' },
  { name: 'Mustard', hex: '#d4a520' },
  { name: 'Sunshine', hex: '#f1c232' },
  { name: 'Camel', hex: '#bb9264' },
  { name: 'Toffee', hex: '#9a6c40' },
  { name: 'Chocolate', hex: '#5b3a25' },
  { name: 'Mink', hex: '#8b7a6b' },
  { name: 'Mint', hex: '#b8ddc4' },
  { name: 'Pistachio', hex: '#c3d89a' },
  { name: 'Apple', hex: '#9cc463' },
  { name: 'Leaf', hex: '#74ab4c' },
  { name: 'Sage', hex: '#9caf94' },
  { name: 'Moss', hex: '#7d8a4e' },
  { name: 'Grass', hex: '#5e9a3c' },
  { name: 'Fern', hex: '#4a7d3b' },
  { name: 'Olive', hex: '#5f6b34' },
  { name: 'Bottle', hex: '#2c5e3c' },
  { name: 'Forest', hex: '#2f4a35' },
  { name: 'Seafoam', hex: '#8fc4a4' },
  { name: 'Eucalyptus', hex: '#6e9e82' },
  { name: 'Jade', hex: '#3d8a63' },
  { name: 'Spruce', hex: '#346b5b' },
  { name: 'Pine', hex: '#2a5747' },
  { name: 'Duck egg', hex: '#a8ccc9' },
  { name: 'Teal', hex: '#2f7b7d' },
  { name: 'Petrol', hex: '#1f4b57' },
  { name: 'Sky', hex: '#9dc4e0' },
  { name: 'Denim', hex: '#5b7ba6' },
  { name: 'Cobalt', hex: '#2b4f9e' },
  { name: 'Navy', hex: '#22314f' },
  { name: 'Ink', hex: '#1a2233' },
]

/** '#rrggbb' → [r, g, b]. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** sRGB '#rrggbb' → CIELAB (D65). */
export function hexToLab(hex: string): [number, number, number] {
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = hexToRgb(hex).map(lin) as [number, number, number]
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)
  const fx = f(x)
  const fy = f(y)
  const fz = f(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/**
 * CIEDE2000 colour difference between two Lab colours: the perceptual distance
 * a maker's eye sees. Plain RGB distance is what sent a mid green to "Slate"
 * and a blue-green to "Petrol" in the tapestry reopen proof: in RGB a dull grey
 * can sit nearer a green than a brighter green does.
 */
export function deltaE2000(a: [number, number, number], b: [number, number, number]): number {
  const [L1, a1, b1] = a
  const [L2, a2, b2] = b
  const rad = Math.PI / 180
  const C1 = Math.hypot(a1, b1)
  const C2 = Math.hypot(a2, b2)
  const Cm = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)))
  const a1p = (1 + G) * a1
  const a2p = (1 + G) * a2
  const C1p = Math.hypot(a1p, b1)
  const C2p = Math.hypot(a2p, b2)
  const hue = (bb: number, aa: number) => {
    if (bb === 0 && aa === 0) return 0
    const h = Math.atan2(bb, aa) / rad
    return h < 0 ? h + 360 : h
  }
  const h1p = hue(b1, a1p)
  const h2p = hue(b2, a2p)
  const dLp = L2 - L1
  const dCp = C2p - C1p
  let dhp = 0
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p
    if (dhp > 180) dhp -= 360
    else if (dhp < -180) dhp += 360
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * rad) / 2)
  const Lpm = (L1 + L2) / 2
  const Cpm = (C1p + C2p) / 2
  let hpm = h1p + h2p
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hpm = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2
    else hpm = (h1p + h2p) / 2
  }
  const T =
    1 -
    0.17 * Math.cos((hpm - 30) * rad) +
    0.24 * Math.cos(2 * hpm * rad) +
    0.32 * Math.cos((3 * hpm + 6) * rad) -
    0.2 * Math.cos((4 * hpm - 63) * rad)
  const dTheta = 30 * Math.exp(-(((hpm - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (Lpm - 50) ** 2) / Math.sqrt(20 + (Lpm - 50) ** 2)
  const Sc = 1 + 0.045 * Cpm
  const Sh = 1 + 0.015 * Cpm * T
  const Rt = -Math.sin(2 * dTheta * rad) * Rc
  return Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh),
  )
}

/**
 * Contrast (ΔE2000) between two picture colours that the matched yarns must
 * keep, up to this much. Two close but distinct greens (hills one behind the
 * other) have to come back as two yarns a maker can tell apart, not as two
 * names for what reads as one colour.
 */
const KEEP_CONTRAST = 18
/** Weight of a lost unit of contrast against a unit of colour error. */
const CONTRAST_WEIGHT = 1.5
/** Weight of a lightness order flip (a lighter hill coming back darker). */
const ORDER_WEIGHT = 2
/** Lightness gap (L*) under which two colours have no order to keep. */
const ORDER_MIN_GAP = 4

/**
 * Match a set of colours to actual, buyable yarn shades, each shade used once,
 * so a palette never lists two swatches called the same thing. Colours are
 * handed to this in the order they should claim shades (most-used first reads
 * best in the key); `weights` (default all 1) says how much each colour's own
 * match matters, so a caller can pass stitch counts.
 *
 * THE SIMILAR-COLOUR BUG this replaces (tapestry reopen proof, 9 Oct 2026): a
 * greedy nearest-RGB pass let the first green take the one green it liked and
 * pushed its close neighbour to whatever was left nearest in RGB, which was a
 * grey (Sage, Slate) or a blue (Petrol, Navy). The hills then read as one muddy
 * colour or as dark stripes. Now the match is scored as a whole, in a
 * perceptual distance (CIEDE2000):
 *   - each colour's own error, weighted;
 *   - plus any contrast two picture colours had (up to `KEEP_CONTRAST`) that
 *     their two yarns lost, so close but distinct colours stay distinct;
 *   - plus any lightness order the yarns flip.
 * It starts from the greedy match and improves it by single moves and swaps
 * until nothing gets better: deterministic, offline, and fast at palette sizes.
 *
 * Falls back to a numbered shade carrying the ORIGINAL colour if the name list
 * runs out, rather than collapsing distinct colours onto one shade.
 *
 * Callers that need the finished swatch to be an actual yarn hex (the tapestry
 * converter, so a pattern never names a shade and then renders a colour that
 * shade doesn't make) use the returned `hex`, not the colour that was passed
 * in.
 */
export function matchYarnShades(hexes: string[], weights?: number[]): YarnShade[] {
  const n = hexes.length
  if (n === 0) return []
  const shades = YARN_SHADES
  const m = shades.length
  const inLab = hexes.map(hexToLab)
  const shLab = shades.map((s) => hexToLab(s.hex))
  const w = hexes.map((_, i) => Math.max(0.05, weights?.[i] ?? 1))
  const wMean = w.reduce((a, b) => a + b, 0) / n
  const wn = w.map((v) => v / wMean)
  // Colour error of picture colour i on shade k.
  const err: number[][] = inLab.map((c) => shLab.map((s) => deltaE2000(c, s)))
  // Shade-to-shade distances, and the picture's own pair contrasts.
  const shD: number[][] = shLab.map((a) => shLab.map((b) => deltaE2000(a, b)))
  const inD: number[][] = inLab.map((a) => inLab.map((b) => deltaE2000(a, b)))

  // The colours past the shade list get a numbered fallback (index -1).
  const named = Math.min(n, m)
  const pairCost = (i: number, j: number, ki: number, kj: number): number => {
    if (ki < 0 || kj < 0) return 0
    const want = Math.min(inD[i]![j]!, KEEP_CONTRAST)
    let c = CONTRAST_WEIGHT * Math.max(0, want - shD[ki]![kj]!)
    const dLin = inLab[i]![0] - inLab[j]![0]
    if (Math.abs(dLin) >= ORDER_MIN_GAP) {
      const dLout = shLab[ki]![0] - shLab[kj]![0]
      if (Math.sign(dLout) !== Math.sign(dLin)) c += ORDER_WEIGHT * Math.abs(dLout)
    }
    return c
  }
  const ownCost = (i: number, k: number): number => (k < 0 ? 0 : wn[i]! * err[i]![k]!)

  // Start: the old greedy, in the given order.
  const pick: number[] = new Array(n).fill(-1)
  const used = new Set<number>()
  for (let i = 0; i < named; i++) {
    let best = -1
    for (let k = 0; k < m; k++) {
      if (used.has(k)) continue
      if (best < 0 || err[i]![k]! < err[i]![best]!) best = k
    }
    pick[i] = best
    used.add(best)
  }

  // Improve: move one colour to a free shade, or swap two colours' shades,
  // whenever the whole palette scores better. Every accepted move lowers the
  // total, so this terminates; the sweep order is fixed, so it is
  // deterministic.
  const costOf = (i: number, k: number, skip = -1): number => {
    let c = ownCost(i, k)
    for (let j = 0; j < named; j++) if (j !== i && j !== skip) c += pairCost(i, j, k, pick[j]!)
    return c
  }
  const EPS = 1e-9
  for (let sweep = 0; sweep < 50; sweep++) {
    let improved = false
    for (let i = 0; i < named; i++) {
      const now = costOf(i, pick[i]!)
      let bestK = pick[i]!
      let bestC = now
      for (let k = 0; k < m; k++) {
        if (used.has(k)) continue
        const c = costOf(i, k)
        if (c < bestC - EPS) {
          bestC = c
          bestK = k
        }
      }
      if (bestK !== pick[i]) {
        used.delete(pick[i]!)
        used.add(bestK)
        pick[i] = bestK
        improved = true
      }
    }
    for (let i = 0; i < named; i++) {
      for (let j = i + 1; j < named; j++) {
        const ki = pick[i]!
        const kj = pick[j]!
        const before = costOf(i, ki, j) + costOf(j, kj, i) + pairCost(i, j, ki, kj)
        const after = costOf(i, kj, j) + costOf(j, ki, i) + pairCost(i, j, kj, ki)
        if (after < before - EPS) {
          pick[i] = kj
          pick[j] = ki
          improved = true
        }
      }
    }
    if (!improved) break
  }

  return hexes.map((hex, i) => (pick[i]! >= 0 ? shades[pick[i]!]! : { name: `Shade ${i + 1}`, hex }))
}

/** Name a set of yarn colours — `matchYarnShades`, keeping just the name. */
export function nameYarnColours(hexes: string[]): string[] {
  return matchYarnShades(hexes).map((s) => s.name)
}
