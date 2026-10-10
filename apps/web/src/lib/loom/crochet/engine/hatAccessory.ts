/**
 * A HAT AS AN ACCESSORY on an amigurumi — the sleepy bunny's nightcap.
 *
 * The hat is a real tube program (engine/tube.ts): worked tip-first from a
 * magic ring as a CONE (+2 sts a round), a few straight rounds for the band,
 * then a RIDGE brim (sc in the front loop only) folded up, and a yarn pompom
 * sewn to the tip (engine/pompom.ts). It is built, relaxed and audited exactly
 * like a standalone hat, then WORN: bent over above the head's crown the way
 * an unstuffed cone flops (tubeStaging.bendTube, staging only), seated on the
 * head part of an already-compiled composition, and its strokes appended to
 * that composition's scene. Nothing in composition.ts changes: the toy is the
 * toy, the hat is a second genuinely-stitched piece placed on it.
 *
 * Sizing is from the head: the band's round count is the head's circumference
 * at the brim line in the hat's own gauge, so the pattern's stitch count is
 * what fits the toy it is written for.
 */

import { STITCHES } from './dictionary'
import { YARN_WEIGHT_RADIUS_MM, writeInstructions, type CrochetProgram, type YarnWeight } from './program'
import { compileRelaxAudit } from './programScene'
import type { CompiledComposition } from './composition'
import { bendTube, rigidPlace, type TubeBend } from './tubeStaging'
import { pompomInstruction, pompomStrokes, type YarnStrokeOut } from './pompom'
import { pliedFilaments, smooth, type V3 } from '../yarnLoop'

export interface NightcapOptions {
  /** The head it is made to fit: its radius (mm) at the widest. */
  headRadiusMm: number
  /** The hat's yarn (default 'fine' — a toy's hat is worked in a finer yarn
   *  than a chunky toy, or the same yarn when the toy is fine). */
  yarnWeight?: YarnWeight
  colourHex: string
  /** Straight band rounds between the cone and the brim (default 3). */
  bandRounds?: number
  /** Folded ridge-brim rounds (default 4). */
  brimRounds?: number
  /** Extra slow rounds at the tip (each count held twice; default 4) so the
   *  tail is slender and long like a real nightcap's. */
  slowTipRounds?: number
  /** Pompom radius (mm; default 0.42 × head radius). 0 = none. */
  pompomRadiusMm?: number
  name?: string
}

/** The hat's yarn radius. */
export function nightcapYarnRadiusMm(o: NightcapOptions): number {
  return YARN_WEIGHT_RADIUS_MM[o.yarnWeight ?? 'fine']
}

/** The band's stitch count for a head: its circumference at the brim line
 *  (a little below the widest) plus the fabric, in the hat's own sc gauge,
 *  rounded to an even count so the +2 increases land cleanly. */
export function nightcapBandCount(headRadiusMm: number, yr: number): number {
  const sw = yr * STITCHES.sc.gaugeYr
  const r = headRadiusMm * 0.97 + yr * 1.6
  const n = Math.round((2 * Math.PI * r) / sw)
  return Math.max(12, n % 2 === 0 ? n : n + 1)
}

/** The rounds of the nightcap, tip first. */
export function nightcapRounds(o: NightcapOptions): number[] {
  const yr = nightcapYarnRadiusMm(o)
  const N = nightcapBandCount(o.headRadiusMm, yr)
  const slow = o.slowTipRounds ?? 4
  const band = o.bandRounds ?? 3
  const brim = o.brimRounds ?? 4
  const rounds: number[] = []
  let c = 6
  for (let i = 0; i < slow; i++) {
    rounds.push(c, c)
    c += 2
  }
  while (c < N) {
    rounds.push(c)
    c += 2
  }
  for (let i = 0; i < band; i++) rounds.push(N)
  for (let i = 0; i < brim; i++) rounds.push(N)
  return rounds
}

/** The nightcap as a tube program (a complete written pattern on its own). */
export function nightcapProgram(o: NightcapOptions): CrochetProgram {
  const brim = o.brimRounds ?? 4
  return {
    name: o.name ?? 'nightcap',
    form: 'tube',
    stitch: 'sc',
    rounds: nightcapRounds(o),
    tube: { anchor: 'ring', join: 'spiral', cap: 'cone', brim: { kind: 'ridge', rounds: brim, fold: true } },
    yarnWeight: o.yarnWeight ?? 'fine',
    colourHex: o.colourHex,
    staging: 'standing',
    notes: 'A nightcap worked tip-first as a cone, with a folded ridge brim and a pompom.',
  }
}

/** The full written pattern for the nightcap, including the pompom. */
export function nightcapInstructions(o: NightcapOptions): string[] {
  const lines = writeInstructions(nightcapProgram(o))
  const pr = o.pompomRadiusMm ?? o.headRadiusMm * 0.42
  if (pr > 0) lines.push(pompomInstruction(pr, 'the tip of the hat'))
  return lines
}

export interface WearOptions {
  /** How far up the head (fraction of its radius above centre) the brim band's
   *  middle sits (default 0.38: just above the eye line). */
  brimHeightFrac?: number
  /** Tilt the hat back off the face (deg, default 10). */
  tiltBackDeg?: number
  /** The bend of the tail: where it starts above the brim centre (fraction of
   *  the head radius, default 0.72: just past the crown), the ramp length (mm,
   *  default 1.3 × head radius), the final angle (deg, default 118) and the
   *  azimuth it falls toward (deg from +x, default 20: to the figure's side
   *  and a touch toward the camera). */
  bend?: Partial<Pick<TubeBend, 'lengthMm' | 'angleDeg' | 'dirDeg' | 'swayDeg'>> & { startFrac?: number }
  /** Plying twist for the strokes (the scene default 0.08). */
  twist?: number
  /** Pompom seed. */
  seed?: number
}

export interface WornHat {
  program: CrochetProgram
  yr: number
  /** Audit problems of the hat itself (empty = genuinely stitched). */
  problems: string[]
  /** The hat's yarn strokes in the composition's world, ready to append. */
  strokes: YarnStrokeOut[]
  /** The pompom's strokes (separate so a caller may leave it off). */
  pompom: YarnStrokeOut[]
  /** World position of the hat's tip after the bend (the pompom's seat). */
  tip: V3
  instructions: string[]
}

/**
 * Build the nightcap, bend it as worn, seat it on the named head part of a
 * compiled composition and return its strokes in that world.
 */
export function wearNightcap(compiled: CompiledComposition, headName: string, o: NightcapOptions, w: WearOptions = {}): WornHat {
  const head = compiled.placed.find((pp) => pp.part.name === headName)
  if (!head) throw new Error(`wearNightcap: no part named '${headName}'`)
  const hb = head.bounds
  const headC: V3 = { x: (hb.minx + hb.maxx) / 2, y: (hb.miny + hb.maxy) / 2, z: (hb.minz + hb.maxz) / 2 }
  const headR = Math.max(hb.maxx - hb.minx, hb.maxy - hb.miny) / 2
  const opts: NightcapOptions = { ...o, headRadiusMm: o.headRadiusMm || headR }
  const program = nightcapProgram(opts)
  const { built, yr, problems } = compileRelaxAudit(program)
  const nodes = built.model.nodes
  let ctrl: V3[] = built.strandPath.map((ni) => ({ x: nodes[ni]!.x, y: nodes[ni]!.y, z: nodes[ni]!.z }))

  // The hat's local frame: axis z, the tip (magic ring) at the top, the open
  // folded brim at the bottom. Find the brim band's height from its rounds.
  const rounds = program.rounds!
  const brimN = program.tube!.brim!.rounds
  const zOfRound = (k: number): number => {
    let s = 0, n = 0
    for (let i = 0; i < nodes.length; i++) if (built.nodeRow![i] === k) { s += nodes[i]!.z; n++ }
    return n ? s / n : 0
  }
  const brimMid = (zOfRound(rounds.length - brimN) + zOfRound(rounds.length - 1)) / 2
  const R = opts.headRadiusMm
  const brimFrac = w.brimHeightFrac ?? 0.38
  // Bend above the crown (local frame): the head holds the hat straight up to
  // its crown; the unstuffed cone beyond it flops.
  const startZ = brimMid + R * (w.bend?.startFrac ?? 0.72)
  ctrl = bendTube(ctrl, {
    startZ,
    lengthMm: w.bend?.lengthMm ?? R * 1.3,
    angleDeg: w.bend?.angleDeg ?? 118,
    dirDeg: w.bend?.dirDeg ?? 20,
    swayDeg: w.bend?.swayDeg ?? 0,
  })
  // Seat: the brim band's middle at the head's brim line, tilted back a touch
  // (the face is +y: tilting back drops the back of the hat toward −y).
  const tilt = -(w.tiltBackDeg ?? 10)
  const T: V3 = { x: headC.x, y: headC.y, z: headC.z + R * brimFrac }
  // Tilt about the brim's own centre so the band stays on the brim line.
  const local = ctrl.map((p) => ({ x: p.x, y: p.y, z: p.z - brimMid }))
  const world = rigidPlace(local, { tiltDeg: tilt, T })
  // The tip after everything: the mean of the magic-ring nodes (the first
  // anchorPins of the strand are the ring).
  const ringPts = world.slice(0, Math.max(1, Math.min(built.anchorPins, world.length)))
  const tip: V3 = {
    x: ringPts.reduce((a, p) => a + p.x, 0) / ringPts.length,
    y: ringPts.reduce((a, p) => a + p.y, 0) / ringPts.length,
    z: ringPts.reduce((a, p) => a + p.z, 0) / ringPts.length,
  }
  // The tail's direction at the tip, from the second round to the ring.
  const r2: V3 = { x: 0, y: 0, z: 0 }
  let n2 = 0
  for (let i = 0; i < world.length; i++) {
    if (built.nodeRow![built.strandPath[i]!] === 1) { r2.x += world[i]!.x; r2.y += world[i]!.y; r2.z += world[i]!.z; n2++ }
  }
  const dir: V3 = n2 ? { x: tip.x - r2.x / n2, y: tip.y - r2.y / n2, z: tip.z - r2.z / n2 } : { x: 0, y: 0, z: 1 }
  const dl = Math.hypot(dir.x, dir.y, dir.z) || 1
  const twist = w.twist ?? 0.08
  const center = smooth(world, 4)
  const { radiusMm, filaments } = pliedFilaments(center, yr * 0.85, 3, twist)
  const strokes: YarnStrokeOut[] = [{ hex: opts.colourHex, sheen: 0.85, radiusMm, filaments }]
  const pr = opts.pompomRadiusMm ?? R * 0.42
  const pompom =
    pr > 0
      ? pompomStrokes({
          centre: { x: tip.x + (dir.x / dl) * pr * 0.78, y: tip.y + (dir.y / dl) * pr * 0.78, z: tip.z + (dir.z / dl) * pr * 0.78 },
          radiusMm: pr,
          yarnRadiusMm: yr,
          colourHex: opts.colourHex,
          seed: w.seed,
        })
      : []
  return { program, yr, problems, strokes, pompom, tip, instructions: nightcapInstructions(opts) }
}
