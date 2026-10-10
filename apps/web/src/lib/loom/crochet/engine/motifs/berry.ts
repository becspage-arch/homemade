/**
 * BERRY (audit round 9; bar: the terracotta berries hanging on green chains
 * of bar-flower-wall-hanging.png).
 *
 * A tiny stuffed ball worked in the round in dc (UK) — the engine's audited
 * amigurumi sphere at fine cotton gauge, 6 / 12 / 12 / 12 / 12 / 6 (settles 16 x 16 x 16 mm, round), drawn closed —
 * and a chain stalk in green sewn to its top (on a wall hanging the stalk is
 * the vine's own chain).
 */

import { compileRelaxAudit } from '../programScene'
import { writeInstructions, type CrochetProgram } from '../program'
import { MotifStrand } from './kit'
import { assemble, colourOpts, materialsLine, motifYarn, pieceOf } from './common'
import { registerMotif } from './registry'
import type { BuiltMotif, MotifOptions, MotifPiece } from './types'

export const BERRY_COLOURS = { berry: '#c8735a', stalk: '#8d9c7c' } // terracotta, sage
export const BERRY_ROUNDS = [6, 12, 12, 12, 12, 6]
export const STALK_CH = 8

export function berryProgram(o?: MotifOptions): CrochetProgram {
  const y = motifYarn(o)
  return { name: 'berry', form: 'sphere', stitch: 'sc', rounds: BERRY_ROUNDS, yarnWeight: y.weight, yarnFibre: y.fibre }
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
  let yMin = Infinity
  for (const n of N) yMin = Math.min(yMin, n.y - cy)
  const ball: MotifPiece = {
    name: 'berry', built: c.built, colourOf: () => col.berry!, problems: c.problems,
    pose: (p) => ({ x: p.x - cx, y: p.z - zMax, z: p.y - cy - yMin }),
  }
  // The stalk: a slip knot and a chain, laid from the berry's top outward.
  const m = new MotifStrand(yr, col.stalk!)
  m.slipKnot({ x: 0, y: 0 }, { x: 0, y: 1 })
  m.chain(STALK_CH, [{ x: 0, y: 0 }, { x: 0, y: yr * 2.6 * STALK_CH }])
  m.fastenOff({ x: 0, y: 1 })
  const sb = m.finish(yr * 4, yr * 2.6 * STALK_CH)
  const stalk = pieceOf('stalk', m, sb, (p) => ({ x: p.x, y: p.y - yr * 1.5, z: p.z + yr * 1.2 }))
  return assemble('berry', 'Berry', o, [ball, stalk], berryWords(o), materialsLine(o, ['terracotta', 'sage']).concat(['A pinch of toy stuffing.']))
}

export function berryWords(o?: MotifOptions): string[] {
  return [
    'With terracotta:',
    ...writeInstructions(berryProgram(o)).map((s) => s.replace('Stuff firmly', 'Stuff lightly')),
    `Stalk: with sage, ch ${STALK_CH}; fasten off. Sew one end to the top of the berry.`,
  ]
}

registerMotif({ id: 'berry', label: 'Berry', round: 9, colours: BERRY_COLOURS, build: buildBerry })
