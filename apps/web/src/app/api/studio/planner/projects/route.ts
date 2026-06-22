import { NextResponse } from 'next/server'

import { prisma, PlannerCraft, Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { listPlannerProjects } from '@/lib/planner/service'
import { getMaterialsProvider } from '@/lib/planner/registry'

export const dynamic = 'force-dynamic'

/**
 * The maker's planner project queue.
 *
 *   GET  /api/studio/planner/projects  — list the signed-in maker's projects.
 *   POST /api/studio/planner/projects  — add a pattern to the plan.
 *
 * Adding to and ordering the queue is a FREE signed-in carrot (like saving):
 * these routes only require sign-in. The premium parts (materials roll-up,
 * stash, export) live on their own routes and gate there.
 */

const CRAFTS = new Set<string>(Object.values(PlannerCraft))

interface PostBody {
  craft?: string
  patternId?: string
  settings?: Record<string, unknown>
  notes?: string | null
}

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const projects = await listPlannerProjects(user.id)
  return NextResponse.json({ projects })
}

export async function POST(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: PostBody
  try {
    body = (await request.json()) as PostBody
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const craft = body.craft
  if (!craft || !CRAFTS.has(craft)) {
    return NextResponse.json({ error: 'unknown craft' }, { status: 400 })
  }
  if (!body.patternId || typeof body.patternId !== 'string') {
    return NextResponse.json({ error: 'patternId required' }, { status: 400 })
  }

  // Confirm the pattern resolves for this maker before queueing it, so a
  // project never points at a pattern they can't see.
  const provider = getMaterialsProvider(craft as PlannerCraft)
  if (provider) {
    const meta = await provider.getPatternMeta({
      craft: craft as PlannerCraft,
      patternId: body.patternId,
      viewerUserId: user.id,
    })
    if (!meta) {
      return NextResponse.json({ error: 'pattern not found' }, { status: 404 })
    }
  }

  // New projects go to the back of the queue.
  const last = await prisma.plannerProject.findFirst({
    where: { userId: user.id, craft: craft as PlannerCraft },
    orderBy: { position: 'desc' },
    select: { position: true },
  })
  const position = (last?.position ?? -1) + 1

  try {
    const row = await prisma.plannerProject.create({
      data: {
        userId: user.id,
        craft: craft as PlannerCraft,
        patternId: body.patternId,
        position,
        notes: typeof body.notes === 'string' ? body.notes : null,
        settings:
          body.settings && typeof body.settings === 'object'
            ? (body.settings as Prisma.InputJsonValue)
            : {},
      },
      select: { id: true },
    })
    return NextResponse.json({ id: row.id }, { status: 201 })
  } catch (err) {
    // Unique (userId, craft, patternId): already in the plan.
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      return NextResponse.json({ error: 'already in plan' }, { status: 409 })
    }
    throw err
  }
}
