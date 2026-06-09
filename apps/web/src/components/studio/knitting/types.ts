/**
 * Shared types for /studio/knitting — passed between the server entry
 * page and the client shell. Kept in one file so the renderer never
 * imports from the server-side page module.
 *
 * v1 NOTE: there is no dedicated `KnittingPattern` Prisma model yet
 * (K-1 added knitting-specific fields to Tutorial). A KnittingPattern
 * model is the K-4 follow-on; v1 of the Studio operates from a typed
 * pattern shape supplied by the page loader. When a future Tutorial-
 * sourced pattern is loaded, the page maps Tutorial.body / knitting
 * fields onto KnittingPatternData and the rest of the Studio is
 * agnostic to the source.
 */

/**
 * KnittingChartData + KnittingChartType are owned by K-2's renderer
 * (apps/web/src/lib/knitting/renderer/types.ts) and re-exported here
 * for convenience. The Studio is a pure consumer of K-2's contract.
 */
export type { KnittingChartData, KnittingChartType } from '@/lib/knitting/renderer/types'

import type { KnittingChartData as RendererKnittingChartData } from '@/lib/knitting/renderer/types'

/**
 * Pattern construction. FLAT = working back and forth on straight or
 * circular needles, RS / WS rows alternate. IN_THE_ROUND = working in
 * a continuous spiral, every round is RS.
 */
export type KnittingConstruction = 'FLAT' | 'IN_THE_ROUND'

/** In-the-round working method. */
export type InTheRoundMethod =
  | 'MAGIC_LOOP'
  | 'TWO_CIRCULARS'
  | 'DPN'
  | 'SHORT_CIRCULAR'
  | 'STRAIGHT_FLAT'

export type CastOnMethod =
  | 'LONG_TAIL'
  | 'CABLE'
  | 'GERMAN_TWISTED'
  | 'PROVISIONAL'
  | 'ITALIAN_TUBULAR'
  | 'OLD_NORWEGIAN'
  | 'BACKWARD_LOOP'
  | 'JUDYS_MAGIC'
  | 'KNITTED_ON'
  | 'CROCHET_PROVISIONAL'

export type BindOffMethod =
  | 'STANDARD'
  | 'STRETCHY'
  | 'TUBULAR'
  | 'SEWN'
  | 'JENYS_SURPRISINGLY_STRETCHY'
  | 'THREE_NEEDLE'
  | 'I_CORD'
  | 'RUSSIAN_GRAFT'
  | 'PICOT'
  | 'SUSPENDED'

/**
 * The data the Studio reads to render a single knitting pattern. v1
 * shape; will be sourced from a future KnittingPattern row once the
 * K-4 schema migration lands. For now the page loader either builds
 * this from a Tutorial row or hands the Studio a sample pattern for
 * smoke-test routes.
 */
export interface KnittingPatternData {
  id: string
  slug: string | null
  name: string
  description: string | null

  /** Structured rows, mirroring CrochetPatternRow. Renders the
   *  written view + drives the row counter on plain-text patterns. */
  rowsStructured: PatternRow[]

  /** K-2 chart data. Optional — many patterns are written-only. */
  chartData: RendererKnittingChartData | null

  /** Pre-rendered schematic image. v1 displays existing Media; the
   *  schematic generator is K-4 follow-on. */
  schematicMediaId: string | null

  /** Cover thumbnail. */
  thumbnailMediaId: string | null

  construction: KnittingConstruction | null

  /** Pattern shape — GARMENT toggles the schematic view, AMIGURUMI
   *  toggles the piece-by-piece UI, etc. v1 reads it but most are
   *  handled identically. */
  shapeCategory: KnittingShape | null

  /** Graded sizes (garments only). */
  sizesGraded:
    | Array<{
        name: string
        bust?: number
        waist?: number
        hip?: number
        length?: number
        sleeveLength?: number
        shoulderWidth?: number
      }>
    | null

  yardageBySize: Record<string, number> | null

  gaugeText: string | null
  finishedSizeText: string | null

  abbreviationsUsed: string[]
  specialStitchesUsed: string[]
  craftStitchSlugs: string[]
  craftTechniqueTags: string[]

  /** Per-row repeat groups for the repeat counter. */
  repeatRowGroups:
    | Array<{
        startRow: number
        endRow: number
        label?: string
        defaultTargetCm?: number
      }>
    | null

  difficulty: string | null
  premium: boolean

  designerSlug: string | null
  designerName: string | null
  sourceTutorialSlug: string | null
  sourceTutorialCategorySlug: string | null
  sourceTutorialId: string | null

  primaryYarnWeightCategory: number | null
  primaryYarnWeightName: string | null
  primaryNeedleMm: number | null
  primaryNeedleName: string | null

  castOnMethod: CastOnMethod | null
  bindOffMethod: BindOffMethod | null
  inTheRoundMethod: InTheRoundMethod | null
}

export type KnittingShape =
  | 'GARMENT'
  | 'ACCESSORY'
  | 'HAT'
  | 'SHAWL'
  | 'SOCKS'
  | 'BLANKET'
  | 'HOME'
  | 'AMIGURUMI'
  | 'SAMPLER'

/**
 * One row of the rowsStructured JSON. Mirrors the crochet PatternRow
 * shape but adds RS / WS marker (knitting flats alternate) and the
 * round-not-row toggle (knitting in-the-round uses Rnd).
 */
export interface PatternRow {
  section: string
  rowNumber: number
  rowLabel?: string
  instruction: string
  stitchCount?: number
  sizeVariants?: Record<string, { instruction: string; stitchCount?: number }>
  isRoundNotRow?: boolean
  rightSide?: boolean
  helpNote?: string
}

export interface KnittingProjectProgressData {
  /** Linear position across all sections (back-compat). */
  currentRow: number
  currentSection: string | null
  completedRows: Record<string, number[]>
  notes: string | null
  perRowNotes: Record<string, string>
  gradedSize: string | null
  customMeasurements: Record<string, number> | null
  preferredView: 'written' | 'chart' | 'schematic' | null

  /** Knitting-specific counters. */
  currentRound: number
  currentRepeat: number
  currentStitch: number
  cableNeedles: CableNeedleEntry[]
  rightSide: boolean

  lastWorkedAt: string | null
  completedAt: string | null
  projectSetup: ProjectSetup | null
}

export interface CableNeedleEntry {
  id: string
  description: string
  stitchCount: number
  holdInFront: boolean
  addedAt: string
}

export interface ProjectSetup {
  yarn?: {
    label: string
    weightSlug?: string
    colourHex?: string
    colourName?: string
    yardage?: number
    skeins?: number
  }
  needles?: {
    mmSize: number
    brand?: string
    style?: 'STRAIGHT' | 'CIRCULAR' | 'DPN' | 'INTERCHANGEABLE'
    inTheRoundMethod?: InTheRoundMethod
  }
  castOn?: CastOnMethod
  swatch?: {
    stitchesPer10cm?: number
    rowsPer10cm?: number
    blocked?: boolean
  }
}

export interface MyKnittingProjectListItem {
  knittingPatternId: string
  patternName: string
  shapeCategory: KnittingShape | null
  difficulty: string | null
  thumbnailMediaId: string | null
  currentRow: number
  currentSection: string | null
  lastWorkedAt: string
  completedAt: string | null
}

export type ViewMode = 'written' | 'chart' | 'schematic'
