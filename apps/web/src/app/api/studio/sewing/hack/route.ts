// SPDX-License-Identifier: MIT
// POST /api/studio/sewing/hack
//
// Creates a SewingPatternHack row and runs the freesewing draft
// synchronously via the wrapper. Returns the row id plus the terminal
// status (SUCCESS / FAILED) and the rendered SVG on success.
//
// Authenticated users only. Anonymous callers see a sign-in CTA in the
// composer UI before reaching this endpoint. Per the locked sign-in
// carrots: anonymous can browse + tinker, signed-in unlocks save.
//
// Premium gating: the row is created either way. STUDIO_PREMIUM_GATING
// is checked in the Studio UI before the user reaches this endpoint;
// gating is a config flag (default off) so the build phase runs every
// feature free.

import 'server-only'
import { NextResponse } from 'next/server'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { pickFields, type MeasurementsPayload } from '@/lib/sewing/measurements'
import { createHack } from '@/lib/sewing/hack'
import { getDesignConfig } from '@/lib/sewing/grading/design-registry'

interface RequestBody {
  designSlug?: string
  name?: string
  hackOptions?: Record<string, number | string | boolean>
  measurements?: Record<string, unknown>
  measurementsPreference?: 'cm' | 'inches'
  notes?: string
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

  const result = await createHack({
    userId: user.id,
    designSlug,
    name: typeof body.name === 'string' ? body.name.slice(0, 120) : null,
    hackOptions: body.hackOptions ?? {},
    measurements,
    measurementsPreference,
    notes: typeof body.notes === 'string' ? body.notes.slice(0, 1000) : null,
  })

  return NextResponse.json(result, {
    status: result.status === 'FAILED' ? 422 : 200,
  })
}
