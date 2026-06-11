// SPDX-License-Identifier: MIT
// POST /api/studio/sewing/personalisation/[id]/save-project
//
// Promotes a SUCCESS personalisation row into a SewingPatternProject so
// it lands in the user's My Projects. Idempotent: a second call returns
// the same projectId.

import 'server-only'
import { NextResponse } from 'next/server'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { attachToProject } from '@/lib/sewing/personalisation'

interface RouteCtx {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, ctx: RouteCtx) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { id } = await ctx.params
  try {
    const result = await attachToProject(user.id, id)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown'
    if (message === 'personalisation not found') {
      return NextResponse.json({ error: 'not-found' }, { status: 404 })
    }
    if (message === 'personalisation not ready') {
      return NextResponse.json(
        { error: 'not-ready', message: 'Wait for the draft to finish.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
