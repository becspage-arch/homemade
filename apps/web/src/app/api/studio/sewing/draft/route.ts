// SPDX-License-Identifier: MIT
// POST /api/studio/sewing/draft
//
// Renders a freesewing design with the caller's measurements and returns
// the resulting SVG, cache key, and footer credit. Authenticated users
// only — anonymous users use the browse-only path in the Studio that
// renders a default-CYC sample without calling this endpoint.
//
// Cache: the wrapper's cacheKey is content-addressable so the route
// table-looks-up first and only invokes freesewing on miss. A cache hit
// bumps accessCount + lastAccessedAt; a miss inserts a fresh row.
//
// Premium gating is enforced at the Studio UI / API entry in S-5d and
// S-5e. The draft itself is free infrastructure per the locked
// "translation is free, personalisation is premium" rule; the wrapper
// runs for any authenticated caller.

import 'server-only'
import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { draftPattern, FREESEWING_VERSION } from '@/lib/sewing/grading/grader'
import { getDesignConfig } from '@/lib/sewing/grading/design-registry'
import type {
  CalibrationMode,
  DrafterOptions,
} from '@/lib/sewing/grading/types'
import type { MeasurementsPayload } from '@/lib/sewing/measurements'
import { pickFields } from '@/lib/sewing/measurements'

interface DraftRequestBody {
  designSlug?: string
  measurements?: Record<string, unknown>
  options?: {
    designOptions?: Record<string, number | string | boolean>
    seamAllowanceCm?: number
    locale?: string
  }
  calibrationMode?: string
}

function asCalibrationMode(input: unknown): CalibrationMode {
  if (input === 'PRINT' || input === 'PROJECTOR' || input === 'BROWSE') return input
  return 'BROWSE'
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let body: DraftRequestBody
  try {
    body = (await req.json()) as DraftRequestBody
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 })
  }

  const designSlug = typeof body.designSlug === 'string' ? body.designSlug : ''
  const designConfig = getDesignConfig(designSlug)
  if (!designConfig) {
    return NextResponse.json(
      { error: 'unknown-design', designSlug },
      { status: 400 },
    )
  }

  const measurements: MeasurementsPayload = pickFields(
    body.measurements && typeof body.measurements === 'object'
      ? (body.measurements as Record<string, unknown>)
      : {},
  )

  const calibrationMode = asCalibrationMode(body.calibrationMode)

  const options: DrafterOptions = {
    designOptions: body.options?.designOptions,
    seamAllowanceCm:
      typeof body.options?.seamAllowanceCm === 'number'
        ? body.options.seamAllowanceCm
        : undefined,
    locale: typeof body.options?.locale === 'string' ? body.options.locale : undefined,
  }

  const drafted = await draftPattern({
    designSlug,
    measurements,
    options,
    calibrationMode,
  })

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
    return NextResponse.json({
      svg: cached.svgOutput,
      cacheKey: cached.cacheKey,
      attribution: drafted.attribution,
      freesewingVersion: cached.freesewingVersion,
      calibrationMode: drafted.calibrationMode,
      cacheHit: true,
    })
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

  return NextResponse.json({
    svg: drafted.svg,
    cacheKey: drafted.cacheKey,
    attribution: drafted.attribution,
    freesewingVersion: drafted.freesewingVersion,
    calibrationMode: drafted.calibrationMode,
    cacheHit: false,
  })
}
