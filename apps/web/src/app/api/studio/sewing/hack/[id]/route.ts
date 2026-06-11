// SPDX-License-Identifier: MIT
// GET /api/studio/sewing/hack/[id]
//
// Returns a single SewingPatternHack row for the signed-in owner. Used
// by /me/sewing-hacks and the composer's "load from saved" path.
//
// 404 on unknown id or wrong owner. The wrapper draft is not re-run on
// read; callers re-render from the cached outputSvg or fire a fresh
// draft via /api/studio/sewing/draft.

import 'server-only'
import { NextResponse } from 'next/server'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { getHackForUser } from '@/lib/sewing/hack'

interface RouteCtx {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, ctx: RouteCtx) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
  const { id } = await ctx.params
  const row = await getHackForUser(user.id, id)
  if (!row) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 })
  }
  return NextResponse.json({
    id: row.id,
    name: row.name,
    hackOptions: row.hackOptions,
    measurementsSnapshot: row.measurementsSnapshot,
    measurementsPreferenceSnapshot: row.measurementsPreferenceSnapshot,
    parentPatternSlug: row.parentPattern.slug,
    parentPatternName: row.parentPattern.name,
    freesewingDesignSlug: row.parentPattern.freesewingDesignSlug,
    outputSvg: row.outputSvg,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
    generatedAt: row.generatedAt?.toISOString() ?? null,
    notes: row.notes,
  })
}
