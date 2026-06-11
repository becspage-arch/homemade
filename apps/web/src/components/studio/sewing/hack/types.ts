/**
 * Shared types for the visual hack composer surface. The server page
 * builds these from the design registry and hands them to the client
 * shell so the wrapper's private shapes stay inside lib/sewing/grading.
 */

import type { MeasurementField } from '@/lib/sewing/measurements'
import type {
  SewingDesignOptionMeta,
  SewingHackHandle,
} from '@/lib/sewing/grading/types'

export interface HackComposerDesign {
  slug: string
  name: string
  description: string
  genderFamily: 'WOMENS' | 'MENS' | 'UNISEX' | 'KIDS' | 'BABIES'
  skillLevel:
    | 'ABSOLUTE_BEGINNER'
    | 'BEGINNER'
    | 'CONFIDENT_BEGINNER'
    | 'IMPROVER'
    | 'INTERMEDIATE'
    | 'ADVANCED'
    | 'EXPERT'
  requiredMeasurements: string[]
  optionalMeasurements: string[]
  options: Record<string, SewingDesignOptionMeta>
  hackHandles: SewingHackHandle[]
}

export interface HackSavedListItem {
  id: string
  name: string
  parentPatternSlug: string
  parentPatternName: string
  designSlug: string | null
  status: string
  hackOptions: Record<string, number | string | boolean>
  updatedAt: string
  generatedAt: string | null
  notes: string | null
}

export type MeasurementsMap = Partial<Record<MeasurementField, number | null>>
