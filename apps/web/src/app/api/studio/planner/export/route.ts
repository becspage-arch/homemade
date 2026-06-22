import { NextResponse } from 'next/server'

import { PlannerCraft } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { listPlannerProjects, getPlannerMaterials } from '@/lib/planner/service'
import { buildPlannerPdf } from '@/lib/planner/pdf'
import { canUsePlanner } from '@/lib/planner/guard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const CRAFTS = new Set<string>(Object.values(PlannerCraft))

const CRAFT_LABEL: Record<string, string> = {
  CROSS_STITCH: 'Cross-stitch',
  CROCHET: 'Crochet',
  KNITTING: 'Knitting',
  NEEDLEWORK: 'Needlework',
  SEWING: 'Sewing',
}

/**
 * GET /api/studio/planner/export?craft=CROSS_STITCH
 *
 * The downloadable, printable plan: project queue + combined materials +
 * shopping list as a clean PDF. Premium (PROJECT_PLANNER_EXPORT).
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
  const craft = craftParam as PlannerCraft

  const [allProjects, materials] = await Promise.all([
    listPlannerProjects(user.id),
    getPlannerMaterials(user.id, craft),
  ])
  const projects = allProjects.filter((p) => p.craft === craft)

  const pdf = await buildPlannerPdf({
    makerName: user.name,
    craftLabel: CRAFT_LABEL[craftParam] ?? 'Project',
    projects,
    materials: materials.rows,
    totals: materials.totals,
    notes: materials.notes,
  })

  const filename = `${craftParam.toLowerCase().replace(/_/g, '-')}-plan.pdf`
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  })
}
