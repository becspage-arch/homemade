// Central knitting grading entry point. Routes to the appropriate per-
// shape module and returns the structured GradedPattern.
//
// Author prompts and the personalisation pipeline call `gradeGarment()`
// for a single size; `gradeAllSizes()` loops across a size list.

import type { GarmentGradeInput, GradedPattern } from './types'
import type { SizeName } from './size-charts'
import { gradeTopDownRaglan } from './construction-shapes/top-down-raglan'
import { gradeTopDownYoke } from './construction-shapes/top-down-yoke'
import { gradeBottomUpSetIn } from './construction-shapes/bottom-up-set-in'
import { gradeDropShoulder } from './construction-shapes/drop-shoulder'
import { gradeSideToSide } from './construction-shapes/side-to-side'
import { gradeContiguousSetIn } from './construction-shapes/contiguous-set-in'

export function gradeGarment(input: GarmentGradeInput): GradedPattern {
  const shared = {
    size: input.size,
    gauge: input.gauge,
    easePreset: input.easePreset,
    garmentType: input.garmentType,
    options: input.options,
    bodyMeasurements: input.bodyMeasurements,
  }

  switch (input.constructionShape) {
    case 'TOP_DOWN_RAGLAN': return gradeTopDownRaglan(shared)
    case 'TOP_DOWN_YOKE': return gradeTopDownYoke(shared)
    case 'BOTTOM_UP_SET_IN': return gradeBottomUpSetIn(shared)
    case 'DROP_SHOULDER': return gradeDropShoulder(shared)
    case 'SIDE_TO_SIDE': return gradeSideToSide(shared)
    case 'CONTIGUOUS_SET_IN': return gradeContiguousSetIn(shared)
  }
}

export function gradeAllSizes(
  sizes: SizeName[],
  base: Omit<GarmentGradeInput, 'size'>,
): GradedPattern[] {
  return sizes.map(size => gradeGarment({ ...base, size }))
}

export type {
  GradedPattern,
  GradedSizeLabel,
  ShapeOptions,
  ConstructionShape,
  GarmentType,
  GarmentGradeInput,
  FinishedMeasurements,
  AssemblyInstructions,
} from './types'
export type { SizeName, BodyMeasurements } from './size-charts'
export type { EasePreset } from './ease-presets'
export type { Gauge, DominantFabric } from './gauge'
