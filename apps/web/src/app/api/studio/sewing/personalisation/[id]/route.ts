// SPDX-License-Identifier: MIT
// GET /api/studio/sewing/personalisation/[id]
//
// Polls a SewingPatternPersonalisation row's status. Returns the SVG +
// cacheKey once the draft completes. Ownership is enforced — a user can
// only read their own personalisation rows.
//
// The Studio polls this from step 3 so a slow freesewing draft (or a
// freesewing version bump invalidating the cache) does not block the
// preview surface from rendering its skeleton state.

import 'server-only'
import { NextResponse } from 'next/server'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { getPersonalisation } from '@/lib/sewing/personalisation'
import { getDrafterFooterCredit } from '@/lib/sewing/grading/attribution'
import type { CalibrationMode } from '@/lib/sewing/grading/types'

interface RouteCtx {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, ctx: RouteCtx) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { id } = await ctx.params
  const row = await getPersonalisation(id)
  if (!row || row.userId !== user.id) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 })
  }

  const designSlug = row.pattern?.freesewingDesignSlug ?? null
  const attribution =
    designSlug != null
      ? getDrafterFooterCredit(designSlug, 'BROWSE' satisfies CalibrationMode)
      : row.pattern?.attributionText ?? null

  return NextResponse.json({
    id: row.id,
    status: row.status,
    svg: row.outputSvg,
    cacheKey: row.outputCacheKey,
    attribution,
    errorMessage: row.errorMessage,
    generatedAt: row.generatedAt?.toISOString() ?? null,
    projectId: row.projectId,
    pattern: row.pattern,
  })
}
