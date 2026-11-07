/**
 * THE PINCHED EAR (engine-shapes-1107): a general ear sewn on BY ITS PINCH,
 * the construction the bar's cow, bear and mouse ears use (CUTE-RULES 18-21
 * and 40, `rolled-rim-cup`). Two shapes, either lined with a contrast inner.
 *
 * 'round' — a cow / bear / mouse ear. A rolled-rim cup (earPiece.ts 'cup': a
 *   half-ball worked from a magic ring, +6 a round, worked even for its depth,
 *   the last round(s) folded back over the outside into a plump lip). The
 *   base of the rim is PINCHED until its two sides meet and held with two
 *   small stitches through both layers; the ear is then sewn to the head by
 *   that pinch ALONE, so the cup stands out from the head with its hollow
 *   facing forward, instead of lying on the head by its back (earPiece's cup
 *   is sewn by its ring and cannot stand out past the head: rule 40's note).
 *
 * 'pointed' — a cat / fox ear with a soft roll. A short cone worked tip first
 *   (earPiece.ts 'lop': +3 a round from 6, so the tip is a soft point, not a
 *   flat disc), worked even a few rounds, pressed into a shallow scoop with
 *   its edges turned forward (the soft roll), the open base pinched in and
 *   sewn on by it.
 *
 * Construction honesty: both are earPiece's audited pieces, built and relaxed
 * exactly as earPart makes them (buildTube, one strand, the ring the only
 * pinned node; the pinch and the press are one-sided plates, never pins). The
 * audit runs on the settled piece in its own frame; the pose that turns it to
 * be sewn by its pinch is rigid, so the stitches it audited are the ones
 * placed. The composition seats the pinch (CustomPiece.seat) on the join.
 *
 * Posed frame (what a placement sees): the pinch at the origin end, the ear
 * standing out along local +z (the placement's `aim`), the hollow facing
 * local +x (the placement's `spin`), local -z the head. Opt-in: nothing
 * imports this unless a preset's switch is on.
 */

import { auditPart, buildPart, relaxPressed, type AmigurumiPart, type PartPlacement } from './composition'
import { buildTube } from './tube'
import { earMetrics, earPart, earRounds, earWords, type EarMetrics, type EarPieceOptions } from './earPiece'
import type { BuiltContinuous } from './yarnPath'

export type PinchEarShape = 'round' | 'pointed'

export interface PinchEarOptions {
  shape: PinchEarShape
  /** Stitches round the widest round (round: +6 a round, 9 up; pointed: +3
   *  a round, 9-15). */
  width: number
  /** Rounds worked even after the widest (round: 0-4, then the rim; pointed:
   *  the ear's straight length, 1-8, at least 4 rounds even in all, the
   *  lop's own minimum). */
  depth: number
  /** Round: folded rounds of the rolled rim (1-2, default 1). Pointed: how far
   *  the edges turn forward, 0..1 (default 1). */
  rimRoll?: number
  /** How far the base is pinched together, 0.3..1 (default: a round cup 1,
   *  the sides meeting, up to 21 sts and 0.7 wider; a pointed ear 0.7). */
  pinch?: number
  /** A contrast inner (hex): the round cup's first rounds, the pointed ear's
   *  middle panel. */
  liningHex?: string
  /** A round cup only: THE TOP ROLL. One more rim round worked over the top
   *  arc only (a part round: the first `arc` of the round, which a round
   *  started at the magic ring's tail puts over the top, opposite the pinch),
   *  then the rim folded back: two rounds deep over the top, one over the
   *  base, so the roll is plump at the top and thin at the pinch (the bar's
   *  cow ear, CUTE-RULES 21). `arc` 0.3..0.75 of the round (default 0.45;
   *  the cow takes 0.33), as long as the pinch still fits clear of both
   *  ends. The ear is pinched `topRollGapSts(count)` whole stitches clear of
   *  the near end of the part round (`gapSts` overrides the distance to the
   *  pinch's middle, in stitches), so the plump roll runs along one edge of
   *  the ear out from the pinch: `side` +1
   *  pinches back from the middle (against the way the rounds run), -1 on
   *  from it (a pair of ears takes one of each, so both rolls are on top).
   *  Absent = the even roll. */
  topRoll?: { arc?: number; side?: 1 | -1; gapSts?: number }
  /** A round cup only: squeezed gently across into an oval before it is
   *  pinched, 0..0.6 of its width (earPiece's `squash`). Absent = round. */
  squash?: number
}

const DEFAULTS = { round: { rimRoll: 1 }, pointed: { rimRoll: 1, pinch: 0.7 } }
/** A round cup's pinch: until the sides meet up to 21 sts (at 0.7 a cup of
 *  18 or less does not narrow at all, measured); a wider cup at 1 tears its
 *  rim round's hooks sideways off their crowns (24: 3, 30: 6 failures,
 *  measured), so 0.7. */
const roundPinch = (width: number): number => (width <= 21 ? 1 : 0.7)

function validate(o: PinchEarOptions): void {
  if (o.shape === 'round') {
    if (o.topRoll && (o.rimRoll ?? 1) !== 1) throw new Error('pinch ear: the top roll goes on a one-round rim (rimRoll 1)')
    if (o.topRoll && ((o.topRoll.arc ?? 0.45) < 0.3 || (o.topRoll.arc ?? 0.45) > 0.75)) throw new Error(`pinch ear: the top roll's arc is 0.3..0.75 (got ${o.topRoll.arc})`)
    if (o.topRoll) {
      // The pinch must sit nearer the part round's near end than its far end
      // (else the roll runs round the far edge, opposite the pinch).
      const n = topRollStitches(o), d = o.topRoll.gapSts ?? topRollGapSts(o.width) + 0.5
      if (n + 2 * d > o.width) throw new Error(`pinch ear: a part round of ${n} sts leaves no room for the pinch ${d} sts clear of both its ends on a ${o.width}-st cup (arc at most ${((o.width - 2 * d) / o.width).toFixed(2)})`)
    }
    if (!Number.isInteger(o.depth) || o.depth < 0 || o.depth > 4) throw new Error(`pinch ear: a round ear's depth is 0-4 even rounds (got ${o.depth})`)
    const r = o.rimRoll ?? 1
    if (r !== 1 && r !== 2) throw new Error(`pinch ear: a round ear's rim roll is 1 or 2 folded rounds (got ${r})`)
  } else {
    if (!Number.isInteger(o.depth) || o.depth < 1 || o.depth > 8) throw new Error(`pinch ear: a pointed ear's length is 1-8 even rounds (got ${o.depth})`)
    // Measured (engine-shapes-1107): a +3 cone to 18 floats a hook off its
    // crown in its third round at any press (8-16 yr); 9-15 audit clean.
    if (o.width < 9 || o.width > 15) throw new Error(`pinch ear: a pointed ear is 9-15 sts wide (got ${o.width})`)
  }
  const p = o.pinch ?? (o.shape === 'round' ? roundPinch(o.width) : 0.7)
  if (p < 0.3 || p > 1) throw new Error(`pinch ear: the pinch is 0.3..1 (got ${p}); an unpinched ear is earPiece's`)
  if (o.shape === 'round' && o.width > 21 && p > 0.85) throw new Error(`pinch ear: a cup over 21 sts tears at a pinch over 0.85 (got ${p} at ${o.width})`)
}

/** The earPiece options each shape is built from. */
export function pinchEarPiece(o: PinchEarOptions): EarPieceOptions {
  validate(o)
  if (o.shape === 'round') {
    // The top roll's part round is one more rim round (folded with the rest).
    return {
      kind: 'cup', width: o.width, depth: o.depth, rimRoll: (o.rimRoll ?? DEFAULTS.round.rimRoll) + (o.topRoll ? 1 : 0), pinch: o.pinch ?? roundPinch(o.width),
      ...(o.squash ? { squash: o.squash } : {}), ...(o.liningHex ? { liningHex: o.liningHex } : {}),
    }
  }
  // A short cone: the +3 rounds up to the width, then `depth` even, open at
  // the base (no taper).
  const up = Math.ceil((o.width - 6) / 3) + 1
  return {
    kind: 'lop', width: o.width, depth: 1, rimRoll: o.rimRoll ?? DEFAULTS.pointed.rimRoll, pinch: o.pinch ?? DEFAULTS.pointed.pinch,
    length: up + o.depth, taper: 0, pressYr: 10,
    ...(o.liningHex ? { liningHex: o.liningHex, liningFrac: 0.4 } : {}),
  }
}

/** The top roll's part round: how many stitches it works (0 = none). */
export function topRollStitches(o: PinchEarOptions): number {
  if (o.shape !== 'round' || !o.topRoll) return 0
  return Math.max(2, Math.min(o.width - 1, Math.round((o.topRoll.arc ?? 0.45) * o.width)))
}

/** THE PINCH'S GAP FROM THE PART ROUND, in stitches (ears-1107; replaces
 *  the fine cow's `TOP_ROLL_CLEAR` = 25° past a quarter round). The pinch
 *  goes on the middle of a stitch of the rim, with `ceil(count / 6)` whole
 *  unworked stitches between it and the near end of the part round: the
 *  pinch's V draws the rim in over about a sixth of the round either side,
 *  and a part round ending inside that drags its end stitch's hook sideways
 *  off its crown. Measured (ears-1107, DK and 2.31 mm alike, both sides):
 *  cups of 9 to 30 sts at arcs 0.30 to 0.60 all audit clean at this gap
 *  (160 / 160); with the pinch on the stitch boundary half a stitch nearer,
 *  159 / 160 (18 sts at arc 0.30 slips its last stitch); a stitch nearer,
 *  most widths fail. A fixed count of stitches or a fixed angle does not
 *  hold: the clean gap grows with the cup's count (3 sts at 12, 4 at 21,
 *  5 at 30), a constant share of the round. */
export function topRollGapSts(count: number): number {
  return Math.ceil(count / 6)
}

/** The pinch's distance from the near end of the part round, in stitches
 *  (to the middle of the pinch stitch): the gap's whole stitches plus half
 *  the pinch stitch, or the caller's `topRoll.gapSts`. */
function topRollPinchSts(o: PinchEarOptions, count: number): number {
  return o.topRoll?.gapSts ?? topRollGapSts(count) + 0.5
}

/** The pinch's angle from the middle of the part round (radians): half the
 *  part round plus the gap, in stitches of the rim round. */
export function topRollPinchAngle(o: PinchEarOptions): number {
  const n = topRollStitches(o)
  const count = pinchEarRounds(o).at(-1)!
  return (2 * Math.PI * (n / 2 + topRollPinchSts(o, count))) / count
}

/**
 * A cup with the top roll: built exactly as buildPart builds a tube part
 * (buildTube, then the press / pinch relax), except that the built cup is
 * first turned about its axis so the pinch (the relax's plates sit at -y)
 * falls a quarter round from the middle of the part round. A rigid turn of
 * the unrelaxed piece: the stitches are the ones built.
 */
function buildRolledCup(o: PinchEarOptions, part: AmigurumiPart, yr: number): { built: BuiltContinuous; panelMask?: boolean[] } {
  const n = topRollStitches(o)
  const count = part.rounds[part.rounds.length - 1]!
  const built = buildTube({
    stitch: part.stitch, rounds: part.rounds, anchor: 'ring', join: 'spiral', cap: 'dome', gaugeYr: part.gaugeYr,
    brim: { kind: 'fold', rounds: part.rimFold! }, partialLast: n,
  }, yr)
  // The round starts at the ring's tail (tube.ts: phase = 17/18 of a turn)
  // and runs anticlockwise: the part round's middle is at that + n/2 sts.
  const mid = (17 / 18) * 2 * Math.PI + ((n / 2) / count) * 2 * Math.PI
  const side = o.topRoll?.side ?? 1
  // The pinch a little over a quarter round from the part round's middle, so
  // its ends stay clear of the pinch's plates (at a quarter round the end
  // stitches' hooks were squeezed sideways off their crowns, measured).
  const want = -Math.PI / 2 + side * topRollPinchAngle(o)
  const a = want - mid
  const c = Math.cos(a), sn = Math.sin(a)
  for (const nd of built.model.nodes) {
    const x = nd.x * c - nd.y * sn, y = nd.x * sn + nd.y * c
    nd.x = x; nd.y = y
  }
  relaxPressed(built, part.press ?? 0, yr, part.pressShape, 560, part.pinch)
  return { built }
}

/** earPart's piece, with the top roll's part round. */
function cupPart(o: PinchEarOptions, base: { name: string; colourHex: string; place: PartPlacement }, yr: number): AmigurumiPart {
  const p = earPart(pinchEarPiece(o), base, yr)
  const n = topRollStitches(o)
  return n ? { ...p, rimPartial: n } : p
}

export function pinchEarRounds(o: PinchEarOptions): number[] {
  return earRounds(pinchEarPiece(o))
}

/** The ear's words: earPiece's rounds and shaping, then the pinch and the
 *  sewing by it. */
export function pinchEarWords(o: PinchEarOptions): string[] {
  const piece = pinchEarPiece(o)
  const base = earWords(piece)
  // earPiece's last line says how a free ear is sewn; this one is sewn by
  // its pinch.
  let body = base.slice(0, -1)
  const part = topRollStitches(o)
  if (part) {
    // The last round is the part round over the top; the fold takes it with
    // the round below.
    let k = -1
    body.forEach((l, i) => { if (/^Round \d+:/.test(l)) k = i })
    const num = /^Round (\d+):/.exec(body[k]!)![1]
    body = body.map((l, i) =>
      i === k
        ? `Round ${num} (part round, over the top of the ear): dc in next ${part} sts only, leaving the rest of the round unworked; sl st in next st. (${part} sts)`
        : /^Fold the last /.test(l)
          ? 'Fold the last 2 rounds back over the outside of the ear, so the rim rolls outward into a thick lip: two rounds deep over the top where the part round is, one round deep at the base.'
          : l)
  }
  const meet = (piece.pinch ?? 0) >= 0.7
  if (o.shape === 'round') {
    // Where the pinch goes with the top roll: the stitch a little over a
    // quarter round from the part round's middle (buildRolledCup's turn).
    // Where the pinch goes with the top roll (buildRolledCup's turn): the
    // gap's unworked stitches clear of the part round, then the pinch stitch.
    const count = pinchEarRounds(o).at(-1)!
    const d = topRollPinchSts(o, count)
    const k = Math.round(d + 0.5)
    const where = part
      ? (o.topRoll?.side ?? 1) > 0
        ? ` Make the pinch at the ${ordinal(k)} stitch of the last whole round back from the first stitch of the part round (counting against the way you worked), so ${k - 1} sts lie between the pinch and the part round and the thick roll runs along the top edge of the ear out from the pinch.`
        : ` Make the pinch at the ${ordinal(k)} stitch of the last whole round on from the last stitch of the part round (counting the way you worked), so ${k - 1} sts lie between the part round and the pinch and the thick roll runs along the top edge of the ear out from the pinch.`
      : ''
    return [
      ...body,
      `Sew the base of the rim together where you pinch it: fold the cup so the two sides of the rim${meet ? ' meet' : ' come close'} at the bottom, and take 2 small stitches through both layers with the tail to hold the pinch.${where}`,
      'Sew the ear to the head by the pinch only, so the cup stands out from the head with its hollow facing forward and the rolled rim free all round.',
    ]
  }
  return [
    ...body,
    'Sew the base together where you pinch it: press the ear flat, fold the open base in at the middle so the edges turn forward, and take 2 small stitches through all the layers to hold the pinch.',
    'Sew the ear to the head by the pinched base only, the hollow facing forward and the point up.',
  ]
}

const ordinal = (n: number): string => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`

export interface PinchEarBuild {
  built: BuiltContinuous
  problems: string[]
  /** Measured in earPiece's own frame before the pose (earPiece.earMetrics). */
  metrics: EarMetrics
  /** The pinch (posed frame, mm): the point sewn to the head. */
  seat: { x: number; y: number; z: number }
  /** Posed extents (mm): how far it stands out (z) and how wide (y). */
  standOutMm: number
  widthMm: number
  /** A pointed ear's lining panel, per strand node. */
  panelMask?: boolean[]
}

/** earPiece's cup frame (hollow -z, ring +z, pinch -y) to the posed frame
 *  (pinch at min z, standing out +z, hollow +x): a rigid turn. */
const poseRound = (p: { x: number; y: number; z: number }): { x: number; y: number; z: number } => ({ x: -p.z, y: -p.x, z: p.y })

/** Build, relax, audit and pose one ear. */
export function buildPinchEar(o: PinchEarOptions, yr: number): PinchEarBuild {
  const piece = pinchEarPiece(o)
  const part = cupPart(o, { name: 'ear', colourHex: '#888888', place: { on: 'ground' } }, yr)
  const { built, panelMask } = topRollStitches(o) ? buildRolledCup(o, part, yr) : buildPart(part, yr)
  const problems = auditPart(built, part, yr)
  const metrics = earMetrics(piece, built)
  const nodes = built.model.nodes
  const body = nodes.slice(built.anchorPins ?? 0)
  let seat: { x: number; y: number; z: number }
  if (o.shape === 'round') {
    // The pinch: the rim's lowest-y stitches (the base, where the V plates
    // drew the two sides together).
    let y0 = Infinity, y1 = -Infinity
    for (const n of body) { y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y) }
    const band = body.filter((n) => n.y <= y0 + (y1 - y0) * 0.08)
    const m = band.reduce((a, n) => ({ x: a.x + n.x / band.length, y: a.y + n.y / band.length, z: a.z + n.z / band.length }), { x: 0, y: 0, z: 0 })
    for (const n of nodes) { const q = poseRound(n); n.x = q.x; n.y = q.y; n.z = q.z }
    seat = poseRound(m)
  } else {
    // A pointed ear is already posed: tip +z, lined face +x, base -z.
    let z0 = Infinity
    for (const n of body) z0 = Math.min(z0, n.z)
    const band = body.filter((n) => n.z <= z0 + 1.5 * yr)
    seat = band.reduce((a, n) => ({ x: a.x + n.x / band.length, y: a.y + n.y / band.length, z: a.z + n.z / band.length }), { x: 0, y: 0, z: 0 })
  }
  let zMax = -Infinity, ylo = Infinity, yhi = -Infinity
  for (const n of body) { zMax = Math.max(zMax, n.z); ylo = Math.min(ylo, n.y); yhi = Math.max(yhi, n.y) }
  return { built, problems, metrics, seat, standOutMm: zMax - seat.z, widthMm: yhi - ylo, ...(panelMask ? { panelMask } : {}) }
}

/**
 * One pinched ear as a composition part. Place it with `dir` on the head,
 * `aim` the way it stands out, `spin` the way its hollow faces, `poleIn`
 * false; the pinch is seated on the join (CustomPiece.seat).
 */
export function pinchEarPart(
  o: PinchEarOptions,
  base: { name: string; colourHex: string; place: PartPlacement; sewNote?: string },
): AmigurumiPart {
  const piece = pinchEarPiece(o)
  const lining = o.liningHex
  const rounds = earRounds(piece)
  return {
    name: base.name,
    stitch: 'sc',
    rounds,
    // The custom build carries its own colours: a round cup's lining is its
    // first rounds (earPart's colour changes), a pointed ear's a panel.
    colourHex: base.colourHex,
    words: pinchEarWords(o),
    ...(base.sewNote ? { sewNote: base.sewNote } : {}),
    ...(lining && o.shape === 'round' ? (() => {
      const p = earPart(piece, { name: base.name, colourHex: base.colourHex, place: base.place }, 1)
      return { colourHex: p.colourHex, ...(p.colourChanges ? { colourChanges: p.colourChanges } : {}) }
    })() : {}),
    ...(lining && o.shape === 'pointed' ? (() => {
      const p = earPart(piece, { name: base.name, colourHex: base.colourHex, place: base.place }, 1)
      return p.panel ? { panel: p.panel } : {}
    })() : {}),
    place: base.place,
    custom: {
      build: (yr: number) => {
        const b = buildPinchEar(o, yr)
        return { built: b.built, problems: b.problems, seat: b.seat, ...(b.panelMask ? { panelMask: b.panelMask } : {}) }
      },
    },
  }
}
