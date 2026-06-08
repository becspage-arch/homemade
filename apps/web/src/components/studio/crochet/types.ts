/**
 * Shared types for /studio/crochet — passed between the server entry
 * page and the client shell. Kept in one file so the renderer never
 * imports from the server-side page module.
 */

import type {
  CrochetConstruction,
  CrochetPatternFormat,
  CrochetShape,
  Difficulty,
} from '@homemade/db'

export interface CrochetPatternData {
  id: string
  slug: string | null
  name: string
  description: string | null
  rowsStructured: unknown
  chartData: unknown
  schematicMediaId: string | null
  thumbnailMediaId: string | null
  format: CrochetPatternFormat
  construction: CrochetConstruction | null
  shapeCategory: CrochetShape | null
  sizesGraded: unknown
  yardageBySize: unknown
  gaugeText: string | null
  finishedSizeText: string | null
  pieceCount: number
  pieces: unknown
  buildOrder: unknown
  abbreviationsUsed: string[]
  specialStitchesUsed: string[]
  craftStitchSlugs: string[]
  craftTechniqueTags: string[]
  terminologyConvention: string
  clusterCountByRound: unknown
  repeatRowGroups: unknown
  leftHandedChartAvailable: boolean
  difficulty: Difficulty | null
  premium: boolean
  ownerUserId: string | null
  designerSlug: string | null
  designerName: string | null
  sourceTutorialSlug: string | null
  sourceTutorialCategorySlug: string | null
  sourceTutorialId: string | null
  primaryYarnWeightCategory: number | null
  primaryYarnWeightName: string | null
  primaryHookMm: number | null
  primaryHookName: string | null
}

export interface CrochetProjectProgressData {
  currentRow: number
  currentSection: string | null
  completedRows: Record<string, number[]>
  notes: string | null
  perRowNotes: Record<string, string>
  gradedSize: string | null
  customMeasurements: Record<string, number> | null
  leftHandedOverride: boolean | null
  terminologyOverride: 'uk' | 'us' | null
  preferredView: 'written' | 'chart' | 'schematic' | null
  countByCluster: boolean
  lastWorkedAt: string | null
  completedAt: string | null
  projectSetup: ProjectSetup | null
}

export interface ProjectSetup {
  yarn?: {
    label: string
    weightSlug?: string
    colourHex?: string
    colourName?: string
    yardage?: number
  }
  hook?: {
    mmSize: number
    brand?: string
  }
  swatch?: {
    stitchesPer10cm?: number
    rowsPer10cm?: number
    blocked?: boolean
  }
}

export interface MyCrochetProjectListItem {
  crochetPatternId: string
  patternName: string
  shapeCategory: CrochetShape | null
  difficulty: Difficulty | null
  thumbnailMediaId: string | null
  currentRow: number
  currentSection: string | null
  lastWorkedAt: string
  completedAt: string | null
}

/**
 * One row of the rowsStructured JSON. The author writes these per
 * piece / section so the renderer can group them. See the schema doc
 * for the full shape in `packages/db/prisma/schema.prisma`.
 */
export interface PatternRow {
  section: string
  rowNumber: number
  rowLabel?: string
  instruction: string
  stitchCount?: number
  stitchCountAsCluster?: number
  sizeVariants?: Record<string, { instruction: string; stitchCount?: number }>
  isRoundNotRow?: boolean

  // Teacher-improvement fields (rowsStructured JSON, no migration needed).
  /** "centre colour" / "outer colour" / "Colour A". Surfaced as a coloured
   *  pip beside the row label so makers see colour changes coming. */
  colourLabel?: string
  /** Optional hex for the pip. When null and colourLabel is set, the pip
   *  shows as a neutral outline (the user has chosen her own colour). */
  colourHex?: string | null
  /** Photograph of finished work AFTER this row. The teacher reference. */
  referencePhotoMediaId?: string | null
  /** Inline tip surfaced beside the row. "First time? The magic ring is the
   *  trickiest part of any granny square. Pull the tail gently to close." */
  helpNote?: string
  /** Slug of the foundation tutorial whose troubleshooter to link from the
   *  helpNote. Renders as "See troubleshooting →" beneath the note. */
  helpTroubleshooterTutorialSlug?: string
}

export type ViewMode = 'written' | 'chart' | 'schematic'
export type TerminologyMode = 'uk' | 'us'
