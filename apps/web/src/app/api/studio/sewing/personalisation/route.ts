// SPDX-License-Identifier: MIT
// POST /api/studio/sewing/personalisation
//
// Creates a SewingPatternPersonalisation row and runs the freesewing
// draft synchronously via the wrapper. Returns the row id plus the
// terminal status (SUCCESS / FAILED) and the rendered SVG on success.
//
// Authenticated users only. Anonymous users use the showcase render on
// /studio/sewing/personalise (no DB write) per the locked sign-in
// carrots — personalised drafting needs the saved measurements profile.
//
// Premium gating: the row is created either way. STUDIO_PREMIUM_GATING
// is checked in the Studio UI before the user reaches this endpoint;
// gating is a config flag (default off) so the build phase runs every
// feature free.

import 'server-only'
import { NextResponse } from 'next/server'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { pickFields, type MeasurementsPayload } from '@/lib/sewing/measurements'
import { createPersonalisation } from '@/lib/sewing/personalisation'
import { getDesignConfig } from '@/lib/sewing/grading/design-registry'

interface RequestBody {
  designSlug?: string
  measurements?: Record<string, unknown>
  designOptions?: Record<string, number | string | boolean>
  measurementsPreference?: 'cm' | 'inches'
  easeOverrideCm?: number
}

export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 })
  }

  const designSlug = typeof body.designSlug === 'string' ? body.designSlug : ''
  if (!getDesignConfig(designSlug)) {
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

  const measurementsPreference: 'cm' | 'inches' =
    body.measurementsPreference === 'inches' ? 'inches' : 'cm'

  const result = await createPersonalisation({
    userId: user.id,
    designSlug,
    measurements,
    measurementsPreference,
    designOptions: body.designOptions,
    easeOverrideCm:
      typeof body.easeOverrideCm === 'number' ? body.easeOverrideCm : null,
  })

  return NextResponse.json(result, {
    status: result.status === 'FAILED' ? 422 : 200,
  })
}
