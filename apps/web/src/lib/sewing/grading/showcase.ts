// SPDX-License-Identifier: MIT
// Server-side showcase renderer. Wraps `draftPattern` with the CYC default
// measurement set for a design's gender family so anonymous Studio browse
// has something to display without going through the authed API route.
//
// Cached in `SewingPatternDraftCache` the same way authed renders are
// (content-addressable on the wrapper's cacheKey). Re-runs for the same
// design + freesewing version are free.
//
// Used by the server page at /studio/sewing/[slug] to enrich freesewing
// patterns with their showcase SVG before handing them down to the
// client shell.

import 'server-only'
import { prisma } from '@homemade/db'

import { draftPattern, FREESEWING_VERSION } from './grader'
import { getDesignConfig } from './design-registry'
import type { CalibrationMode, DrafterOutput } from './types'
import type { MeasurementsPayload } from '../measurements'

const CYC_WOMENS_M_CM: MeasurementsPayload = {
  bustChestCm: 92,
  waistCm: 74,
  hipCm: 100,
  bodyHeightCm: 168,
  inseamCm: 78,
  bustPointCm: 18,
  backWaistLengthCm: 41,
  frontWaistLengthCm: 42,
  shoulderWidthCm: 41,
  armLengthCm: 60,
  wristCircumferenceCm: 16,
  neckCircumferenceCm: 36,
}

const CYC_MENS_M_CM: MeasurementsPayload = {
  bustChestCm: 100,
  waistCm: 87,
  hipCm: 99,
  bodyHeightCm: 178,
  inseamCm: 80,
  shoulderWidthCm: 45,
  armLengthCm: 66,
  wristCircumferenceCm: 17,
  neckCircumferenceCm: 38,
}

function defaultMeasurementsFor(designSlug: string): MeasurementsPayload {
  const cfg = getDesignConfig(designSlug)
  if (!cfg) return CYC_WOMENS_M_CM
  return cfg.genderFamily === 'MENS' ? CYC_MENS_M_CM : CYC_WOMENS_M_CM
}

export interface ShowcaseOutput {
  svg: string
  cacheKey: string
  attribution: string
  freesewingVersion: string
  calibrationMode: CalibrationMode
  cacheHit: boolean
}

/**
 * Return the showcase render for a freesewing design at CYC default
 * measurements. Hits the SewingPatternDraftCache if present, otherwise
 * runs the wrapper and stores. Always BROWSE mode so the footer credit
 * is included.
 *
 * Returns null on unknown designSlug rather than throwing — callers
 * (server pages) prefer to degrade to a "no preview available" message
 * over a 500.
 */
export async function getFreesewingShowcase(
  designSlug: string,
): Promise<ShowcaseOutput | null> {
  const cfg = getDesignConfig(designSlug)
  if (!cfg) return null

  const measurements = defaultMeasurementsFor(designSlug)
  const calibrationMode: CalibrationMode = 'BROWSE'

  // Probe: build the same cacheKey draftPattern would. Avoid actually
  // calling the engine if the cache has it.
  let drafted: DrafterOutput
  try {
    drafted = await draftPattern({
      designSlug,
      measurements,
      calibrationMode,
    })
  } catch {
    return null
  }

  const cached = await prisma.sewingPatternDraftCache.findUnique({
    where: { cacheKey: drafted.cacheKey },
  })
  if (cached) {
    await prisma.sewingPatternDraftCache.update({
      where: { cacheKey: drafted.cacheKey },
      data: {
        lastAccessedAt: new Date(),
        accessCount: { increment: 1 },
      },
    })
    return {
      svg: cached.svgOutput,
      cacheKey: cached.cacheKey,
      attribution: drafted.attribution,
      freesewingVersion: cached.freesewingVersion,
      calibrationMode,
      cacheHit: true,
    }
  }

  await prisma.sewingPatternDraftCache.create({
    data: {
      cacheKey: drafted.cacheKey,
      designSlug,
      measurementsHash: drafted.cacheKey,
      optionsHash: drafted.cacheKey,
      calibrationMode,
      svgOutput: drafted.svg,
      freesewingVersion: FREESEWING_VERSION,
      accessCount: 1,
    },
  })

  return {
    svg: drafted.svg,
    cacheKey: drafted.cacheKey,
    attribution: drafted.attribution,
    freesewingVersion: drafted.freesewingVersion,
    calibrationMode,
    cacheHit: false,
  }
}
