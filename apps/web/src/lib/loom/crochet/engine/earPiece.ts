/**
 * THE EAR PIECE (cupped-ear pass, 2026-10-17): one reusable, audited ear for
 * any amigurumi, built the way a maker makes it. Two kinds.
 *
 * 'cup' — the round CUPPED ear the bar's Highland cow wears under its horns.
 *   An open half-ball worked from a magic ring, +6 a round to `width`, then
 *   `depth` rounds even (a deeper oval bowl), and optionally `rimRoll` more
 *   even rounds folded back over the outside of the rim (the tube's own fold
 *   brim: a real fold of real rounds, the thick rolled lip the bar shows).
 *   Never stuffed, left open. As it is sewn on the base of the rim is
 *   PINCHED together (`pinch`), so the round rim draws to a point there and
 *   the bowl tips forward; it may also be squeezed gently into an oval
 *   (`squash`). The hollow faces out of the open rim (local -z); the pinched
 *   base is the local -y side.
 *
 * 'lop' — the long, lined lop ear of the bar's sleepy bunny. Worked TIP
 *   FIRST from the ring, +3 a round (a ROUNDED tip: a +6 round off the ring is
 *   a flat disc and flattens to a plank end), long straight rounds, narrowed in
 *   threes toward the base (`taper`) and left OPEN at the base. Pressed flat
 *   (two layers) and folded in a little at the base as it is sewn on, so the
 *   front face stays softly hollow down its length (`depth`, `pinch`), its
 *   edges turned forward (`rimRoll`). The lining is a tapestry panel down the
 *   middle of the front face (local +x); the tip is local +z, the base -z.
 *
 * Construction honesty: every ear is `buildTube` (one strand, every hook
 * recorded, the ring the only pinned node), relaxed and AUDITED like every
 * pressed piece (composition.ts `buildPart` / `auditPart`, the settled frame).
 * The press, its bow and the pinch are plates (relax.ts `press`,
 * `pressShape`, `pinch`): external one-sided contact like the table, never a
 * pin and never a join between stitches. The lining's stitches are exactly
 * the ones the words print.
 *
 * Nothing here is imported by a preset unless its opt-in switch is on, so
 * every geometry hash is untouched with the switches off.
 */

import { auditPart, buildPart, type AmigurumiPart, type PartPlacement } from './composition'
import { STITCHES } from './dictionary'
import { writeInstructions } from './program'
import { withPanel } from './compositionPattern'
import type { BuiltContinuous } from './yarnPath'

export type EarKind = 'cup' | 'lop'

export interface EarPieceOptions {
  kind: EarKind
  /** SIZE: stitches round at the widest round. A cup grows +6 a round (a
   *  multiple of 6 is exact; anything else ends on a partial step); a lop +3
   *  a round (a multiple of 3). */
  width: number
  /** DEPTH. A cup: rounds worked even after the widest (0 = a shallow
   *  half-ball; 2-3 = the deeper bowl most cupped-ear patterns write). A
   *  lop: how hollow its front face is, 0..1 (the bow of the press as a
   *  fraction of the flattened half-width; 0 = flat). */
  depth: number
  /** RIM ROLL. A cup: rounds worked even and folded back over the outside of
   *  the rim (0-2; 1 is the bar's lip). A lop: how sharply its edges turn
   *  forward on top of the hollow, 0..1. */
  rimRoll?: number
  /** PINCH at the base, 0..1. A cup: how far the base of the rim is drawn
   *  together (1 = the two walls a yarn's width from touching there). A lop:
   *  how much deeper the fold is at the base than at the tip. */
  pinch?: number
  /** A cup: how much it is squeezed across into an oval, 0..1 of its own
   *  width (default 0 = round). Ignored for a lop. */
  squash?: number
  /** A lop: its whole length in rounds (default 30). */
  length?: number
  /** A lop: how much it narrows toward the base, 0..1 of the width (default
   *  0.3). */
  taper?: number
  /** An optional CONTRAST LINING (hex). A lop: a tapestry panel down the
   *  middle of its front face. A cup: the bowl's first rounds worked in the
   *  contrast, so the inside of the cup is lined and the walls and rim are
   *  the main yarn. Absent = one colour. */
  liningHex?: string
  /** A lop: the lining's share of each round, 0..1 (default 0.42, the
   *  bunny's). A cup: the rounds worked in the lining (default: up to and
   *  including the second-widest). */
  liningFrac?: number
  liningRounds?: number
  /** A lop: the plates' final gap, centre-line to centre-line, in yarn radii
   *  (default 12; measured, an open lop audits clean down to it at fine and
   *  bulky yarn). */
  pressYr?: number
}

function validate(o: EarPieceOptions): void {
  if (o.width < 9) throw new Error(`ear: width ${o.width} is under the smallest ear (9 st)`)
  if (o.kind === 'cup') {
    if (o.depth < 0 || o.depth > 6 || !Number.isInteger(o.depth)) throw new Error(`ear: a cup's depth is 0-6 even rounds (got ${o.depth})`)
    const roll = o.rimRoll ?? 0
    if (roll < 0 || roll > 2 || !Number.isInteger(roll)) throw new Error(`ear: a cup's rim roll is 0-2 folded rounds (got ${roll})`)
  } else if (o.depth < 0 || o.depth > 1) throw new Error(`ear: a lop's depth is 0..1 (got ${o.depth})`)
}

/** The rounds an ear is worked in, ring first; the last round is the open
 *  rim (a cup, rim roll included) or the open base (a lop). */
export function earRounds(o: EarPieceOptions): number[] {
  validate(o)
  if (o.kind === 'cup') {
    const out: number[] = [6]
    while (out[out.length - 1]! < o.width) out.push(Math.min(o.width, out[out.length - 1]! + 6))
    for (let i = 0; i < o.depth + (o.rimRoll ?? 0); i++) out.push(o.width)
    return out
  }
  const up: number[] = [6]
  for (let n = 9; n < o.width; n += 3) up.push(n)
  up.push(o.width)
  const length = o.length ?? 30
  const base = Math.max(9, o.width - 3 * Math.round((o.width * (o.taper ?? 0.3)) / 3))
  const steps = Math.round((o.width - base) / 3)
  // The narrowing over the lower 40% of the ear, a decrease round evenly
  // spaced (the rounds between hold their count).
  const taperLen = Math.max(steps, Math.round(length * 0.4))
  const straight = Math.max(2, length - up.length - taperLen)
  const out = [...up, ...Array.from({ length: straight }, () => o.width)]
  for (let i = 0; i < taperLen; i++) out.push(Math.max(base, o.width - 3 * Math.round(((i + 1) * steps) / taperLen)))
  return out
}

/** A lop's lining runs: per round, [first st, count], centred so a main
 *  colour edge shows either side once the ear is flattened. Only on rounds
 *  worked even (plain sc, so the run is exact) and near the full width. */
export function earLining(o: EarPieceOptions, rounds = earRounds(o)): Record<number, [number, number]> {
  const runs: Record<number, [number, number]> = {}
  if (!o.liningHex || o.kind !== 'lop') return runs
  const frac = o.liningFrac ?? 0.42
  const widest = Math.max(...rounds)
  for (let k = 1; k < rounds.length; k++) {
    const n = rounds[k]!
    if (n !== rounds[k - 1] || n < widest * 0.75) continue
    const count = Math.max(2, Math.round(n * frac))
    runs[k] = [Math.floor((n - count) / 2), count]
  }
  return runs
}

/** A cup's lining: how many rounds from the ring are worked in the contrast. */
export function cupLiningRounds(o: EarPieceOptions, rounds = earRounds(o)): number {
  if (!o.liningHex || o.kind !== 'cup') return 0
  const widest = rounds.indexOf(o.width)
  return Math.max(1, Math.min(rounds.length - 1, o.liningRounds ?? widest))
}

/** The plates' bow for a lop (relax.ts `pressShape`). */
export function earPressShape(o: EarPieceOptions): { hollow: number; roll: number; pinch: number } {
  return { hollow: o.depth * 0.5, roll: (o.rimRoll ?? 0) * 0.35, pinch: o.pinch ?? 0 }
}

/** The widest round's settled-free diameter (mm): the round's own count at
 *  the stitch's gauge, before any relax. */
function widestDiameterMm(o: EarPieceOptions, yr: number): number {
  return (o.width * yr * STITCHES.sc.gaugeYr) / Math.PI
}

/** The ear's piece words, from the same counts. */
export function earWords(o: EarPieceOptions): string[] {
  const rounds = earRounds(o)
  const lines = writeInstructions({ name: 'ear', stitch: 'sc', form: 'sphere', rounds }).slice(0, -1)
  if (o.kind === 'cup') {
    const lining = cupLiningRounds(o, rounds)
    const roll = o.rimRoll ?? 0
    const body = lining ? ['Start with the lining yarn.', ...lines.slice(0, lining), 'Change to the main yarn.', ...lines.slice(lining)] : lines
    const pinch = o.pinch ?? 0
    const shape = [
      roll > 0 ? `Fold the last ${roll === 1 ? 'round' : `${roll} rounds`} back over the outside of the ear, so the rim rolls outward into a thick lip.` : null,
      (o.squash ?? 0) > 0 ? 'Squeeze the cup gently from side to side into an oval.' : null,
      pinch > 0
        ? `Pinch the rim together at the base${pinch >= 0.7 ? ' until the two sides meet' : ' a little'} and sew the pinch to the head, so the cup tips forward with the hollow facing out.`
        : 'Sew the ear on by its back with the hollow facing out.',
    ].filter((x): x is string => !!x)
    return [
      ...body,
      'Work in a continuous spiral without joining; mark the first stitch of each round.',
      'Do not stuff and do not close the ear: fasten off leaving a long tail for sewing, so the rim stays open.',
      ...shape,
    ]
  }
  const runs = earLining(o, rounds)
  const lined = Object.keys(runs).length > 0
  const body = lined ? withPanel(lines, { rounds, panel: runs }) : lines
  return [
    ...body,
    'Work in a continuous spiral without joining; mark the first stitch of each round.',
    `Do not stuff and do not close the ear: fasten off leaving a long tail for sewing, so the last round stays open.${lined ? ' Keep the lining in the middle of the front.' : ''}`,
    `Press the ear flat so the opening becomes a straight edge${(o.pinch ?? 0) > 0 || o.depth > 0 ? ', then fold the base in a little and pinch it as you sew, so the front of the ear stays softly hollow down to the rounded tip' : ''}.`,
  ]
}

/** One ear as a composition part. The caller gives the name, colour and
 *  placement (a cup: its hollow is local -z, its pinched base local -y; a lop:
 *  its lined face is local +x, its tip local +z). `yr` is the composition's
 *  yarn radius (mm), which sets the plates in millimetres. */
export function earPart(
  o: EarPieceOptions,
  base: { name: string; colourHex: string; place: PartPlacement; sewNote?: string },
  yr: number,
): AmigurumiPart {
  const rounds = earRounds(o)
  const common = {
    name: base.name,
    stitch: 'sc' as const,
    rounds,
    colourHex: base.colourHex,
    tube: { anchor: 'ring' as const, join: 'spiral' as const, cap: 'dome' as const },
    words: earWords(o),
    ...(base.sewNote ? { sewNote: base.sewNote } : {}),
    place: base.place,
  }
  if (o.kind === 'cup') {
    const D = widestDiameterMm(o, yr)
    const squash = o.squash ?? 0
    const pinch = o.pinch ?? 0
    const lining = cupLiningRounds(o, rounds)
    return {
      ...common,
      ...((o.rimRoll ?? 0) > 0 ? { rimFold: o.rimRoll } : {}),
      ...(squash > 0 ? { press: D * (1 - squash) } : {}),
      // Finger and thumb in a V at the base of the rim: wide open at pinch 0,
      // a 50° half-angle at pinch 1 (measured: a 35° V tears the rim round's
      // hooks off their crowns), the walls closing to a yarn's width apart at
      // the point.
      ...(pinch > 0 ? { pinch: { halfAngleDeg: 90 - 40 * pinch, gap: 4 * yr } } : {}),
      ...(lining && o.liningHex
        ? { colourHex: o.liningHex, colourChanges: [{ fromRound: lining + 1, hex: base.colourHex, label: 'main' }] }
        : {}),
    }
  }
  const runs = earLining(o, rounds)
  return {
    ...common,
    press: (o.pressYr ?? 10) * yr,
    pressShape: earPressShape(o),
    ...(o.liningHex && Object.keys(runs).length ? { panel: { hex: o.liningHex, runs } } : {}),
  }
}

// ─── Building one ear on its own (tests, proofs) ────────────────────────────

/** Build, relax and audit one ear exactly as the composition does. */
export function buildEar(o: EarPieceOptions, yr: number): { built: BuiltContinuous; problems: string[]; part: AmigurumiPart; panelMask?: boolean[] } {
  const part = earPart(o, { name: 'ear', colourHex: '#888888', place: { on: 'ground' } }, yr)
  const { built, panelMask } = buildPart(part, yr)
  return { built, problems: auditPart(built, part, yr), part, panelMask }
}

export interface EarMetrics {
  /** Bounding extents of the settled ear in its own frame, mm. */
  sizeMm: { x: number; y: number; z: number }
  /** A cup: how deep the hollow is (mm) — the open rim's mean height above
   *  the inside of the bowl's middle, along the cup's axis. A lop: how far
   *  its front face's edges stand forward of its middle (mm), on the middle
   *  band of its length. > 0 = a real hollow. */
  hollowMm: number
  /** A cup: the rim's opening, across (x) and along (y), mm, and how much
   *  narrower the base fifth of the rim is than the top fifth (0 = round). */
  rimMm?: { x: number; y: number; pinch: number }
  /** A lop: its width at 15% and 50% of the widest width back from the tip,
   *  as fractions of the widest. A rounded tip narrows smoothly (~0.7-0.85
   *  then ~1); a plank end is full width at once (~1 / 1). */
  tipWidth15?: number
  tipWidth50?: number
}

/** Measure a settled ear in its own frame. */
export function earMetrics(o: EarPieceOptions, built: BuiltContinuous): EarMetrics {
  const all = built.model.nodes
  const nodes = all.slice(built.anchorPins ?? 0)
  const ext = (f: (n: { x: number; y: number; z: number }) => number): [number, number] => {
    let lo = Infinity, hi = -Infinity
    for (const n of nodes) { const v = f(n); lo = Math.min(lo, v); hi = Math.max(hi, v) }
    return [lo, hi]
  }
  const [x0, x1] = ext((n) => n.x)
  const [y0, y1] = ext((n) => n.y)
  const [z0, z1] = ext((n) => n.z)
  const sizeMm = { x: x1 - x0, y: y1 - y0, z: z1 - z0 }
  if (o.kind === 'cup') {
    // The ring (bowl's bottom) is at the top of the local frame (+z), the open
    // rim at the bottom (-z). The bowl's middle: the inner layer near the
    // axis; the rim: the lowest nodes (a folded lip turns back up, so the
    // rim is the fold's low edge).
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
    const R = Math.min(sizeMm.x, sizeMm.y) / 2
    let inner = Infinity
    for (const n of nodes) if (Math.hypot(n.x - cx, n.y - cy) < R * 0.25) inner = Math.min(inner, n.z)
    const rimBand = z0 + Math.max(sizeMm.z * 0.12, 1)
    const rim = nodes.filter((n) => n.z <= rimBand)
    const rimZ = rim.reduce((a, n) => a + n.z, 0) / Math.max(1, rim.length)
    let rxlo = Infinity, rxhi = -Infinity, rylo = Infinity, ryhi = -Infinity
    for (const n of rim) {
      rxlo = Math.min(rxlo, n.x); rxhi = Math.max(rxhi, n.x); rylo = Math.min(rylo, n.y); ryhi = Math.max(ryhi, n.y)
    }
    const ry = ryhi - rylo
    // The rim's width across at its base end (the -y fifth) and its top end.
    const span = (a: number, b: number): number => {
      let lo = Infinity, hi = -Infinity
      for (const n of rim) {
        const v = (n.y - rylo) / (ry || 1)
        if (v < a || v > b) continue
        lo = Math.min(lo, n.x); hi = Math.max(hi, n.x)
      }
      return hi > lo ? hi - lo : 0
    }
    const baseW = span(0, 0.2)
    const topW = span(0.8, 1)
    return {
      sizeMm,
      hollowMm: inner === Infinity ? 0 : inner - rimZ,
      rimMm: { x: rxhi - rxlo, y: ry, pinch: topW > 0 ? 1 - baseW / topW : 0 },
    }
  }
  // A lop: the front face across the middle band, the most forward node per
  // slice across the width.
  const L = sizeMm.z, W = sizeMm.y
  const BINS = 12
  const front = new Array<number>(BINS).fill(-Infinity)
  for (const n of nodes) {
    const t = (n.z - z0) / (L || 1)
    if (t < 0.3 || t > 0.7) continue
    const b = Math.min(BINS - 1, Math.max(0, Math.floor(((n.y - y0) / (W || 1)) * BINS)))
    front[b] = Math.max(front[b]!, n.x)
  }
  const mid = (front[BINS / 2 - 1]! + front[BINS / 2]!) / 2
  const edge = (front[1]! + front[BINS - 2]!) / 2
  const widthAt = (d: number): number => {
    const band = Math.max(W * 0.03, 0.5)
    let lo = Infinity, hi = -Infinity
    for (const n of nodes) {
      if (Math.abs(z1 - d - n.z) > band) continue
      lo = Math.min(lo, n.y); hi = Math.max(hi, n.y)
    }
    return hi > lo ? hi - lo : 0
  }
  return { sizeMm, hollowMm: edge - mid, tipWidth15: widthAt(0.15 * W) / W, tipWidth50: widthAt(0.5 * W) / W }
}
