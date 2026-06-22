import { NextResponse } from 'next/server'

import { PlannerCraft } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { getPlannerMaterials } from '@/lib/planner/service'
import { canUsePlanner } from '@/lib/planner/guard'

export const dynamic = 'force-dynamic'

const CRAFTS = new Set<string>(Object.values(PlannerCraft))

/**
 * GET /api/studio/planner/materials?craft=CROSS_STITCH[&projectId=…]
 *
 * The premium roll-up: every floss colour needed across the maker's active
 * projects, combined, with the stash subtracted into a shopping list. Premium
 * (PROJECT_PLANNER) — gated at the call site.
 */
export async function GET(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (!canUsePlanner(user)) {
    return NextResponse.json({ error: 'premium_required' }, { status: 403 })
  }

  const url = new URL(request.url)
  const craftParam = url.searchParams.get('craft') ?? 'CROSS_STITCH'
  if (!CRAFTS.has(craftParam)) {
    return NextResponse.json({ error: 'unknown craft' }, { status: 400 })
  }
  const projectId = url.searchParams.get('projectId') ?? undefined

  const materials = await getPlannerMaterials(user.id, craftParam as PlannerCraft, {
    projectId,
  })
  return NextResponse.json(materials)
}
