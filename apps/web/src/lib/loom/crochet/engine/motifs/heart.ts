/**
 * HEART (audit round 8; built-how ref real/8-hearts.jpg, the one-minute heart).
 *
 * Every stitch is worked into ONE magic ring and the ring is drawn tight; the
 * outline comes from the stitch HEIGHTS going round: a ch 3 and three tr (UK)
 * for the left lobe, three dc down the side, ch 1, a tr for the point, ch 1,
 * three dc up the other side, three tr for the right lobe, then ch 3 and a sl st
 * into the ring make the dip between the lobes. Tall where the lobes are, short
 * at the sides, tall at the point: the heart emerges, nothing draws it.
 */

import type { StitchId } from '../dictionary'
import { rowPitchYr } from '../dictionary'
import { MotifStrand, polar, polarV, nearAngle, RING_PHASE, type ChainLoop, type Crown, type Ring } from './kit'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions } from './types'

export const HEART_COLOURS: Record<string, string> = { main: '#d98f98' } // dusty rose

type Slot = { kind: 'st'; id: StitchId; deg: number } | { kind: 'ch'; n: number; deg: number; toDeg?: number }

/** Round the ring, anticlockwise from just left of the dip (degrees, 90 = the
 *  dip at the top). Mirror-symmetric about the vertical. */
export const HEART_SLOTS: Slot[] = [
  { kind: 'ch', n: 3, deg: 104 },
  { kind: 'st', id: 'dc', deg: 124 },
  { kind: 'st', id: 'dc', deg: 143 },
  { kind: 'st', id: 'dc', deg: 162 },
  { kind: 'st', id: 'sc', deg: 186 },
  { kind: 'st', id: 'sc', deg: 207 },
  { kind: 'st', id: 'sc', deg: 228 },
  { kind: 'ch', n: 1, deg: 250 },
  { kind: 'st', id: 'dc', deg: 270 },
  { kind: 'ch', n: 1, deg: 290 },
  { kind: 'st', id: 'sc', deg: 312 },
  { kind: 'st', id: 'sc', deg: 333 },
  { kind: 'st', id: 'sc', deg: 354 },
  { kind: 'st', id: 'dc', deg: 378 },
  { kind: 'st', id: 'dc', deg: 397 },
  { kind: 'st', id: 'dc', deg: 416 },
  { kind: 'ch', n: 3, deg: 436, toDeg: 450 },
  { kind: 'st', id: 'slst', deg: 450 },
]

export function buildHeart(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(HEART_COLOURS, o)
  const yr = y.yr
  const m = new MotifStrand(yr, col.main!)
  const c = { x: 0, y: 0 }
  const ring: Ring = m.magicRing(c, Number(process.env.HRING ?? 2.4))
  // Built turned so the first chain leaves where the ring's working end is.
  const off = RING_PHASE - (HEART_SLOTS[0]!.deg * Math.PI) / 180
  const A = (deg: number): number => (deg * Math.PI) / 180 + off
  // What round 2 works into, in order: a stitch's crown, or a chain's loops.
  const made: ({ kind: 'st'; crown: Crown; slot: Slot } | { kind: 'ch'; loops: ChainLoop[]; slot: Slot })[] = []
  for (const s of HEART_SLOTS) {
    if (s.kind === 'ch') {
      const rTop = ring.r + yr * rowPitchYr('dc') * (s.n >= 3 ? 1 : 0.7)
      let loops: ChainLoop[]
      if (s.toDeg === undefined) {
        // a chain standing up from the ring (it counts as a stitch / spaces the point)
        loops = m.chain(s.n, [m.cursor, polarV(c, rTop, A(s.deg))], { turning: s.n >= 3 ? 1 : 0 })
      } else {
        // the closing chain arches from the last lobe stitch over to the dip
        const mid = polarV(c, rTop * 0.82, A((s.deg + s.toDeg) / 2))
        loops = m.chain(s.n, [m.cursor, mid, polarV(c, ring.r + yr * 1.6, A(s.toDeg))], { turning: 1 })
      }
      made.push({ kind: 'ch', loops, slot: s })
      continue
    }
    const th = A(s.deg)
    const rK = ring.r + yr * rowPitchYr(s.id)
    const f = polar(c, rK)
    const node = ring.nodes[Math.round(((((th / (Math.PI * 2)) % 1) + 1) % 1) * ring.nodes.length) % ring.nodes.length]!
    const nb = m.nodes[node]!
    const thH = nearAngle(Math.atan2(nb.y, nb.x), th)
    made.push({ kind: 'st', crown: m.stitch({ id: s.id, frame: f, xCrown: th * rK, xHook: thH * rK, into: { kind: 'ring', ring, th }, by: ring.r, ty: rK }), slot: s })
  }
  if (HEART_EDGE) {
    m.setColour(col.edge ?? col.main!)
    m.sectionName = 'edging'
    edgeRound(m, c, made)
  }
  m.fastenOff({ x: Math.cos(A(90)), y: Math.sin(A(90)) })
  const built = m.finish(yr * 20, yr * 20)
  // Pose: turn it back upright (the dip at the top).
  const rot = -off
  const cs = Math.cos(rot), sn = Math.sin(rot)
  const piece = pieceOf('heart', m, built, (p) => ({ x: p.x * cs - p.y * sn, y: p.x * sn + p.y * cs, z: p.z }))
  return assemble('heart', 'Heart', o, [piece], heartWords(), materialsLine(o, ['dusty rose']))
}

export const HEART_EDGE = true

/** Round 2: dc (UK) all round the outline into the round-1 stitches — two into
 *  each lobe stitch, two into the point — and a sl st into the dip. */
function edgeRound(m: MotifStrand, c: { x: number; y: number }, made: ({ kind: 'st'; crown: Crown; slot: Slot } | { kind: 'ch'; loops: ChainLoop[]; slot: Slot })[]): void {
  const yr = m.yr
  const pitch = yr * rowPitchYr('sc')
  const into = (node: number | Crown, n: number, spreadDeg = 7): void => {
    const p = typeof node === 'number' ? m.nodes[node]! : node.p
    const rB = Math.hypot(p.x - c.x, p.y - c.y)
    const th = Math.atan2(p.y - c.y, p.x - c.x)
    const rK = rB + pitch
    const f = polar(c, rK)
    for (let t = 0; t < n; t++) {
      const off = n === 1 ? 0 : ((t - (n - 1) / 2) * spreadDeg * Math.PI) / 180
      m.stitch({
        id: 'sc', frame: f, xCrown: (th + off) * rK, xHook: th * rK, by: rB, ty: rK,
        into: typeof node === 'number' ? { kind: 'node', node } : { kind: 'crown', crown: node },
        spread: n === 1 ? 0 : 0.6 * (t === 0 ? 1 : -1), hookDepthScale: n > 1 && t > 0 ? 1.5 : 1,
      })
    }
  }
  for (const e of made) {
    if (e.kind === 'ch') {
      const s = e.slot as { kind: 'ch'; n: number; toDeg?: number }
      // The chains are left: the ch 1 either side of the point is worked over,
      // and both ch 3s stay as the dip's edges. (Worked into, every variant —
      // its apex, either leg — dragged the ch 3's own crossing out of its fold:
      // audit 'crossing past its loop's fold' at j0 / j16, 1-3 failures.)
      void s
      continue
    }
    const id = (e.slot as { id: StitchId }).id
    if (id === 'slst') {
      const p = e.crown.p
      const rB = Math.hypot(p.x - c.x, p.y - c.y)
      const th = Math.atan2(p.y - c.y, p.x - c.x)
      m.stitch({ id: 'slst', frame: polar(c, rB), xCrown: th * rB, xHook: th * rB, into: { kind: 'crown', crown: e.crown }, by: rB })
    } else if ((e.slot as { deg: number }).deg === 270) into(e.crown, 2, 10) // the point
    else into(e.crown, id === 'dc' ? 2 : 1)
  }
}

export function heartWords(): string[] {
  const parts: string[] = []
  const slots = HEART_SLOTS
  for (let i = 0; i < slots.length; ) {
    const s = slots[i]!
    if (s.kind === 'ch') { parts.push(`ch ${s.n}`); i++; continue }
    let j = i
    while (j < slots.length && slots[j]!.kind === 'st' && (slots[j] as { id: StitchId }).id === s.id) j++
    const k = j - i
    parts.push(k === 1 ? `1 ${UK[s.id]}` : `${k} ${UK[s.id]}`)
    i = j
  }
  const sts = slots.filter((s) => s.kind === 'st' && s.id !== 'slst').length + 1
  return [
    'Make a magic ring.',
    `Into the ring: ${parts.slice(0, -1).join(', ')}, then sl st into the ring. (${sts} sts, counting the first ch 3 as a st)`,
    'Pull the tail to close the ring tight: the dip forms between the two chain 3s.',
    ...(HEART_EDGE ? [`Round 2 (edging): 2 ${UK.sc} in each of the next 3 tr, ${UK.sc} in each of the next 3 sts, 2 ${UK.sc} in the point tr, ${UK.sc} in each of the next 3 sts, 2 ${UK.sc} in each of the next 3 tr, sl st into the sl st at the dip. (20 sts)`] : []),
    'Fasten off and weave in the ends.',
  ]
}

registerMotif({ id: 'heart', label: 'Heart', round: 8, colours: HEART_COLOURS, build: buildHeart })
