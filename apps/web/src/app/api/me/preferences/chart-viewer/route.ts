import { NextResponse } from 'next/server'
import { prisma, Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface ChartViewerPrefs {
  gridColor?: string
  gridWeightScale?: number
  showCentreLines?: boolean
}

const HEX_RE = /^#[0-9a-f]{6}$/i

/**
 * Read the signed-in user's chart-viewer preferences. Returns an empty
 * object when no row exists or the column is null — the client treats
 * that as "use the built-in defaults". Anonymous users get 401.
 */
export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }
  const prefs = (user.chartViewerPrefs as ChartViewerPrefs | null) ?? {}
  return NextResponse.json(prefs)
}

/**
 * Patch the signed-in user's chart-viewer preferences. Only validated
 * keys make it into the column.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  let body: ChartViewerPrefs
  try {
    body = (await req.json()) as ChartViewerPrefs
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const next: ChartViewerPrefs = {
    ...((user.chartViewerPrefs as ChartViewerPrefs | null) ?? {}),
  }
  if (typeof body.gridColor === 'string' && HEX_RE.test(body.gridColor)) {
    next.gridColor = body.gridColor
  } else if (body.gridColor === null) {
    delete next.gridColor
  }
  if (
    typeof body.gridWeightScale === 'number' &&
    body.gridWeightScale >= 0.5 &&
    body.gridWeightScale <= 2
  ) {
    next.gridWeightScale = body.gridWeightScale
  }
  if (typeof body.showCentreLines === 'boolean') {
    next.showCentreLines = body.showCentreLines
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { chartViewerPrefs: next as Prisma.InputJsonValue },
  })

  return NextResponse.json(next)
}
