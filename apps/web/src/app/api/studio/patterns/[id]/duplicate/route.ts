import { NextResponse } from 'next/server'
import {
  prisma,
  parsePatternData,
  computePatternMetrics,
  Visibility,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

interface Ctx {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, ctx: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { id } = await ctx.params
  const source = await prisma.pattern.findUnique({ where: { id } })
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const isLibrary = source.ownerUserId === null && source.visibility !== Visibility.PRIVATE
  if (source.ownerUserId !== user.id && !isLibrary) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  }

  const data = parsePatternData(source.data)
  const metrics = computePatternMetrics(data)
  const dup = await prisma.pattern.create({
    data: {
      type: source.type,
      name: `${source.name} (copy)`,
      data: data as unknown as object,
      ownerUserId: user.id,
      visibility: Visibility.PRIVATE,
      forkedFromId: source.id,
      designerId: source.designerId,
      subCategoryId: source.subCategoryId,
      difficulty: source.difficulty,
      estimatedHours: source.estimatedHours,
      widthCells: metrics.widthCells,
      heightCells: metrics.heightCells,
      colourCount: metrics.colourCount,
      totalStitches: metrics.totalStitches,
      hasBackstitch: metrics.hasBackstitch,
      hasFrenchKnots: metrics.hasFrenchKnots,
      hasBeads: metrics.hasBeads,
      hasQuarterStitches: metrics.hasQuarterStitches,
      fabricCountSuggested: data.fabric.count,
    },
    select: { id: true },
  })
  return NextResponse.json({ id: dup.id }, { status: 201 })
}
