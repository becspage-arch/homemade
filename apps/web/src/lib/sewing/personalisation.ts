/**
 * Sewing personalisation orchestration. Wraps the freesewing draft path
 * with a SewingPatternPersonalisation row so the Studio has a durable
 * record of "this user asked for this design with these measurements at
 * this point in time," plus the rendered SVG cached against it.
 *
 * The flow:
 *   1. createPersonalisation() — insert PENDING row + run draft synchronously
 *      via the wrapper. Freesewing renders sub-second so we don't queue
 *      work; the row's PENDING -> GENERATING -> SUCCESS / FAILED transitions
 *      happen inside this single call. Pollers see the row at SUCCESS.
 *   2. attachToProject() — promote a SUCCESS row into a SewingPatternProject
 *      so the user has it in My Projects.
 *
 * Premium gating is the caller's concern (see lib/studio/premium-gates).
 * The Personalisation row is created either way because Worker F flips
 * the flag globally; gated callers short-circuit before reaching here.
 */

import 'server-only'

import { prisma, type Prisma } from '@homemade/db'

import { draftPattern, FREESEWING_VERSION } from './grading/grader'
import { getDesignConfig } from './grading/design-registry'
import type { MeasurementsPayload } from './measurements'
import type { CalibrationMode } from './grading/types'

export interface CreatePersonalisationInput {
  userId: string
  designSlug: string
  measurements: MeasurementsPayload
  measurementsPreference: 'cm' | 'inches'
  designOptions?: Record<string, number | string | boolean>
  easeOverrideCm?: number | null
  calibrationMode?: CalibrationMode
}

export interface PersonalisationResult {
  id: string
  status: 'PENDING' | 'GENERATING' | 'SUCCESS' | 'FAILED' | 'REJECTED'
  svg: string | null
  cacheKey: string | null
  attribution: string | null
  errorMessage: string | null
  freesewingVersion: string
  patternId: string
}

/**
 * Resolve the SewingPattern row for a registered freesewing design.
 * Returns null if no anchor row has been seeded yet — the seed script
 * (scripts/seed-freesewing-showcase-patterns.ts) is the single source of
 * truth for which designs have public anchor rows.
 */
async function findAnchorPattern(designSlug: string) {
  return prisma.sewingPattern.findFirst({
    where: { freesewingDesignSlug: designSlug, isFreesewingDesign: true },
    select: { id: true },
  })
}

/**
 * Create a SewingPatternPersonalisation row and run the freesewing draft
 * synchronously. Returns the row id plus its terminal status (SUCCESS or
 * FAILED). The Studio's preview surface reads the SVG straight off the
 * return value; pollers re-fetch via getPersonalisation() to see the same
 * state.
 *
 * Errors from the wrapper land on the row as `errorMessage` with status
 * FAILED. The function does not re-throw — callers always get a row id
 * back so the UI can render the failure state.
 */
export async function createPersonalisation(
  input: CreatePersonalisationInput,
): Promise<PersonalisationResult> {
  const designCfg = getDesignConfig(input.designSlug)
  if (!designCfg) {
    throw new Error(`Unknown sewing design slug: ${input.designSlug}`)
  }

  const anchor = await findAnchorPattern(input.designSlug)
  if (!anchor) {
    throw new Error(
      `No SewingPattern anchor row for design "${input.designSlug}". ` +
        `Run scripts/seed-freesewing-showcase-patterns.ts first.`,
    )
  }

  const calibrationMode: CalibrationMode = input.calibrationMode ?? 'BROWSE'

  const row = await prisma.sewingPatternPersonalisation.create({
    data: {
      userId: input.userId,
      patternId: anchor.id,
      measurementsSnapshot: input.measurements as unknown as Prisma.InputJsonValue,
      measurementsPreferenceSnapshot: input.measurementsPreference,
      designOptions:
        (input.designOptions ?? {}) as unknown as Prisma.InputJsonValue,
      easePreference:
        typeof input.easeOverrideCm === 'number' ? input.easeOverrideCm : null,
      status: 'GENERATING',
    },
    select: { id: true, patternId: true },
  })

  try {
    const drafted = await draftPattern({
      designSlug: input.designSlug,
      measurements: input.measurements,
      options: { designOptions: input.designOptions ?? {} },
      calibrationMode,
    })

    // Mirror the draft into the shared cache so repeat draws hit the
    // existing pipeline without a wrapper round-trip.
    const existing = await prisma.sewingPatternDraftCache.findUnique({
      where: { cacheKey: drafted.cacheKey },
    })
    if (existing) {
      await prisma.sewingPatternDraftCache.update({
        where: { cacheKey: drafted.cacheKey },
        data: {
          lastAccessedAt: new Date(),
          accessCount: { increment: 1 },
        },
      })
    } else {
      await prisma.sewingPatternDraftCache.create({
        data: {
          cacheKey: drafted.cacheKey,
          designSlug: input.designSlug,
          measurementsHash: drafted.cacheKey,
          optionsHash: drafted.cacheKey,
          calibrationMode,
          svgOutput: drafted.svg,
          freesewingVersion: FREESEWING_VERSION,
          accessCount: 1,
        },
      })
    }

    const updated = await prisma.sewingPatternPersonalisation.update({
      where: { id: row.id },
      data: {
        status: 'SUCCESS',
        outputSvg: drafted.svg,
        outputCacheKey: drafted.cacheKey,
        generatedAt: new Date(),
        errorMessage: null,
      },
      select: {
        id: true,
        status: true,
        outputSvg: true,
        outputCacheKey: true,
        errorMessage: true,
        patternId: true,
      },
    })

    return {
      id: updated.id,
      status: updated.status,
      svg: updated.outputSvg,
      cacheKey: updated.outputCacheKey,
      attribution: drafted.attribution,
      errorMessage: null,
      freesewingVersion: drafted.freesewingVersion,
      patternId: updated.patternId,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    const failed = await prisma.sewingPatternPersonalisation.update({
      where: { id: row.id },
      data: {
        status: 'FAILED',
        errorMessage: message.slice(0, 1000),
        generatedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        outputSvg: true,
        outputCacheKey: true,
        errorMessage: true,
        patternId: true,
      },
    })
    return {
      id: failed.id,
      status: failed.status,
      svg: null,
      cacheKey: null,
      attribution: null,
      errorMessage: failed.errorMessage,
      freesewingVersion: FREESEWING_VERSION,
      patternId: failed.patternId,
    }
  }
}

/**
 * Fetch a personalisation row for the polling endpoint. Caller is
 * responsible for the ownership check; this helper only does the read.
 */
export async function getPersonalisation(id: string) {
  return prisma.sewingPatternPersonalisation.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      patternId: true,
      status: true,
      outputSvg: true,
      outputCacheKey: true,
      errorMessage: true,
      generatedAt: true,
      designOptions: true,
      measurementsSnapshot: true,
      measurementsPreferenceSnapshot: true,
      projectId: true,
      pattern: {
        select: {
          name: true,
          slug: true,
          attributionText: true,
          freesewingDesignSlug: true,
        },
      },
    },
  })
}

/**
 * Promote a SUCCESS personalisation row into a SewingPatternProject so it
 * lands in My Projects. Idempotent on (userId, personalisationId): a
 * second call returns the existing project row without re-creating.
 */
export async function attachToProject(
  userId: string,
  personalisationId: string,
): Promise<{ projectId: string }> {
  const row = await prisma.sewingPatternPersonalisation.findUnique({
    where: { id: personalisationId },
    select: {
      id: true,
      userId: true,
      patternId: true,
      projectId: true,
      status: true,
      measurementsSnapshot: true,
    },
  })
  if (!row || row.userId !== userId) {
    throw new Error('personalisation not found')
  }
  if (row.status !== 'SUCCESS') {
    throw new Error('personalisation not ready')
  }
  if (row.projectId) return { projectId: row.projectId }

  const project = await prisma.sewingPatternProject.create({
    data: {
      userId,
      patternId: row.patternId,
      status: 'DRAFT',
      measurementsSnapshot: row.measurementsSnapshot as Prisma.InputJsonValue,
    },
    select: { id: true },
  })

  await prisma.sewingPatternPersonalisation.update({
    where: { id: personalisationId },
    data: {
      projectId: project.id,
      deliveredToProject: true,
    },
  })

  return { projectId: project.id }
}
