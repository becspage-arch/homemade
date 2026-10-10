/**
 * Shared finishing for motif modules: relax + audit a piece, measure it, and
 * the UK stitch words.
 */

import { YARN_WEIGHT_RADIUS_MM, type YarnFibre, type YarnWeight } from '../program'
import type { StitchId } from '../dictionary'
import type { BuiltContinuous } from '../yarnPath'
import { auditMotif, relaxMotif, type MotifStrand } from './kit'
import type { BuiltMotif, MotifId, MotifOptions, MotifPiece, V3 } from './types'

/** Internal (US) stitch id → the UK word a pattern prints. */
export const UK: Record<StitchId, string> = {
  ch: 'ch', slst: 'sl st', sc: 'dc', hdc: 'htr', dc: 'tr', tr: 'dtr', dtr: 'trtr',
  scblo: 'dc blo', scflo: 'dc flo', fpdc: 'FPtr', bpdc: 'BPtr', bobble: 'bobble', picot: 'picot',
  loopst: 'loop st', loopcurl: 'loop st', k: 'k',
}

export const HOOK_BY_WEIGHT: Partial<Record<YarnWeight, number>> = {
  lace: 1.75, fine: 2.5, sport: 3.0, dk: 3.5, worsted: 4.5, aran: 5.0, bulky: 6.0,
}

export function motifYarn(o?: MotifOptions): { weight: YarnWeight; fibre: YarnFibre; yr: number; hookMm: number } {
  const weight = o?.yarnWeight ?? 'fine'
  return { weight, fibre: o?.yarnFibre ?? 'fine-cotton', yr: YARN_WEIGHT_RADIUS_MM[weight], hookMm: HOOK_BY_WEIGHT[weight] ?? 2.5 }
}

export function colourOpts(defaults: Record<string, string>, o?: MotifOptions): Record<string, string> {
  return { ...defaults, ...(o?.colours ?? {}) }
}

/** Relax + audit one strand into a piece. */
export function pieceOf(name: string, m: MotifStrand, built: BuiltContinuous, pose?: MotifPiece['pose'], iterations?: number): MotifPiece {
  if (!process.env.MOTIF_NORELAX) relaxMotif(built, iterations ?? (Number(process.env.MOTIF_ITERS) || undefined))
  const problems = auditMotif(built, name)
  const colours = m.nodeColour.slice()
  return { name, built, colourOf: (i) => colours[i] ?? m.colour, pose, problems }
}

export function posedPoints(p: MotifPiece): V3[] {
  return p.built.strandPath.map((ni) => {
    const n = p.built.model.nodes[ni]!
    const q = { x: n.x, y: n.y, z: n.z }
    return p.pose ? p.pose(q, ni) : q
  })
}

export function assemble(
  id: MotifId, label: string, o: MotifOptions | undefined, pieces: MotifPiece[], words: string[], materials: string[],
): BuiltMotif {
  const y = motifYarn(o)
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
  for (const p of pieces) for (const q of posedPoints(p)) {
    minx = Math.min(minx, q.x); maxx = Math.max(maxx, q.x)
    miny = Math.min(miny, q.y); maxy = Math.max(maxy, q.y)
  }
  const problems = pieces.flatMap((p) => p.problems.map((s) => `${p.name}: ${s}`))
  return {
    id, label, yr: y.yr, yarnWeight: y.weight, yarnFibre: y.fibre, hookMm: y.hookMm,
    pieces, words, materials, sizeMm: { width: maxx - minx, height: maxy - miny }, problems,
  }
}

/** The common materials line. */
export function materialsLine(o: MotifOptions | undefined, colours: string[]): string[] {
  const y = motifYarn(o)
  const yarn = y.fibre === 'fine-cotton' ? '4 ply (fingering) cotton' : `${y.weight} ${y.fibre} yarn`
  return [
    `Yarn: ${yarn} in ${colours.join(', ')}.`,
    `Hook: ${y.hookMm} mm. A tapestry needle.`,
  ]
}
