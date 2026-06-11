// SPDX-License-Identifier: MIT
// POST /api/studio/sewing/personalisation/[id]/nested-pdf
//
// Multi-size nested PDF. Drafts the user's personalised pattern PLUS a
// set of standard CYC-derived sizes, then composes them onto an A0 sheet
// with colour-coded strokes and a legend.
//
// The S-5d brief allowed either pdf-lib OCG layers or this colour-coded
// flat overlay. pdf-lib's OCG support is too thin to ship — manual
// PDFRef construction would work in Acrobat but render inconsistently
// elsewhere. So the route returns the colour-coded flat overlay (see
// lib/sewing/printing/build-nested-pdf for the trade-off note).
//
// Body: { extraSizes?: [{ label, measurements }] }
//   When extraSizes is omitted the route picks the design's gender-
//   family CYC standard size set (M ± 2 sizes) so a single click gives
//   the user a useful nest.

import 'server-only'
import { NextResponse } from 'next/server'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { prisma } from '@homemade/db'
import { draftPattern } from '@/lib/sewing/grading/grader'
import { getDrafterFooterCredit } from '@/lib/sewing/grading/attribution'
import { getDesignConfig } from '@/lib/sewing/grading/design-registry'
import { buildNestedSizePdf } from '@/lib/sewing/printing/build-nested-pdf'
import type { MeasurementsPayload } from '@/lib/sewing/measurements'

interface RouteCtx {
  params: Promise<{ id: string }>
}

interface ExtraSize {
  label: string
  measurements: MeasurementsPayload
}

interface RequestBody {
  extraSizes?: ExtraSize[]
}

/**
 * CYC-derived standard sizes per gender family. Drawn around the M size
 * used in showcase.ts so they nest sensibly with the user's personalised
 * Pattern (which is itself their own size).
 */
const STANDARD_SIZES: Record<'WOMENS' | 'MENS' | 'UNISEX', ExtraSize[]> = {
  WOMENS: [
    {
      label: 'S (UK 10)',
      measurements: {
        bustChestCm: 86,
        waistCm: 68,
        hipCm: 94,
        bodyHeightCm: 166,
        inseamCm: 77,
        bustPointCm: 18,
        backWaistLengthCm: 40,
        frontWaistLengthCm: 41,
        shoulderWidthCm: 39,
        armLengthCm: 59,
        wristCircumferenceCm: 15,
        neckCircumferenceCm: 35,
      },
    },
    {
      label: 'M (UK 12)',
      measurements: {
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
      },
    },
    {
      label: 'L (UK 14)',
      measurements: {
        bustChestCm: 98,
        waistCm: 80,
        hipCm: 106,
        bodyHeightCm: 170,
        inseamCm: 79,
        bustPointCm: 19,
        backWaistLengthCm: 42,
        frontWaistLengthCm: 43,
        shoulderWidthCm: 42,
        armLengthCm: 61,
        wristCircumferenceCm: 16,
        neckCircumferenceCm: 37,
      },
    },
  ],
  MENS: [
    {
      label: 'S',
      measurements: {
        bustChestCm: 94,
        waistCm: 81,
        hipCm: 93,
        bodyHeightCm: 176,
        inseamCm: 79,
        shoulderWidthCm: 43,
        armLengthCm: 64,
        wristCircumferenceCm: 17,
        neckCircumferenceCm: 37,
      },
    },
    {
      label: 'M',
      measurements: {
        bustChestCm: 100,
        waistCm: 87,
        hipCm: 99,
        bodyHeightCm: 178,
        inseamCm: 80,
        shoulderWidthCm: 45,
        armLengthCm: 66,
        wristCircumferenceCm: 17,
        neckCircumferenceCm: 38,
      },
    },
    {
      label: 'L',
      measurements: {
        bustChestCm: 106,
        waistCm: 93,
        hipCm: 105,
        bodyHeightCm: 180,
        inseamCm: 81,
        shoulderWidthCm: 46,
        armLengthCm: 67,
        wristCircumferenceCm: 18,
        neckCircumferenceCm: 39,
      },
    },
  ],
  UNISEX: [
    {
      label: 'S',
      measurements: {
        bustChestCm: 90,
        waistCm: 76,
        hipCm: 96,
        bodyHeightCm: 170,
        inseamCm: 78,
        shoulderWidthCm: 42,
        armLengthCm: 62,
        wristCircumferenceCm: 16,
        neckCircumferenceCm: 36,
      },
    },
    {
      label: 'M',
      measurements: {
        bustChestCm: 96,
        waistCm: 82,
        hipCm: 102,
        bodyHeightCm: 172,
        inseamCm: 79,
        shoulderWidthCm: 43,
        armLengthCm: 63,
        wristCircumferenceCm: 16,
        neckCircumferenceCm: 37,
      },
    },
    {
      label: 'L',
      measurements: {
        bustChestCm: 102,
        waistCm: 88,
        hipCm: 108,
        bodyHeightCm: 174,
        inseamCm: 80,
        shoulderWidthCm: 44,
        armLengthCm: 64,
        wristCircumferenceCm: 17,
        neckCircumferenceCm: 38,
      },
    },
  ],
}

function asPayload(json: unknown): MeasurementsPayload {
  if (!json || typeof json !== 'object') return {}
  return json as MeasurementsPayload
}

export async function POST(req: Request, ctx: RouteCtx) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { id } = await ctx.params
  const row = await prisma.sewingPatternPersonalisation.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
      measurementsSnapshot: true,
      designOptions: true,
      pattern: {
        select: {
          name: true,
          freesewingDesignSlug: true,
          attributionText: true,
        },
      },
    },
  })
  if (!row || row.userId !== user.id) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 })
  }
  if (row.status !== 'SUCCESS') {
    return NextResponse.json({ error: 'not-ready' }, { status: 409 })
  }
  const designSlug = row.pattern?.freesewingDesignSlug ?? null
  const cfg = designSlug ? getDesignConfig(designSlug) : null
  if (!designSlug || !cfg) {
    return NextResponse.json({ error: 'unknown-design' }, { status: 400 })
  }

  let body: RequestBody = {}
  try {
    body = (await req.json()) as RequestBody
  } catch {
    // Empty body is acceptable; fall back to standard sizes.
  }

  const userMeasurements = asPayload(row.measurementsSnapshot)
  const designOptions = (row.designOptions ?? {}) as Record<
    string,
    number | string | boolean
  >

  const family =
    cfg.genderFamily === 'WOMENS'
      ? 'WOMENS'
      : cfg.genderFamily === 'MENS'
        ? 'MENS'
        : 'UNISEX'

  const sizes: ExtraSize[] = [
    { label: 'Your size', measurements: userMeasurements },
    ...(body.extraSizes ?? STANDARD_SIZES[family]),
  ]

  const drafted = await Promise.all(
    sizes.map(async (size) => {
      const out = await draftPattern({
        designSlug,
        measurements: size.measurements,
        options: { designOptions },
        calibrationMode: 'PRINT',
      })
      return { label: size.label, svg: out.svg }
    }),
  )

  const pdfBytes = await buildNestedSizePdf({
    patternName: row.pattern?.name ?? 'Sewing pattern',
    attributionText:
      row.pattern?.attributionText ??
      getDrafterFooterCredit(designSlug, 'PRINT'),
    sizes: drafted,
  })

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${row.pattern?.name?.replace(/[^a-z0-9]+/gi, '-').toLowerCase() ?? 'pattern'}-nested.pdf"`,
    },
  })
}
