/**
 * Sewing Studio types. Mirrors the shape SewingPattern carries in the DB
 * but flattened and pre-serialised for the client. The load-pattern
 * loader does the conversion. Demo patterns build the same shape inline
 * so the Studio surfaces don't fork on data source.
 */

export interface SewingPieceVertex {
  x: number
  y: number
}

/**
 * A single pattern piece. Coordinates are in millimetres (canonical),
 * mirroring measurement-units rule (cm + mm canonical). The viewer scales
 * for display; the print + projector routes render at 1:1.
 *
 *   pathPoints: piece outline as a closed polyline (mm). For curves we
 *               sample to short segments; the viewer doesn't smooth.
 *   grainline: two end-points of the grainline arrow (mm).
 *   notchPoints: notch positions on the outline (mm).
 *   onFoldEdge: if present, two end-points marking the "place on fold"
 *               edge so the viewer can hatch it.
 */
export interface SewingPiece {
  name: string
  /** Cut count, e.g. 1 or 2. */
  cut: number
  /** "on-fold" if the piece is cut on a fold, else null. */
  fold: 'on-fold' | null
  /** "lengthwise" | "crosswise" | "bias". Display only. */
  grainDirection: 'lengthwise' | 'crosswise' | 'bias'
  pathPoints: SewingPieceVertex[]
  grainline: { from: SewingPieceVertex; to: SewingPieceVertex }
  notchPoints: SewingPieceVertex[]
  onFoldEdge: { from: SewingPieceVertex; to: SewingPieceVertex } | null
  /** Optional pattern symbol label drawn near the piece centroid. */
  label?: string | null
}

export interface SewingSize {
  name: string
  body: Record<string, number>
}

export interface SewingFabricRequirement {
  /** Fabric width in cm. */
  widthCm: number
  /** Length needed in cm without nap. */
  lengthCmNoNap: number
  /** Length needed in cm with nap. */
  lengthCmWithNap: number
}

export interface SewingNotion {
  name: string
  spec?: string | null
  quantity: number
  notes?: string | null
}

export interface SewingCuttingLayoutPiecePlacement {
  pieceIndex: number
  /** Position of the piece's top-left within the fabric, in cm. */
  x: number
  y: number
  /** Rotation in degrees clockwise. */
  rotation: number
  /** If true the piece is placed on the fabric fold. */
  onFold: boolean
}

export interface SewingCuttingLayout {
  widthCm: number
  withNap: boolean
  /** Total fabric length needed in cm. */
  totalLengthCm: number
  placements: SewingCuttingLayoutPiecePlacement[]
}

/**
 * TipTap-style document. Kept loose because the renderer walks the node
 * tree directly (no editor on the public path).
 */
export interface SewingTipTapDoc {
  type: 'doc'
  content?: SewingTipTapNode[]
}
export interface SewingTipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: SewingTipTapNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

export interface SewingPatternData {
  id: string
  slug: string
  name: string
  description: string | null
  designerName: string | null
  garmentCategory: string
  garmentType: string | null
  skillLevel: string
  /** True if seam allowance is already included in the piece outlines. */
  seamAllowanceIncluded: boolean
  seamAllowanceCm: number | null
  /** Sizes supported. */
  supportedSizes: SewingSize[]
  /** Default size name when nothing is selected. */
  defaultSize: string
  /** Pieces in millimetres. */
  pieces: SewingPiece[]
  /** Instructions body (TipTap JSON). */
  instructionsBody: SewingTipTapDoc | null
  /** Recommended notions. */
  recommendedNotions: SewingNotion[]
  /** Fabric requirements keyed by size + fabric width. */
  fabricRequirements: Record<string, SewingFabricRequirement[]>
  /** Cutting layouts keyed by size. */
  cuttingLayouts: Record<string, SewingCuttingLayout[]>
  /** Attribution credit shown in the print + projector footer. */
  attributionText: string | null
}

export interface MySewingProjectListItem {
  id: string
  patternId: string
  patternName: string
  patternSlug: string
  status: string
  selectedSize: string | null
  lastWorkedAt: string
  completedAt: string | null
  stepsCompleted: number
  stepsTotal: number
}

export interface SewingProjectProgressData {
  projectId: string
  selectedSize: string | null
  stepsProgress: Record<string, { completedAt: string; notes?: string | null }>
  fabricChoice: { widthCm?: number; lengthCm?: number; withNap?: boolean } | null
  notes: string | null
}

export type SewingViewMode = 'browse' | 'projector'
