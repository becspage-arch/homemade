/**
 * Sewing hack composer orchestration. Wraps the freesewing draft path
 * with a SewingPatternHack row — a saved option set + parent pattern
 * reference. Mirrors the personalisation flow shape: row is created at
 * save time, the wrapper runs synchronously, outputSvg + outputCacheKey
 * are populated.
 *
 * Premium gating is the caller's concern (see lib/studio/premium-gates).
 * The hack row is created either way because Worker F flips the gate
 * globally; gated callers short-circuit at the Studio UI before reaching
 * here.
 */

import 'server-only'

import { prisma, type Prisma } from '@homemade/db'

import { draftPattern, FREESEWING_VERSION } from './grading/grader'
import { getDesignConfig } from './grading/design-registry'
import type { MeasurementsPayload } from './measurements'

export interface CreateHackInput {
  userId: string
  designSlug: string
  name: string | null
  hackOptions: Record<string, number | string | boolean>
  measurements: MeasurementsPayload
  measurementsPreference: 'cm' | 'inches'
  notes?: string | null
}

export interface HackResult {
  id: string
  status: 'PENDING' | 'GENERATING' | 'SUCCESS' | 'FAILED' | 'REJECTED'
  svg: string | null
  cacheKey: string | null
  errorMessage: string | null
  parentPatternId: string
}

async function findAnchorPattern(designSlug: string) {
  return prisma.sewingPattern.findFirst({
    where: { freesewingDesignSlug: designSlug, isFreesewingDesign: true },
    select: { id: true },
  })
}

/**
 * Create a SewingPatternHack row + run the freesewing draft synchronously.
 * Returns the row id plus the terminal status. The composer reads the SVG
 * straight off the wrapper's response; the saved row holds the same SVG
 * so revisits load instantly.
 *
 * Errors land on the row as `errorMessage`; the function does not re-throw
 * so the UI can render the failure state without crashing.
 */
export async function createHack(input: CreateHackInput): Promise<HackResult> {
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

  const row = await prisma.sewingPatternHack.create({
    data: {
      userId: input.userId,
      parentPatternId: anchor.id,
      name: input.name ?? null,
      hackOptions: input.hackOptions as unknown as Prisma.InputJsonValue,
      measurementsSnapshot:
        input.measurements as unknown as Prisma.InputJsonValue,
      measurementsPreferenceSnapshot: input.measurementsPreference,
      notes: input.notes ?? null,
      status: 'GENERATING',
    },
    select: { id: true, parentPatternId: true },
  })

  try {
    const drafted = await draftPattern({
      designSlug: input.designSlug,
      measurements: input.measurements,
      options: { designOptions: input.hackOptions },
      calibrationMode: 'BROWSE',
    })

    // Mirror the draft into the shared cache so future re-draws hit the
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
          calibrationMode: 'BROWSE',
          svgOutput: drafted.svg,
          freesewingVersion: FREESEWING_VERSION,
          accessCount: 1,
        },
      })
    }

    const updated = await prisma.sewingPatternHack.update({
      where: { id: row.id },
      data: {
        status: 'SUCCESS',
        outputSvg: drafted.svg,
        outputCacheKey: drafted.cacheKey,
        generatedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        outputSvg: true,
        outputCacheKey: true,
        parentPatternId: true,
      },
    })

    return {
      id: updated.id,
      status: updated.status,
      svg: updated.outputSvg,
      cacheKey: updated.outputCacheKey,
      errorMessage: null,
      parentPatternId: updated.parentPatternId,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    const failed = await prisma.sewingPatternHack.update({
      where: { id: row.id },
      data: {
        status: 'FAILED',
        generatedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        outputSvg: true,
        outputCacheKey: true,
        parentPatternId: true,
      },
    })
    return {
      id: failed.id,
      status: failed.status,
      svg: null,
      cacheKey: null,
      errorMessage: message.slice(0, 1000),
      parentPatternId: failed.parentPatternId,
    }
  }
}

export interface HackListItem {
  id: string
  name: string | null
  parentPatternId: string
  parentPatternSlug: string
  parentPatternName: string
  freesewingDesignSlug: string | null
  status: string
  hackOptions: Record<string, number | string | boolean>
  updatedAt: Date
  generatedAt: Date | null
  notes: string | null
}

export async function listHacksForUser(userId: string): Promise<HackListItem[]> {
  const rows = await prisma.sewingPatternHack.findMany({
    where: { userId },
    include: {
      parentPattern: {
        select: {
          id: true,
          slug: true,
          name: true,
          freesewingDesignSlug: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 60,
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    parentPatternId: r.parentPatternId,
    parentPatternSlug: r.parentPattern.slug,
    parentPatternName: r.parentPattern.name,
    freesewingDesignSlug: r.parentPattern.freesewingDesignSlug,
    status: r.status,
    hackOptions: (r.hackOptions as unknown) as Record<
      string,
      number | string | boolean
    >,
    updatedAt: r.updatedAt,
    generatedAt: r.generatedAt,
    notes: r.notes,
  }))
}

export async function getHackForUser(
  userId: string,
  hackId: string,
) {
  const row = await prisma.sewingPatternHack.findUnique({
    where: { id: hackId },
    include: {
      parentPattern: {
        select: { id: true, slug: true, name: true, freesewingDesignSlug: true },
      },
    },
  })
  if (!row || row.userId !== userId) return null
  return row
}
