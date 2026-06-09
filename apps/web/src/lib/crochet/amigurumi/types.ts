export type AmigurumiShape =
  | 'SPHERE'
  | 'CYLINDER'
  | 'CONE'
  | 'CAPSULE'
  | 'OVAL'
  | 'PEAR'

export interface AmigurumiGauge {
  /** Stitches over a 10 cm horizontal swatch of single crochet. */
  stitchesPer10cm: number
  /** Rows over a 10 cm vertical swatch. */
  rowsPer10cm: number
}

export interface AmigurumiRound {
  round: number
  /** Single-line plain-English instruction for this round. */
  instructions: string
  /** Stitch count at the end of the round. */
  stitchCount: number
}

export interface AmigurumiPiece {
  /** Optional label so multi-piece patterns can name pieces. */
  label?: string
  shape: AmigurumiShape
  finishedDimensionsCm: { width: number; height?: number; depth?: number }
  totalRounds: number
  rowByRow: AmigurumiRound[]
  yarnRequiredGrams: number
  stuffingNotes: string
}

export type JoinMethod =
  | 'LADDER_STITCH'
  | 'MATTRESS_STITCH'
  | 'WHIP_STITCH'
  | 'SLIP_STITCH'
  | 'PICK_UP_AND_CONTINUE'

export interface AssemblyJoint {
  /** Names of the two pieces being joined. */
  piecesJoined: [string, string]
  method: JoinMethod
  /** Plain-English placement description. */
  placement: string
}

export interface AssemblyInstructions {
  buildOrder: string[]
  joints: AssemblyJoint[]
  embellishments: string[]
  safetyEyePlacement?: string
}

export interface VerificationResult {
  ok: boolean
  issues: string[]
}
