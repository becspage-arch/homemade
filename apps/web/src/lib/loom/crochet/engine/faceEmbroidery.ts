/**
 * EMBROIDERED FACES (bar criterion 4, "It has a face with character").
 *
 * A real amigurumi face is not printed on: it is sewn onto the finished head
 * with a tapestry needle, one straight stitch at a time, each stitch coming
 * up through a gap in the fabric, lying across the crocheted stitches and
 * going back down through another gap. Sleeping eyes are a curve of
 * backstitch with a few short straight lashes; an open embroidered eye and a
 * nose are satin stitch (straight stitches laid side by side to fill a
 * shape); a mouth is two or three straight stitches; blush is a small satin
 * patch in a soft pink yarn.
 *
 * This module is that, in two halves that share ONE description:
 *
 *  1. `buildFaceEmbroidery` turns a face style into features whose every
 *     stitch is named in the pattern's own coordinates: a ROUND of the piece
 *     (counted from its magic ring, .5 = in the gap between two rounds) and a
 *     STITCH offset from a named zero line (centre front of the head, the top
 *     of the muzzle). The written pattern's embroidery lines are written from
 *     those numbers.
 *  2. `placeEmbroidery` finds those same rounds and stitches on the SETTLED,
 *     relaxed fabric of the compiled piece and lays each stitch on it as a
 *     real strand: it dives into the fabric at the gap it comes out of, rides
 *     over the tops of the crocheted stitches it crosses, and dives back in.
 *     It is yarn geometry in the render (plied filaments, like every other
 *     strand), not a painted texture, and it follows the fabric because it is
 *     sampled off the fabric.
 *
 * What it does NOT do: it never moves a crocheted stitch. The embroidery is
 * outside the geometry hash and outside the interlock audit (like the safety
 * eyes), so every existing composition stays bit-identical.
 *
 * Its own module so the face can change without touching the body geometry
 * (`amigurumiPresets.ts`) or the composition layer beyond two small hooks.
 */

import type { V3 } from '../yarnLoop'
import type { BuiltContinuous } from './yarnPath'

// ── Styles ──────────────────────────────────────────────────────────────────

/** The face a maker picks for a preset. `safety` is the original (safety eyes
 *  and a moulded nose), and is the default, so a preset that never names a
 *  face is unchanged down to its scene JSON. */
export const FACE_STYLE_IDS = ['safety', 'safety-stitched', 'sleepy', 'stitched'] as const
export type FaceStyle = (typeof FACE_STYLE_IDS)[number]

export const FACE_STYLES: Array<{ id: FaceStyle; label: string; blurb: string }> = [
  { id: 'safety', label: 'Safety eyes', blurb: 'Plastic safety eyes and a safety nose.' },
  {
    id: 'safety-stitched',
    label: 'Safety eyes, stitched nose',
    blurb: 'Safety eyes with two stitched nostrils on the muzzle, like a highland calf.',
  },
  {
    id: 'sleepy',
    label: 'Sleepy',
    blurb: 'Embroidered closed eyes with lashes, a stitched nose and mouth, and blush. Safe for babies.',
  },
  {
    id: 'stitched',
    label: 'Embroidered eyes',
    blurb: 'Embroidered open eyes, a stitched nose and mouth, and blush. Safe for babies.',
  },
]

/** Does this style use plastic safety eyes? */
export function faceUsesSafetyEyes(style: FaceStyle): boolean {
  return style === 'safety' || style === 'safety-stitched'
}

/** Does this style use a moulded safety nose? */
export function faceUsesSafetyNose(style: FaceStyle): boolean {
  return style === 'safety'
}

// ── The feature description (pattern coordinates) ───────────────────────────

/**
 * A point on a crocheted piece, in the pattern's own terms.
 *  - `round`: the round of the piece, counted from its magic ring as the
 *    pattern counts them (Round 1 is the ring's six stitches). A whole number
 *    is the middle of that round; `.5` is the gap between it and the next.
 *    0 is the magic ring's centre and `rounds.length + 1` the closing point.
 *  - `st`: stitches round from the feature's zero line, positive toward the
 *    toy's own right, counted along that round. Half stitches are the gap
 *    between two stitches; whole ones the middle of a stitch.
 */
export interface SurfaceSpot {
  round: number
  st: number
}

/** One straight stitch: up at `from`, down at `to`. `taut`: laid as a
 *  dead-straight thread from hole to hole (a short lash over one crown)
 *  instead of riding every crown it crosses. */
export interface EmbroideryStitch {
  from: SurfaceSpot
  to: SurfaceSpot
  taut?: boolean
}

export interface EmbroideryFeature {
  /** 'eye-l', 'nose', 'mouth', 'blush-r'… */
  name: string
  /** The crocheted part it is sewn on. */
  on: string
  /** World direction (from the part's centre) that names stitch 0. */
  zeroDir: { x: number; y: number; z: number }
  /** World direction a positive stitch offset moves toward (the toy's right). */
  rightDir: { x: number; y: number; z: number }
  colourHex: string
  /** The strand's bundle radius in mm (six-strand embroidery floss ≈ 0.5,
   *  a DK yarn ≈ 0.8). */
  threadMm: number
  /** What the maker sews it with, for the notions list. */
  threadLabel: string
  /** The thread's own fibre look in the render, when it is not the toy's
   *  yarn (blush in a soft wool reads as a pale fuzzy patch, not a satin
   *  pad). Unset: rendered in the scene's fibre, as before. */
  fibre?: 'cotton' | 'wool' | 'chenille' | 'velvet'
  stitches: EmbroideryStitch[]
}

// ── Building a face ─────────────────────────────────────────────────────────

// Dark brown, not black: the bar's lids and mouth are sewn in a brown floss
// that reads as a soft line on cream, where black reads as wire.
const EYE_THREAD = '#3a2a22'
// An open embroidered eye is black (a dark brown one reads as a bruise).
const OPEN_EYE_THREAD = '#1e1714'
const NOSE_DARK = '#2a1c16'
// A dusty pale pink for the nose, a paler one for the blush (the bar's nose
// is a shade deeper than its cheeks, neither of them saturated).
const NOSE_PINK = '#e39d9a'
const BLUSH_PINK = '#efbdb8'
const HIGHLIGHT = '#f4f1ea'
const FLOSS_MM = 0.5
const BLUSH_YARN_MM = 0.4

export interface FaceLayout {
  /** The head (or body) the eyes and blush go on, and its round counts. */
  head: { name: string; rounds: number[] }
  /** The muzzle the nose and mouth go on, if the base has one. */
  muzzle?: { name: string; rounds: number[]; frontIsRing: boolean }
  /** World directions: the face's forward, the toy's right, world up. */
  forward: { x: number; y: number; z: number }
  right: { x: number; y: number; z: number }
  /** Where the eyes sit: elevation above the head's equator (deg) and the
   *  azimuth each side of centre front (deg). Low and wide is the bar. */
  eyeElevDeg: number
  eyeAzDeg: number
  /** Blush, below and outside the eye. */
  blushElevDeg: number
  blushAzDeg: number
  /** Eye size as a fraction of one stitch width (half-width of the curve). */
  eyeHalfSt?: number
  /** A light muzzle wants a pink nose (a bunny), a dark one a dark nose. */
  pinkNose?: boolean
  /** No muzzle: the nose and mouth go on the head under the eyes (this
   *  elevation), or nowhere (a beak). */
  noseOnHeadElevDeg?: number
}

/** Snap to the half grid the pattern words are written in. */
const half = (v: number): number => Math.round(v * 2) / 2

/** The pattern round sitting at an elevation (deg above the equator) on a
 *  round piece worked from the crown: rounds are evenly spaced down the
 *  meridian, so the round is the fraction of the way from crown to base. */
export function roundAtElevation(rounds: number[], elevDeg: number): number {
  const n = rounds.length
  return (n * (90 - elevDeg)) / 180 + 0.5
}

/** The stitch count of the round a spot is counted along (the nearer whole
 *  round; a gap between two rounds counts along the upper one). */
export function countAt(rounds: number[], round: number): number {
  const k = Math.max(1, Math.min(rounds.length, Math.floor(round)))
  return rounds[k - 1]!
}

function stitchesAtAzimuth(rounds: number[], round: number, azDeg: number): number {
  return (countAt(rounds, round) * azDeg) / 360
}

/** A curve of backstitch: a sleeping eye's closed lid. Points from the inner
 *  corner to the outer, sagging `sag` rounds DOWN at the middle (a sleeping
 *  eye is a smile-shaped curve with the lashes under it). */
function arcStitches(c: SurfaceSpot, halfSt: number, sag: number, segs: number, side: -1 | 1): {
  stitches: EmbroideryStitch[]
  pts: SurfaceSpot[]
} {
  const pts: SurfaceSpot[] = []
  for (let i = 0; i <= segs; i++) {
    const t = -1 + (2 * i) / segs // inner (-1) → outer (+1)
    pts.push({ round: c.round + sag * (1 - t * t), st: c.st + side * halfSt * t })
  }
  const stitches: EmbroideryStitch[] = []
  for (let i = 0; i < segs; i++) stitches.push({ from: pts[i]!, to: pts[i + 1]! })
  return { stitches, pts }
}

/** Satin-stitch fill: straight stitches laid side by side across a shape.
 *  `widthAt(round)` gives the half-width (stitches) at a round; the stitches
 *  run along the round (horizontal), spaced `pitch` rounds apart. */
function satinRows(
  r0: number,
  r1: number,
  pitch: number,
  centreSt: number,
  widthAt: (round: number) => number,
): EmbroideryStitch[] {
  const out: EmbroideryStitch[] = []
  const n = Math.max(1, Math.round(Math.abs(r1 - r0) / pitch))
  for (let i = 0; i <= n; i++) {
    const r = r0 + ((r1 - r0) * i) / n
    const w = widthAt(r)
    if (w <= 0.02) continue
    out.push({ from: { round: r, st: centreSt - w }, to: { round: r, st: centreSt + w } })
  }
  return out
}

/** Satin-stitch fill with the stitches running ACROSS the rounds (vertical),
 *  spaced `pitch` stitches apart. */
function satinColumns(
  s0: number,
  s1: number,
  pitch: number,
  centreRound: number,
  heightAt: (st: number) => number,
): EmbroideryStitch[] {
  const out: EmbroideryStitch[] = []
  const n = Math.max(1, Math.round(Math.abs(s1 - s0) / pitch))
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n
    const h = heightAt(s)
    if (h <= 0.02) continue
    out.push({ from: { round: centreRound - h, st: s }, to: { round: centreRound + h, st: s } })
  }
  return out
}

/**
 * The face, as embroidery features in pattern coordinates. Empty for the
 * `safety` style (the safety eyes and nose stay props, as before).
 */
export function buildFaceEmbroidery(style: FaceStyle, L: FaceLayout): EmbroideryFeature[] {
  if (style === 'safety') return []
  const out: EmbroideryFeature[] = []
  const H = L.head
  const up = { x: 0, y: 0, z: 1 }
  const headFeature = (name: string, hex: string, threadMm: number, label: string, stitches: EmbroideryStitch[]): EmbroideryFeature => ({
    name, on: H.name, zeroDir: L.forward, rightDir: L.right, colourHex: hex, threadMm, threadLabel: label, stitches,
  })

  // ── Eyes ──
  const eyeRound = half(roundAtElevation(H.rounds, L.eyeElevDeg))
  const eyeSt = stitchesAtAzimuth(H.rounds, eyeRound, L.eyeAzDeg)
  const halfSt = L.eyeHalfSt ?? 0.75
  if (style === 'sleepy') {
    for (const side of [-1, 1] as const) {
      // The two corners are where the words put the needle, so they sit on
      // the half-stitch grid the pattern is written in.
      const inner = Math.max(0.5, half(eyeSt - halfSt))
      const outer = Math.max(inner + 1, half(eyeSt + halfSt))
      const c: SurfaceSpot = { round: eyeRound, st: side * ((inner + outer) / 2) }
      const arc = arcStitches(c, (outer - inner) / 2, 0.45, 6, side)
      const stitches = [...arc.stitches]
      // Four short lashes along the outer half of the lid, evenly spaced,
      // one out of each backstitch hole: each a straight stitch down and a
      // little outward, the outermost from the corner fanning out most (the
      // bar's lashes are short, straight and even, about a third of the lid).
      for (const [i, len, out_] of [[3, 0.4, 0.05], [4, 0.44, 0.13], [5, 0.44, 0.22], [6, 0.38, 0.32]] as const) {
        const p = arc.pts[i]!
        stitches.push({ from: p, to: { round: p.round + len, st: p.st + side * out_ }, taut: true })
      }
      out.push(headFeature(side < 0 ? 'eye-l' : 'eye-r', EYE_THREAD, FLOSS_MM * 0.9, 'Dark brown embroidery thread', stitches))
    }
  } else if (style === 'stitched') {
    for (const side of [-1, 1] as const) {
      const cs = side * half(eyeSt)
      const hRounds = 0.68
      const wSt = Math.min(halfSt * 0.55, 0.55)
      // Worked from the inner edge outward on each side (mirror images).
      const fill = satinColumns(cs - side * wSt, cs + side * wSt, 0.11, eyeRound, (s) => {
        const u = (s - cs) / wSt
        return hRounds * Math.sqrt(Math.max(0, 1 - u * u))
      })
      out.push(headFeature(side < 0 ? 'eye-l' : 'eye-r', OPEN_EYE_THREAD, FLOSS_MM, 'Black embroidery thread', fill))
      // The catch-light: one small white stitch high on the eye.
      const hs: SurfaceSpot = { round: eyeRound - hRounds * 0.45, st: cs - side * wSt * 0.25 }
      out.push(headFeature(side < 0 ? 'eye-light-l' : 'eye-light-r', HIGHLIGHT, FLOSS_MM * 0.8, 'White embroidery thread', [
        { from: hs, to: { round: hs.round + 0.18, st: hs.st - side * 0.08 } },
      ]))
    }
  }

  // ── Blush ── a small satin oval in pink yarn, below and outside the eye.
  // (Not with safety eyes: the bar's calf has none, and a pink pad next to a
  // plastic eye reads as a sticker.)
  if (style !== 'safety-stitched') {
    const br = half(roundAtElevation(H.rounds, L.blushElevDeg))
    const bs = stitchesAtAzimuth(H.rounds, br, L.blushAzDeg)
    for (const side of [-1, 1] as const) {
      const cs = side * half(bs)
      // A rounder, softer patch than a satin pad, in a fluffy yarn so the
      // render shows one soft pale-pink patch, not a ribbed pad of rows.
      const hw = 0.62
      const hh = 0.55
      // Worked from the inner edge outward on each side, so the two cheeks
      // are exact mirror images stitch for stitch.
      const fill = satinRows(br - hh, br + hh, 0.09, cs, (r) => {
        const u = (r - br) / hh
        return hw * Math.sqrt(Math.max(0, 1 - u * u))
      }).map((s) => (side < 0 ? { from: s.to, to: s.from } : s))
      out.push({ ...headFeature(side < 0 ? 'blush-l' : 'blush-r', BLUSH_PINK, BLUSH_YARN_MM, 'Pink yarn (a soft fluffy DK)', fill), fibre: 'chenille' })
    }
  }

  // ── Nose and mouth ──
  const noseHex = L.pinkNose ? NOSE_PINK : NOSE_DARK
  const noseLabel = L.pinkNose ? 'Pink embroidery thread' : 'Dark brown embroidery thread'
  if (L.muzzle) {
    const M = L.muzzle
    const n = M.rounds.length
    // Rounds counted OUT from the muzzle's front centre: ring index i is the
    // pattern round i when the magic ring faces out, n + 1 − i when the
    // closing point does.
    const fr = (i: number): number => (M.frontIsRing ? i : n + 1 - i)
    const muzzleFeature = (name: string, hex: string, label: string, stitches: EmbroideryStitch[]): EmbroideryFeature => ({
      name, on: M.name, zeroDir: up, rightDir: L.right, colourHex: hex, threadMm: FLOSS_MM, threadLabel: label, stitches,
    })
    // A spot `i` rings out from the muzzle's front centre, `deg` round from
    // the top of the muzzle (positive toward the toy's right). The stitch
    // offset is counted along the round the spot is on, exactly as the
    // sampler (and the maker) counts it.
    const spot = (i: number, deg: number): SurfaceSpot => {
      const round = fr(i)
      return { round, st: (countAt(M.rounds, round) * deg) / 360 }
    }
    if (style === 'safety-stitched') {
      // NOSTRILS (the bar's highland calf): with safety eyes the muzzle gets
      // just two short straight stitches, each from upper-outer to
      // lower-inner, a little above the muzzle's centre. No mouth, no blush.
      const nostrils: EmbroideryStitch[] = []
      for (const side of [-1, 1] as const) {
        nostrils.push({ from: spot(1.5, side * 42), to: spot(0.85, side * 78), taut: true })
      }
      out.push({ ...muzzleFeature('nose', NOSE_DARK, 'Dark brown embroidery thread', nostrils), threadMm: FLOSS_MM * 1.1 })
      return out
    }
    // The NOSE: a satin triangle, point down, on the top half of the muzzle
    // front. Rows run across (along the rings), each a little shorter and
    // a little lower, so the fill is a triangle of parallel straight
    // stitches; its point comes down to just above the centre.
    const topI = 1.3
    const tipI = 0.45
    const topHalfMm = 0.75 // half-width at the top edge, in ring units
    const rows: EmbroideryStitch[] = []
    const nRows = 13
    for (let k = 0; k <= nRows; k++) {
      const frac_ = 1 - k / nRows // 1 at the top edge, 0 at the point
      // Each row is a straight stitch of half-width w (ring units) at height
      // y above the centre: its two ends are at ring radius hypot(w, y) and
      // angle atan(w / y) either side of the top. The width profile is a
      // ROUNDED triangle (the bar's nose): it fills out quickly below the
      // top edge, and the top row is a touch shorter so the corners are soft.
      const y = tipI + (topI - tipI) * frac_
      const w = Math.max(0.06, topHalfMm * Math.pow(frac_, 0.72) * (k === 0 ? 0.88 : 1))
      const i = Math.hypot(w, y)
      const deg = (Math.atan2(w, y) * 180) / Math.PI
      rows.push({ from: spot(i, -deg), to: spot(i, deg) })
    }
    out.push({ ...muzzleFeature('nose', noseHex, noseLabel, rows), threadMm: FLOSS_MM * 1.25 })
    // The MOUTH: a short straight stitch down from the point of the nose to
    // just below the centre, then a small V each side, down-and-out then
    // up-and-out, so it reads as a "w" (a sleepy bunny's, a smiling bear's).
    const tip = spot(tipI, 0)
    const bottom = spot(0.12, 180)
    const mouth: EmbroideryStitch[] = [{ from: tip, to: bottom }]
    for (const side of [-1, 1] as const) {
      const low = spot(0.4, 180 - side * 34)
      const end = spot(0.6, 180 - side * 72)
      mouth.push({ from: bottom, to: low, taut: true }, { from: low, to: end, taut: true })
    }
    out.push({ ...muzzleFeature('mouth', EYE_THREAD, 'Dark brown embroidery thread', mouth), threadMm: FLOSS_MM * 0.9 })
  } else if (L.noseOnHeadElevDeg != null) {
    const nr = half(roundAtElevation(H.rounds, L.noseOnHeadElevDeg))
    const rows = satinRows(nr - 0.35, nr + 0.35, 0.12, 0, (r) => 0.5 * (1 - (r - (nr - 0.35)) / 0.7) + 0.06)
    out.push(headFeature('nose', noseHex, FLOSS_MM, noseLabel, rows))
  }
  return out
}

// ── Words ────────────────────────────────────────────────────────────────────

/** "1 stitch", "2½ stitches". */
const sts = (v: number): string => {
  const f = frac(v)
  return `${f} ${f === '1' ? 'stitch' : 'stitches'}`
}

const frac = (v: number): string => {
  const a = Math.abs(v)
  const w = Math.floor(a + 1e-6)
  const h = a - w > 0.25 && a - w < 0.75
  return h ? (w === 0 ? '½' : `${w}½`) : `${Math.round(a)}`
}

/** "between rounds 6 and 7" / "in round 7". */
export function roundWords(r: number): string {
  const hr = half(r)
  if (Number.isInteger(hr)) return `in round ${hr}`
  return `between rounds ${Math.floor(hr)} and ${Math.ceil(hr)}`
}

/** The written instructions for a face, in UK terms, one line per feature
 *  group. Placement is by round and stitch count, read off the SAME spots the
 *  render lays the strands on. */
export function writeFaceInstructions(features: EmbroideryFeature[], headLabel = 'head'): string[] {
  if (!features.length) return []
  const style: FaceStyle = features.some((f) => f.name === 'eye-light-l')
    ? 'stitched'
    : features.some((f) => f.name === 'eye-l')
      ? 'sleepy'
      : 'safety-stitched'
  const lines: string[] = []
  lines.push(
    `Embroider the face with a tapestry needle before sewing the ${headLabel} closed (or work through the ` +
      'stuffing from behind and bring the ends out at the back). Rounds are counted from the magic ring ' +
      `at the top of the ${headLabel}; centre front is the middle of the muzzle. Pull every stitch just snug, ` +
      'so it lies on the fabric without puckering it.',
  )
  const eyeL = features.find((f) => f.name === 'eye-l')
  if (eyeL && style === 'sleepy') {
    const a = eyeL.stitches[0]!.from
    const end = eyeL.stitches[5]!.to
    const mid = eyeL.stitches[2]!.to
    const apart = Math.abs(a.st) * 2
    lines.push(
      `Sleeping eyes (dark brown embroidery thread): bring the needle up ${roundWords(a.round)}, ` +
        `${sts(a.st)} from centre front. Work 6 small backstitches outward in a smile-shaped curve that dips to ` +
        `${roundWords(mid.round)} at its middle and comes back up ${roundWords(end.round)}, ${sts(end.st)} from centre front. ` +
        'Add 4 lashes along the outer half of the curve, one at each backstitch hole: a short straight stitch from the curve down into the next round, fanning slightly outward toward the outer corner. ' +
        `Work the other eye as a mirror image, so the inner corners are ${sts(apart)} apart.`,
    )
  } else if (eyeL && style === 'stitched') {
    const xs = eyeL.stitches.map((s) => s.from.st)
    const c = (Math.min(...xs) + Math.max(...xs)) / 2
    const top = Math.min(...eyeL.stitches.map((s) => s.from.round))
    const bot = Math.max(...eyeL.stitches.map((s) => s.to.round))
    lines.push(
      `Eyes (black embroidery thread): centre each eye ${sts(c)} either side of centre front, ` +
        `from ${roundWords(top)} down to ${roundWords(bot)}. Fill an upright oval about 1 stitch wide in satin stitch ` +
        '(straight stitches laid side by side, top to bottom). With white thread, add one tiny stitch near the top of each eye, on the side nearer the nose, for the catch-light.',
    )
  }
  const nose = features.find((f) => f.name === 'nose')
  if (nose && style === 'safety-stitched' && nose.stitches.length === 2) {
    const a = nose.stitches[1]!
    lines.push(
      `Nostrils (dark brown embroidery thread): on the muzzle, a little above its centre, work one short straight stitch each side: ` +
        `bring the needle up ${roundWords(a.from.round)} of the muzzle, above and a little to the outside of the centre, ` +
        'and take it down and in to just beside the centre, so the two stitches lean toward each other like a small open "v".',
    )
  } else if (nose) {
    const first = nose.stitches[0]!
    const last = nose.stitches[nose.stitches.length - 1]!
    const colour = nose.colourHex.toLowerCase() === NOSE_PINK ? 'pink' : 'dark brown'
    if (nose.on !== features[0]?.on || features.some((f) => f.name === 'mouth')) {
      lines.push(
        `Nose (${colour} embroidery thread): on the top half of the muzzle front, satin stitch a small triangle, point down. ` +
          `Lay the first stitch across the muzzle ${roundWords(first.from.round)} of the muzzle, about ${sts(first.to.st * 2)} wide, ` +
          `then work each stitch just below the last and a little shorter, until the point reaches ${roundWords(last.from.round)} of the muzzle, just above its centre.`,
      )
    } else {
      lines.push(
        `Nose (${colour} embroidery thread): ${roundWords(first.from.round)} of the head at centre front, satin stitch a small triangle, point down, about 1 stitch wide.`,
      )
    }
  }
  const mouth = features.find((f) => f.name === 'mouth')
  if (mouth) {
    lines.push(
      'Mouth (dark brown embroidery thread): from the point of the nose, work one straight stitch down through the centre of the muzzle, ' +
        'just past it. From the bottom of that stitch, work two short straight stitches each side in a shallow V, ' +
        'down and then up and out, so the mouth reads as a small "w".',
    )
  }
  const blushL = features.find((f) => f.name === 'blush-l')
  if (blushL) {
    const rs = blushL.stitches.map((s) => s.from.round)
    const cr = (Math.min(...rs) + Math.max(...rs)) / 2
    const cs = (blushL.stitches[0]!.from.st + blushL.stitches[0]!.to.st) / 2
    lines.push(
      `Blush (soft pink wool): ${roundWords(cr)}, ${sts(cs)} either side of centre front (below and outside each eye), ` +
        'satin stitch a small round patch about 1 stitch wide and 1 round high, the stitches lying along the round, pulled just snug so it sits soft.',
    )
  }
  lines.push('Fasten off each colour inside the head and trim the ends so none show.')
  return lines
}

// ── Placing it on the settled fabric ────────────────────────────────────────

/** The bits of a compiled, placed part the embroidery reads. Structural so
 *  this module needs nothing from `composition.ts` but the shape. */
export interface EmbroideryHost {
  part: { name: string; rounds: number[] }
  built?: BuiltContinuous
  xform?: { R: number[][]; T: V3; scale: number; c: V3 }
}

export interface PlacedEmbroidery {
  name: string
  hex: string
  /** The thread's own fibre look, if it differs from the toy's yarn. */
  fibre?: EmbroideryFeature['fibre']
  /** Thread bundle radius (mm). */
  radiusMm: number
  /** One centre-line per straight stitch, world mm, diving into the fabric
   *  at both ends. */
  strands: V3[][]
}

const sub = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
const add = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z })
const mul = (a: V3, s: number): V3 => ({ x: a.x * s, y: a.y * s, z: a.z * s })
const dotv = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z
const crossv = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })
const lenv = (a: V3): number => Math.hypot(a.x, a.y, a.z)
const normv = (a: V3): V3 => {
  const l = lenv(a) || 1
  return { x: a.x / l, y: a.y / l, z: a.z / l }
}
const lerpv = (a: V3, b: V3, t: number): V3 => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t })

/** The YARN's own rendered half-thickness over its centre-line: the
 *  composition renders every part as plied filaments with bundle radius
 *  `yr × 0.62` (`compositionScene`). */
const YARN_BUNDLE_FRAC = 0.62

/**
 * A sampler of one part's settled fabric in its LOCAL frame (the frame the
 * sphere builder worked it in: the magic ring on +z, rounds as latitude
 * circles round the z axis), so a (round, azimuth) is exactly what the hook
 * did. Reads the relaxed nodes after the composition's contact pass, i.e. the
 * fabric that is actually rendered.
 */
class FabricSampler {
  private byRound: { th: number[]; p: V3[] }[] = []
  private ringPole: V3
  private tailPole: V3
  readonly centre: V3
  readonly n: number

  constructor(built: BuiltContinuous, rounds: number[]) {
    const nodes = built.model.nodes
    const roundOf = (built.model as { round?: number[] }).round ?? []
    this.n = rounds.length
    for (let k = 0; k < this.n; k++) this.byRound.push({ th: [], p: [] })
    const path = built.strandPath
    const tailStart = path.length - 4
    const ring: V3[] = []
    const tail: V3[] = []
    let cx = 0, cy = 0, cz = 0
    for (let i = 0; i < path.length; i++) {
      const ni = path[i]!
      const v = nodes[ni]!
      const p: V3 = { x: v.x, y: v.y, z: v.z }
      this.cloud.push(p)
      cx += p.x; cy += p.y; cz += p.z
      if (i >= tailStart) { tail.push(p); continue }
      const k = roundOf[ni] ?? -1
      if (k < 0) { ring.push(p); continue }
      if (k >= this.n) continue
      this.byRound[k]!.th.push(Math.atan2(p.y, p.x))
      this.byRound[k]!.p.push(p)
    }
    this.centre = { x: cx / path.length, y: cy / path.length, z: cz / path.length }
    const mean = (a: V3[]): V3 => {
      const s = a.reduce((m, p) => add(m, p), { x: 0, y: 0, z: 0 })
      return mul(s, 1 / Math.max(a.length, 1))
    }
    this.ringPole = ring.length ? mean(ring) : { x: 0, y: 0, z: this.centre.z + 1 }
    this.tailPole = tail.length ? mean(tail) : { x: 0, y: 0, z: this.centre.z - 1 }
  }

  /** The fabric's mean centre-line point on round k (0-based) at azimuth th,
   *  and the highest crown within half a stitch of it along `n` (filled in by
   *  the caller once the normal is known). */
  private roundPoint(k: number, th: number): V3 {
    const R = this.byRound[Math.max(0, Math.min(this.n - 1, k))]!
    const count = Math.max(R.p.length, 1)
    // Window: about one stitch either side. Nodes per stitch ≈ count / sts.
    const sig = (2 * Math.PI) / Math.max(6, count / 6) * 0.9
    let w = 0
    let s: V3 = { x: 0, y: 0, z: 0 }
    for (let i = 0; i < R.p.length; i++) {
      let d = R.th[i]! - th
      d = Math.atan2(Math.sin(d), Math.cos(d))
      const g = Math.exp(-(d * d) / (2 * sig * sig))
      if (g < 1e-4) continue
      w += g
      s = add(s, mul(R.p[i]!, g))
    }
    if (w < 1e-9) return R.p[0] ?? this.centre
    return mul(s, 1 / w)
  }

  /** Centre-line surface at a pattern round (1-based, fractional) and azimuth. */
  at(round: number, th: number): V3 {
    if (round <= 1) {
      const t = Math.max(0, round)
      return lerpv(this.ringPole, this.roundPoint(0, th), t)
    }
    if (round >= this.n) {
      const t = Math.min(1, round - this.n)
      return lerpv(this.roundPoint(this.n - 1, th), this.tailPole, t)
    }
    const k0 = Math.floor(round) - 1
    const t = round - Math.floor(round)
    return lerpv(this.roundPoint(k0, th), this.roundPoint(k0 + 1, th), t)
  }

  /** Outward normal at (round, th). */
  normal(round: number, th: number): V3 {
    const p = this.at(round, th)
    const dr = sub(this.at(round + 0.15, th), this.at(round - 0.15, th))
    const dt = sub(this.at(round, th + 0.06), this.at(round, th - 0.06))
    let nrm = crossv(dr, dt)
    const out = sub(p, this.centre)
    if (lenv(nrm) < 1e-6 || lenv(dt) < 0.05) nrm = out
    nrm = normv(nrm)
    if (dotv(nrm, out) < 0) nrm = mul(nrm, -1)
    return nrm
  }

  /** Every settled centre-line point of the part (local frame). */
  readonly cloud: V3[] = []

  /** How far the tops of the crocheted stitches stand above point q along n:
   *  the highest centre-line node within `reach` mm of the line through q. */
  height(q: V3, n: V3, reach = 2.6): number {
    let best = -Infinity
    const r2 = reach * reach
    for (const v of this.cloud) {
      const dx = v.x - q.x, dy = v.y - q.y, dz = v.z - q.z
      if (Math.abs(dx) > 9 || Math.abs(dy) > 9 || Math.abs(dz) > 9) continue
      const h = dx * n.x + dy * n.y + dz * n.z
      const l2 = dx * dx + dy * dy + dz * dz - h * h
      if (l2 > r2) continue
      if (h > best) best = h
    }
    return Number.isFinite(best) ? best : 0
  }
}

/** Resolve a feature's azimuth for stitch 0 and the sign of +stitch in the
 *  part's local frame. */
function featureFrame(f: EmbroideryFeature, host: EmbroideryHost): { th0: number; sign: 1 | -1 } {
  const R = host.xform?.R ?? [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  // local = Rᵀ · world
  const toLocal = (d: V3): V3 => ({
    x: R[0]![0]! * d.x + R[1]![0]! * d.y + R[2]![0]! * d.z,
    y: R[0]![1]! * d.x + R[1]![1]! * d.y + R[2]![1]! * d.z,
    z: R[0]![2]! * d.x + R[1]![2]! * d.y + R[2]![2]! * d.z,
  })
  const z = toLocal(normv(f.zeroDir))
  const th0 = Math.atan2(z.y, z.x)
  const r = toLocal(normv(f.rightDir))
  // The direction of increasing azimuth at th0 is (-sin, cos, 0).
  const tang = { x: -Math.sin(th0), y: Math.cos(th0), z: 0 }
  return { th0, sign: dotv(tang, r) >= 0 ? 1 : -1 }
}

/**
 * Lay every feature's stitches on the settled fabric. Returns world-mm
 * centre-lines, one per straight stitch, for the scene to ply into yarn.
 */
export function placeEmbroidery(features: EmbroideryFeature[], hosts: Map<string, EmbroideryHost>, yr: number): PlacedEmbroidery[] {
  const samplers = new Map<string, FabricSampler>()
  const out: PlacedEmbroidery[] = []
  for (const f of features) {
    const host = hosts.get(f.on)
    if (!host?.built) throw new Error(`embroidery '${f.name}' sits on unknown part '${f.on}'`)
    let S = samplers.get(f.on)
    if (!S) {
      S = new FabricSampler(host.built, host.part.rounds)
      samplers.set(f.on, S)
    }
    const { th0, sign } = featureFrame(f, host)
    const x = host.xform ?? { R: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], T: { x: 0, y: 0, z: 0 }, scale: 1, c: { x: 0, y: 0, z: 0 } }
    const toWorld = (v: V3): V3 => {
      const d = mul(sub(v, x.c), x.scale)
      const R = x.R
      return {
        x: x.T.x + R[0]![0]! * d.x + R[0]![1]! * d.y + R[0]![2]! * d.z,
        y: x.T.y + R[1]![0]! * d.x + R[1]![1]! * d.y + R[1]![2]! * d.z,
        z: x.T.z + R[2]![0]! * d.x + R[2]![1]! * d.y + R[2]![2]! * d.z,
      }
    }
    const rounds = host.part.rounds
    const thOf = (s: SurfaceSpot): number => th0 + sign * ((2 * Math.PI) / countAt(rounds, Math.max(1, Math.min(rounds.length, s.round)))) * s.st
    const bundle = yr * YARN_BUNDLE_FRAC
    const rt = f.threadMm
    const strands: V3[][] = []
    const same = (a: SurfaceSpot, b: SurfaceSpot): boolean => Math.abs(a.round - b.round) < 1e-9 && Math.abs(a.st - b.st) < 1e-9
    // BACKSTITCH: a stitch that comes up in the hole the last one went down
    // in continues the same visible line (the thread goes down and up through
    // one gap), so a chain of them is laid as ONE run, smoothed as one curve,
    // with a small dip at each shared hole instead of a dive. A lid is one
    // such run; a lash or a mouth stitch is a run of one.
    const runs: EmbroideryStitch[][] = []
    f.stitches.forEach((st, idx) => {
      const prev = idx > 0 ? f.stitches[idx - 1]! : null
      if (prev && same(prev.to, st.from) && !st.taut && !prev.taut) runs[runs.length - 1]!.push(st)
      else runs.push([st])
    })
    for (const run of runs) {
      const first = run[0]!
      const firstIdx = f.stitches.indexOf(first)
      // A stitch that starts in a hole an EARLIER stitch already used (a lash
      // coming out of the lid's backstitch hole) shows no dive at its root:
      // the visible thread starts where it leaves the lid.
      const rootShared = f.stitches.slice(0, firstIdx).some((o) => same(o.from, first.from) || same(o.to, first.from))
      // Sample the run: each stitch's chord is straight between its two
      // holes (a straight stitch is taut), lifted onto the tops of the
      // crocheted stitches under it.
      const surf: { p: V3; n: V3; h: number; hole: boolean }[] = []
      let runChord = 0
      for (const st of run) {
        const ta = thOf(st.from)
        const tb = thOf(st.to)
        const pa = S.at(st.from.round, ta)
        const pb = S.at(st.to.round, tb)
        const na = S.normal(st.from.round, ta)
        const nb = S.normal(st.to.round, tb)
        const chord = lenv(sub(pb, pa)) * x.scale
        runChord += chord
        const nSeg = Math.max(3, Math.ceil(chord / 0.5))
        for (let i = surf.length ? 1 : 0; i <= nSeg; i++) {
          const t = i / nSeg
          const n = normv(lerpv(na, nb, t))
          const q = lerpv(pa, pb, t)
          // A long run (a lid) rides the crowns over a wider reach, so it is
          // one smooth arc rather than a trace of every bump under it.
          surf.push({ p: q, n, h: S.height(q, n, first.taut ? 2.6 : 3.2), hole: i === nSeg && st !== run[run.length - 1] })
        }
      }
      const N = surf.length - 1
      const dive = bundle + rt * (runChord < 4 ? 1.0 : 1.8)
      if (first.taut) {
        // A TAUT short stitch (a lash): a dead-straight thread from its root
        // to its tip, over the highest crown between them, then down into
        // the fabric at the tip. Nothing follows the crowns, so it never kinks.
        let top = -Infinity
        for (const q of surf) top = Math.max(top, q.h)
        // Its two ends sit at the fabric where the needle went through (so a
        // dive is short, not a visible leg), and the thread tents over the
        // highest crown between them.
        const rootH = (rootShared ? Math.max(surf[0]!.h, top - rt) : surf[0]!.h) + bundle + rt * (rootShared ? 0.7 : 0.35)
        const tipH = surf[N]!.h + bundle + rt * 0.35
        const a = add(surf[0]!.p, mul(surf[0]!.n, rootH))
        const b = add(surf[N]!.p, mul(surf[N]!.n, tipH))
        const midH = Math.max(top + bundle + rt * 0.3, (rootH + tipH) / 2)
        const mid = surf[Math.floor(N / 2)]!
        const m = add(mid.p, mul(mid.n, midH))
        const line: V3[] = []
        if (!rootShared) line.push(toWorld(add(a, mul(surf[0]!.n, -dive))))
        const k = 3
        for (let i = 0; i <= k; i++) line.push(toWorld(lerpv(a, m, i / k)))
        for (let i = 1; i <= k; i++) line.push(toWorld(lerpv(m, b, i / k)))
        // The dive at the tip: straight on a little, then down.
        const dir = normv(sub(b, m))
        line.push(toWorld(add(add(b, mul(dir, rt * 0.5)), mul(surf[N]!.n, -dive * 0.5))))
        line.push(toWorld(add(add(b, mul(dir, rt * 0.8)), mul(surf[N]!.n, -dive))))
        strands.push(line)
        continue
      }
      // A taut thread bridges the dips between stitches: it rests on the
      // highest crown within a couple of samples either side, smoothed along
      // the whole run.
      const sm = surf.map((_, i) => {
        let m = -Infinity
        for (let j = Math.max(0, i - 3); j <= Math.min(N, i + 3); j++) m = Math.max(m, surf[j]!.h)
        return m
      })
      const sm2 = sm.map((_, i) => {
        let a = 0, w = 0
        for (let j = Math.max(0, i - 5); j <= Math.min(N, i + 5); j++) { a += sm[j]!; w++ }
        return a / w
      })
      const line: V3[] = []
      if (!rootShared) line.push(toWorld(add(surf[0]!.p, mul(surf[0]!.n, sm2[0]! + bundle - dive))))
      for (let i = 0; i <= N; i++) {
        const s = surf[i]!
        // The two ends are pulled down into the gap they pass through (only a
        // little at a shared root); the run in between rests on the crowns,
        // dipping a touch at each shared backstitch hole.
        const e = Math.min(1, Math.min(i, N - i) / 2)
        const endPull = i === 0 && rootShared ? 0.3 : runChord < 4 ? 0.5 : 0.9
        const holeDip = s.hole ? 0.25 : 0
        const h = sm2[i]! + bundle + rt * (0.2 + 0.6 * e) - rt * endPull * (1 - e) - rt * holeDip
        line.push(toWorld(add(s.p, mul(s.n, h))))
      }
      line.push(toWorld(add(surf[N]!.p, mul(surf[N]!.n, sm2[N]! + bundle - dive))))
      strands.push(line)
    }
    out.push({ name: f.name, hex: f.colourHex, radiusMm: rt, strands, ...(f.fibre ? { fibre: f.fibre } : {}) })
  }
  return out
}
