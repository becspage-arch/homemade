// Central grading entry point. Routes to the appropriate per-shape
// module and returns the structured GradedPattern.
//
// Author prompts and the personalisation pipeline call `gradePattern()`.
// Per-size loops in author prompts call this for each size in the
// pattern's size list.

import type {
  ConstructionShape,
  GarmentType,
  Gauge,
  GradedPattern,
  ShapeOptions,
} from './types'
import type { SizeName } from './size-charts'
import type { EasePreset } from './ease-presets'
import { gradeTopDownRaglan } from './construction-shapes/top-down-raglan'
import { gradeTopDownYoke } from './construction-shapes/top-down-yoke'
import { gradeBottomUpSetIn } from './construction-shapes/bottom-up-set-in'
import { gradeDropShoulder } from './construction-shapes/drop-shoulder'
import { gradeSideToSide } from './construction-shapes/side-to-side'

export interface GradePatternInput {
  constructionShape: ConstructionShape
  size: SizeName
  gauge: Gauge
  easePreset: EasePreset
  garmentType: GarmentType
  options?: ShapeOptions
}

export function gradePattern(input: GradePatternInput): GradedPattern {
  const shared = {
    size: input.size,
    gauge: input.gauge,
    easePreset: input.easePreset,
    garmentType: input.garmentType,
    options: input.options,
  }

  switch (input.constructionShape) {
    case 'TOP_DOWN_RAGLAN': return gradeTopDownRaglan(shared)
    case 'TOP_DOWN_YOKE':   return gradeTopDownYoke(shared)
    case 'BOTTOM_UP_SET_IN': return gradeBottomUpSetIn(shared)
    case 'DROP_SHOULDER':   return gradeDropShoulder(shared)
    case 'SIDE_TO_SIDE':    return gradeSideToSide(shared)
  }
}

export function gradeAllSizes(
  sizes: SizeName[],
  base: Omit<GradePatternInput, 'size'>,
): GradedPattern[] {
  return sizes.map(size => gradePattern({ ...base, size }))
}

export type { GradedPattern, ShapeOptions, ConstructionShape, GarmentType, Gauge } from './types'
export type { SizeName } from './size-charts'
export type { EasePreset } from './ease-presets'
