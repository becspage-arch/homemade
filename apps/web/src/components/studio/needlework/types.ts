/**
 * Shared types for the Needlework Studio.
 *
 * Two pattern archetypes:
 *   - Grid  — counted disciplines (BLACKWORK, HARDANGER, NEEDLEPOINT, SASHIKO)
 *             gridData is the same JSON cell grid as Pattern.data.
 *   - Surface — freehand disciplines (SURFACE_EMBROIDERY, CREWEL, GOLDWORK,
 *               RIBBON, STUMPWORK, CANDLEWICKING)
 *             vectorData is an SVG outline + region list.
 *             regionAnnotations assigns a stitch type and thread colour to
 *             each region.
 */

import type { LocateModel } from '@/lib/needlework/locate'
export type { LocateModel, LocateFloss, LocateArea } from '@/lib/needlework/locate'

export type NeedleworkDiscipline =
  | 'BLACKWORK'
  | 'HARDANGER'
  | 'NEEDLEPOINT'
  | 'SASHIKO'
  | 'SURFACE_EMBROIDERY'
  | 'CREWEL'
  | 'GOLDWORK'
  | 'RIBBON'
  | 'STUMPWORK'
  | 'CANDLEWICKING'

export type NeedleworkPatternFormat =
  | 'GRID_CHART'
  | 'SURFACE_VECTOR'
  | 'ROUTE_DIAGRAM'
  | 'PAINTED_CANVAS'

export type NeedleworkProjectPhase = 'DESIGN' | 'TRANSFER' | 'STITCHING' | 'FINISHING'

export const COUNTED_DISCIPLINES: NeedleworkDiscipline[] = [
  'BLACKWORK',
  'HARDANGER',
  'NEEDLEPOINT',
  'SASHIKO',
]

export const SURFACE_DISCIPLINES: NeedleworkDiscipline[] = [
  'SURFACE_EMBROIDERY',
  'CREWEL',
  'GOLDWORK',
  'RIBBON',
  'STUMPWORK',
  'CANDLEWICKING',
]

export function isCountedDiscipline(d: NeedleworkDiscipline): boolean {
  return (COUNTED_DISCIPLINES as string[]).includes(d)
}

export function isSurfaceDiscipline(d: NeedleworkDiscipline): boolean {
  return (SURFACE_DISCIPLINES as string[]).includes(d)
}

export const DISCIPLINE_LABELS: Record<NeedleworkDiscipline, string> = {
  BLACKWORK: 'Blackwork',
  HARDANGER: 'Hardanger',
  NEEDLEPOINT: 'Needlepoint',
  SASHIKO: 'Sashiko',
  SURFACE_EMBROIDERY: 'Surface embroidery',
  CREWEL: 'Crewel',
  GOLDWORK: 'Goldwork',
  RIBBON: 'Ribbon embroidery',
  STUMPWORK: 'Stumpwork',
  CANDLEWICKING: 'Candlewicking',
}

export const DISCIPLINE_DESCRIPTIONS: Record<NeedleworkDiscipline, string> = {
  BLACKWORK: 'Counted geometric fill patterns on evenweave',
  HARDANGER: 'Norwegian counted cutwork on 22-count fabric',
  NEEDLEPOINT: 'Canvas embroidery covering every mesh',
  SASHIKO: 'Japanese geometric running stitch on indigo cloth',
  SURFACE_EMBROIDERY: 'Freehand stitching following a transferred design',
  CREWEL: 'Wool thread on linen, Jacobean and beyond',
  GOLDWORK: 'Metal thread couched on fabric surface',
  RIBBON: 'Silk ribbon forming dimensional florals',
  STUMPWORK: 'Raised work with wire frames and needlelace',
  CANDLEWICKING: 'Colonial knots and bullion stitch on muslin',
}

// ──────────────────────────────────────────────────────────────────────────────
// Pattern data shapes
// ──────────────────────────────────────────────────────────────────────────────

/** A surface pattern region with stitch assignment. */
export interface NeedleworkRegionAnnotation {
  id: string
  stitchType: string
  threadRef: string
  colourHex: string
  notes?: string
}

/** Surface pattern: SVG outline + named region list. */
export interface NeedleworkVectorData {
  svgContent: string
  width: number
  height: number
  regions: Array<{ id: string; label: string }>
  /** Dense thread-painting patterns: the colour / stitch-direction map (with the
   *  clean outline overlaid), offered as an alternate Studio view to the outline
   *  in `svgContent`. Absent for patterns with no colour map. */
  colourMapSvg?: string | null
}

// ──────────────────────────────────────────────────────────────────────────────
// Studio data transfer types
// ──────────────────────────────────────────────────────────────────────────────

export interface NeedleworkPatternData {
  id: string
  slug: string | null
  name: string
  description: string | null
  discipline: NeedleworkDiscipline
  patternFormat: NeedleworkPatternFormat
  // Counted patterns
  gridData: unknown | null
  chartData: unknown | null
  widthCells: number | null
  heightCells: number | null
  colourCount: number
  // Surface patterns
  vectorData: NeedleworkVectorData | null
  regionAnnotations: NeedleworkRegionAnnotation[] | null
  /** Dense thread-painting only — the interactive colour map + floss/area lists
   *  that power "select a colour or area, see where it goes". Null otherwise. */
  locate?: LocateModel | null
  // Shared metadata
  fabricSpec: unknown | null
  threadTypes: string[]
  frameType: string | null
  culturalAttribution: string | null
  thumbnailMediaId: string | null
  heroMediaId: string | null
  difficulty: string | null
  estimatedHours: number | null
  premium: boolean
  ownerUserId: string | null
  designerSlug: string | null
  designerName: string | null
  sourceTutorialSlug: string | null
  sourceTutorialCategorySlug: string | null
}

export interface NeedleworkProjectProgressData {
  currentPhase: NeedleworkProjectPhase
  completedCells: Record<string, true>
  completedRegions: Record<string, true>
  notes: string | null
  lastWorkedAt: string
  completedAt: string | null
}

export interface MyNeedleworkProjectListItem {
  needleworkPatternId: string
  patternName: string
  discipline: NeedleworkDiscipline
  difficulty: string | null
  thumbnailMediaId: string | null
  lastWorkedAt: string
  completedAt: string | null
}
