/**
 * BERRY (audit round 9; bar: the terracotta berries hanging on green chains
 * of bar-flower-wall-hanging.png, each with a small green calyx).
 *
 * A tiny stuffed ball worked in the round in dc (UK) — the engine's audited
 * amigurumi sphere at fine cotton gauge, 6 / 12 / 12 / 12 / 12 / 6 (settles 16 x 16 x 16 mm, round), drawn closed —
 * a five-point calyx in sage (a ring of five dc, then a tiny ch-2 point on each)
 * sewn over its top, and a chain stalk in green sewn through the calyx (on a
 * wall hanging the stalk is the vine's own chain).
 */

import { compileRelaxAudit } from '../programScene'
import { writeInstructions, type CrochetProgram } from '../program'
import { MotifStrand } from './kit'
import { starPiece } from './star'
import { UK, assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece, V3 } from './types'

export const BERRY_COLOURS = { berry: '#b98588', stalk: '#46503a', calyx: '#4a553d' } // r10: #b5675b rendered bright orange with the tinted sheen; the bar's berries are dusty terracotta-pink // dusty terracotta, deep olive, deep grey-sage
export const BERRY_ROUNDS = [6, 12, 12, 12, 12, 6]
export const STALK_CH = 8
const CALYX_SEPALS = 5
/** The calyx lies over the berry's top, tilted down its side (deg from flat). */
const CALYX_TILT = 50

export function berryProgram(o?: MotifOptions): CrochetProgram {
  const y = motifYarn(o)
  return { name: 'berry', form: 'sphere', stitch: 'sc', rounds: BERRY_ROUNDS, yarnWeight: y.weight, yarnFibre: y.fibre }
}

/** The calyx: a magic ring, five dc, then [ch 2, sl st in 2nd ch from hook,
 *  sl st in next st] round — a tiny five-point star (star.ts's construction). */
export function calyxPiece(yr: number, hex: string, pose?: MotifPiece['pose']): MotifPiece {
  return starPiece(yr, hex, { rounds: [CALYX_SEPALS], point: ['slst'], skip: 0 }, 'calyx', pose)
}

export function buildBerry(o?: MotifOptions): BuiltMotif {
  const y = motifYarn(o)
  const col = colourOpts(BERRY_COLOURS, o)
  const yr = y.yr
  const c = compileRelaxAudit(berryProgram(o), yr)
  const N = c.built.model.nodes
  // Laid on its side on the table, its closed end (the last round) toward +y.
  let zMin = Infinity, zMax = -Infinity, cx = 0, cy = 0
  for (const n of N) { zMin = Math.min(zMin, n.z); zMax = Math.max(zMax, n.z); cx += n.x; cy += n.y }
  cx /= N.length; cy /= N.length
  let yMin = Infinity, yMax = -Infinity
  for (const n of N) { yMin = Math.min(yMin, n.y - cy); yMax = Math.max(yMax, n.y - cy) }
  const ball: MotifPiece = {
    name: 'berry', built: c.built, colourOf: () => col.berry!, problems: c.problems,
    pose: (p) => ({ x: p.x - cx, y: p.z - zMax, z: p.y - cy - yMin }),
  }
  const ballH = yMax - yMin // the berry's height off the table
  // The calyx over the berry's top (its start end, at y = 0), tilted down over
  // the side, its centre a little below the summit toward the stalk.
  const tilt = (CALYX_TILT * Math.PI) / 180
  const ct = Math.cos(tilt), st = Math.sin(tilt)
  const calyxAt: V3 = { x: 0, y: -yr * 2.2, z: ballH * 0.72 }
  const calyx = calyxPiece(yr, col.calyx!, (p) => ({
    x: calyxAt.x + p.x,
    y: calyxAt.y - p.y * ct + p.z * st,
    z: calyxAt.z + p.y * st + p.z * ct,
  }))
  // The stalk: a slip knot and a chain, laid from the calyx outward.
  const m = new MotifStrand(yr, col.stalk!)
  m.slipKnot({ x: 0, y: 0 }, { x: 0, y: 1 })
  m.chain(STALK_CH, [{ x: 0, y: 0 }, { x: 0, y: yr * 2.6 * STALK_CH }])
  m.fastenOff({ x: 0, y: 1 })
  const sb = m.finish(yr * 4, yr * 2.6 * STALK_CH)
  const stalk = pieceOf('stalk', m, sb, (p) => ({ x: p.x, y: p.y - yr * 1.0, z: p.z + yr * 1.2 }))
  return assemble('berry', 'Berry', o, [ball, calyx, stalk], berryWords(o), materialsLine(o, ['terracotta', 'sage', 'olive']).concat(['A pinch of toy stuffing.']))
}

export function berryWords(o?: MotifOptions): string[] {
  return [
    'With terracotta:',
    ...writeInstructions(berryProgram(o)).map((s) => s.replace('Stuff firmly', 'Stuff lightly')),
    'Calyx: with sage, make a magic ring.',
    `  Round 1: ${CALYX_SEPALS} ${UK.sc} into the ring. (${CALYX_SEPALS} sts)`,
    `  Round 2: [ch 2, sl st in 2nd ch from hook, sl st in next st] ${CALYX_SEPALS} times. (${CALYX_SEPALS} points)`,
    '  Fasten off, pull the ring tight and sew the calyx over the top of the berry.',
    `Stalk: with olive, ch ${STALK_CH}; fasten off. Sew one end through the middle of the calyx to the top of the berry.`,
  ]
}

registerMotif({ id: 'berry', label: 'Berry', round: 9, colours: BERRY_COLOURS, build: buildBerry })
