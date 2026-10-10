/**
 * BUTTERFLY (audit round 8; bar: the dusty-blue and peach butterflies on
 * bar-flower-wall-hanging.png; built-how ref real/8-butterflies.jpg).
 *
 * Rounds 1-2: 10 then 20 sc (UK dc) — a flat centre. Round 3: four wings, each
 * over five sts — a chain standing up to the first stitch's height, one stitch
 * into each of the next four sts, short at the edges and tall in the middle so
 * each wing is a rounded lobe (tr, dtr, dtr, tr UK for the big upper wings;
 * htr, tr, tr, htr for the small lower ones), a chain back down and a sl st
 * into the fifth st, which makes the notch between wings. A short chain body is sewn down the middle and its tail knotted for an
 * antenna.
 *
 * (Tried first: all four wings straight into the ring — 26 stitches and chains
 * into a ring 2.4yr across crowded the chains standing beside the tall legs out
 * of their own folds; then 12 and 16-st first rounds with two tall sts fanned
 * into one st — the second post was crowded out of its own yarn-over collars.
 * Two flat rounds and one tall st per st are clean.)
 */

import type { StitchId } from '../dictionary'
import { rowPitchYr } from '../dictionary'
import { MotifStrand, crownRound, intoRingRound, polar, polarV, nearAngle, type Crown, type Ring } from './kit'
import { runWords } from './leaf'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece } from './types'

export const BUTTERFLY_COLOURS = { wing: '#9fb4c9', body: '#7a6250' } // dusty blue, cocoa

/** Rounds 1-2: half this many sc (UK dc) into the ring, then 2 in each. */
export const BUTTERFLY_R1 = 20
/** Tall sts into each of the wing's sts of round 2 (then a sl st in the next).
 *  [1, 2, 1] over 16 sts crowded the increase's second post out of its own
 *  yarn-over collars; one each over 20 sts is clean. */
export const WING_OPS = [1, 1, 1, 1]
const PER_WING = WING_OPS.length + 1
const FANW = 0.35

interface Wing {
  name: string
  /** The wing's stitches, one into each st, edge to edge: lower at the edges,
   *  tall in the middle, so each wing is a rounded lobe. */
  sts: StitchId[]
  /** The chain standing up to the first stitch's height (and back down). */
  ch: number
}

/** Round 3: four wings, each over five sts of round 2 — chain up, a stitch in
 *  each of the next four sts, chain down, sl st in the fifth. */
export const WINGS: Wing[] = [
  { name: 'upper right', sts: ['dc', 'tr', 'tr', 'dc'], ch: 2 },
  { name: 'upper left', sts: ['dc', 'tr', 'tr', 'dc'], ch: 2 },
  { name: 'lower left', sts: ['hdc', 'dc', 'dc', 'hdc'], ch: 1 },
  { name: 'lower right', sts: ['hdc', 'dc', 'dc', 'hdc'], ch: 1 },
]

export function buildButterfly(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(BUTTERFLY_COLOURS, o)
  const yr = y.yr
  const m = new MotifStrand(yr, col.wing!)
  const c = { x: 0, y: 0 }
  const ring: Ring = m.magicRing(c)
  m.sectionName = 'centre'
  const r0 = intoRingRound(m, ring, new Array(BUTTERFLY_R1 / 2).fill('sc'))
  const g = crownRound(m, c, r0, r0.map(() => 'inc'), 'sc', ring.r + yr * rowPitchYr('sc'))
  const r1 = g.crowns
  const rPrev = g.r
  const thOf = (cr: Crown): number => Math.atan2(cr.p.y - c.y, cr.p.x - c.x)
  const step = (Math.PI * 2) / BUTTERFLY_R1
  // Unwrapped angles of the round-1 crowns, in work order.
  const th: number[] = []
  for (let i = 0; i < r1.length; i++) th.push(i ? nearAngle(thOf(r1[i]!), th[i - 1]! + step) : thOf(r1[0]!))
  m.sectionName = 'wings'
  for (let k = 0; k < WINGS.length; k++) {
    const w = WINGS[k]!
    const rK0 = rPrev + yr * rowPitchYr(w.sts[0]!)
    const base = PER_WING * k
    const aj = th[base + WING_OPS.length]!
    // the chain standing up to the wing's height, at the wing's leading edge
    m.chain(w.ch, [m.cursor, polarV(c, rK0, th[base]! - step * 0.55)], { turning: 1 })
    // the tall sts, fanned across the wing (2 into the middle st)
    const nT = WING_OPS.reduce((a, b) => a + b, 0)
    const lo = th[base]! - step * FANW, hi = th[base + WING_OPS.length - 1]! + step * FANW
    let t = 0
    for (let q = 0; q < WING_OPS.length; q++) {
      const b = r1[base + q]!
      const thB = th[base + q]!
      for (let s = 0; s < WING_OPS[q]!; s++, t++) {
        const two = WING_OPS[q]! === 2
        const a = lo + ((t + 0.5) / nT) * (hi - lo)
        const id = w.sts[t]!
        const rK = rPrev + yr * rowPitchYr(id)
        const f = polar(c, rK)
        m.stitch({ id, frame: f, xCrown: a * rK, xHook: thB * rK, into: { kind: 'crown', crown: b }, by: rPrev, ty: rK, spread: two ? (s ? -0.6 : 0.6) : 0, hookDepthScale: two && s ? 1.5 : 1 })
      }
    }
    // the chain back down, and a sl st into the next st
    m.chain(w.ch, [m.cursor, polarV(c, rPrev + yr, aj - step * 0.15)])
    const jb = r1[base + WING_OPS.length]!
    m.stitch({ id: 'slst', frame: polar(c, rPrev), xCrown: aj * rPrev, xHook: aj * rPrev, into: { kind: 'crown', crown: jb }, by: rPrev })
  }
  m.fastenOff({ x: -Math.cos(th[WING_OPS.length]!), y: -Math.sin(th[WING_OPS.length]!) })
  const built = m.finish(yr * 40, yr * 40)
  // Pose: the notch between the upper wings (the first wing's sl st) at the top.
  const rot = Math.PI / 2 - th[WING_OPS.length]!
  const cs = Math.cos(rot), sn = Math.sin(rot)
  const wings = pieceOf('wings', m, built, (p) => ({ x: p.x * cs - p.y * sn, y: p.x * sn + p.y * cs, z: p.z }))
  const body = buildBody(yr, col.body!)
  return assemble('butterfly', 'Butterfly', o, [wings, body], butterflyWords(), materialsLine(o, ['dusty blue', 'cocoa']))
}

export const BODY_CH = 9

/** The body: a chain laid down the middle and sewn on, its two tails knotted
 *  at the top for antennae. Relaxed on its own, then laid on the wings. */
function buildBody(yr: number, hex: string): MotifPiece {
  const m = new MotifStrand(yr, hex)
  const L = yr * 2.6 * BODY_CH
  // Made from the head end down: the slip knot at the top.
  m.slipKnot({ x: 0, y: 0 }, { x: 0, y: -1 })
  m.chain(BODY_CH, [{ x: 0, y: 0 }, { x: 0, y: -L }])
  // The working end is drawn through, carried up behind the body to the head
  // and out as the second antenna; the first is the slip knot's own tail.
  const from = m.nodes.length
  const pts: [number, number][] = []
  for (let t = 1; t <= 10; t++) pts.push([yr * 0.3 * Math.sin(t), -L + (L + yr * 2) * (t / 10)])
  for (const [x, yy] of pts) m.push({ x, y: yy }, -yr * 1.2)
  for (let t = 1; t <= 9; t++) {
    const a = 0.35 + t * 0.06
    m.push({ x: Math.sin(a) * yr * 1.6 * t * 0.9, y: yr * 2 + Math.cos(a) * yr * 1.6 * t }, yr * 0.2)
  }
  // knot at the tip: a small turn of yarn round itself
  const tip = m.cursor
  for (let t = 0; t < 6; t++) m.push({ x: tip.x + Math.cos(t * 1.2) * yr * 0.8, y: tip.y + Math.sin(t * 1.2) * yr * 0.8 }, yr * (0.6 + 0.2 * (t % 2)))
  m.markLoose(from)
  const built = m.finish(yr * 6, L)
  // Laid down the middle of the wings, a yarn's thickness proud of them.
  const piece = pieceOf('body', m, built, (p) => ({ x: p.x, y: p.y + L * 0.5, z: p.z + yr * 2.4 }))
  return piece
}

export function butterflyWords(): string[] {
  const up = WINGS[0]!, low = WINGS[2]!
  const sts = (w: Wing): string => runWords(w.sts, 'st')
  const wing = (w: Wing): string => `ch ${w.ch}, ${sts(w)}, ch ${w.ch}, sl st in next st`
  return [
    'With dusty blue, make a magic ring.',
    `Round 1: ${BUTTERFLY_R1 / 2} ${UK.sc} into the ring; pull the ring tight. (${BUTTERFLY_R1 / 2} sts)`,
    `Round 2: 2 ${UK.sc} in each st around. (${BUTTERFLY_R1} sts)`,
    `Round 3 (wings): [${wing(up)}] twice for the upper wings, then [${wing(low)}] twice for the lower wings. (4 wings)`,
    'Fasten off and weave in the ends.',
    `Body: with cocoa, leaving a 6 cm tail, ch ${BODY_CH}; fasten off leaving a 15 cm tail. Sew the chain down the middle of the butterfly, from the notch between the upper wings to the notch between the lower wings; bring both tails out at the top for the antennae and tie a small knot near the end of each.`,
  ]
}

registerMotif({ id: 'butterfly', label: 'Butterfly', round: 8, colours: BUTTERFLY_COLOURS, build: buildButterfly })
