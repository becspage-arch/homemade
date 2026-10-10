/**
 * The motif interface — what a later round (a wall hanging, a garland, a
 * wreath) assembles. A motif is a set of genuinely stitched, relaxed and
 * audited PIECES (most motifs are one piece; a berry is a ball plus its
 * chain stalk) and the WORDS that make exactly those pieces.
 *
 * Every motif registers itself (`registerMotif`, registry.ts) so an assembly
 * can ask for "a star" or "a rose" by id without importing the module.
 */

import type { BuiltContinuous } from '../yarnPath'
import type { YarnFibre, YarnWeight } from '../program'

export type MotifId =
  | 'star'
  | 'heart'
  | 'leaf'
  | 'butterfly'
  | 'daisy'
  | 'rolled-rose'
  | 'layered-rose'
  | 'berry'
  | 'leaf-vine'

export interface MotifOptions {
  /** Default 'fine' (fine cotton, 2.5 mm hook). */
  yarnWeight?: YarnWeight
  /** Default 'fine-cotton'. */
  yarnFibre?: YarnFibre
  /** Colour overrides by role (each motif names its roles, e.g. 'main', 'centre'). */
  colours?: Record<string, string>
}

export interface V3 {
  x: number
  y: number
  z: number
}

/** One crocheted piece of a motif, relaxed and audited in its own frame. */
export interface MotifPiece {
  name: string
  built: BuiltContinuous
  /** The yarn colour of strand node i. */
  colourOf: (node: number) => string
  /** Where the piece sits in the motif (rigid, applied after relax and audit):
   *  local relaxed node position → motif position. Absent = identity. A STAGING
   *  bend (a strip rolled into a rose) is also expressed here, so the audit
   *  always runs on the piece as it was worked. */
  pose?: (p: V3, node: number) => V3
  /** Empty = genuinely stitched (the audit gate passed). */
  problems: string[]
}

export interface BuiltMotif {
  id: MotifId
  label: string
  /** Yarn radius (mm) the pieces were built at. */
  yr: number
  yarnWeight: YarnWeight
  yarnFibre: YarnFibre
  hookMm: number
  pieces: MotifPiece[]
  /** The written pattern, UK terms, every worked line ending in its count. */
  words: string[]
  /** The materials line(s) for the pattern. */
  materials: string[]
  /** Settled size across x and y (mm) of the posed motif. */
  sizeMm: { width: number; height: number }
  /** Every piece's problems, prefixed with the piece name. */
  problems: string[]
}

export interface MotifDef {
  id: MotifId
  label: string
  /** Audit round it belongs to (8 flat shaped motifs, 9 flowers). */
  round: 8 | 9
  /** The colour roles this motif takes, with their defaults. */
  colours: Record<string, string>
  build: (o?: MotifOptions) => BuiltMotif
}
