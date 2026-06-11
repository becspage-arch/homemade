/**
 * Shared types for the sewing personalisation flow. The server page
 * builds these and hands them to the client shell so the registry's
 * private shape stays inside lib/sewing/grading.
 */

import type { MeasurementField } from '@/lib/sewing/measurements'
import type { SewingDesignOptionMeta } from '@/lib/sewing/grading/types'

export interface SewingDesignSummary {
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
  /** Freesewing measurement keys this design needs. */
  requiredMeasurements: string[]
  optionalMeasurements: string[]
  options: Record<string, SewingDesignOptionMeta>
}

export interface SavedMeasurements {
  fields: Partial<Record<MeasurementField, number | null>>
  notes: string | null
}
