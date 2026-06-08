import { NextResponse } from 'next/server'
import { prisma, type Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

/**
 * Crochet stash — user-managed list of yarns and hooks owned.
 *
 *   GET    /api/me/crochet-stash
 *     -> { yarns: StashYarn[], hooks: StashHook[] }
 *
 *   POST   /api/me/crochet-stash/yarns
 *     body: { label, weightSlug?, yardage?, colourHex?, colourName?,
 *             leftoverYardage?, notes? }
 *     -> the appended yarn entry
 *
 *   DELETE /api/me/crochet-stash/yarns/[id]
 *     -> removes the yarn entry
 *
 *   POST   /api/me/crochet-stash/hooks
 *     body: { slug }
 *     -> adds the hook to the user's collection
 *
 *   DELETE /api/me/crochet-stash/hooks/[slug]
 */

interface StashYarn {
  id: string
  label: string
  weightSlug?: string
  yardage?: number
  colourHex?: string
  colourName?: string
  leftoverYardage?: number
  notes?: string
}

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const yarns = parseYarns(user.myYarns)
  const hookSlugs = Array.isArray(user.myHooks) ? user.myHooks : []

  const hookRows = await prisma.crochetHook.findMany({
    where: { slug: { in: hookSlugs } },
    select: { slug: true, canonicalName: true, mmSize: true, ukSize: true, usSize: true },
    orderBy: { mmSize: 'asc' },
  })

  return NextResponse.json({
    yarns,
    hooks: hookRows,
  })
}

function parseYarns(raw: Prisma.JsonValue | null | undefined): StashYarn[] {
  if (!Array.isArray(raw)) return []
  const out: StashYarn[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    if (typeof obj.id !== 'string' || typeof obj.label !== 'string') continue
    out.push({
      id: obj.id,
      label: obj.label,
      weightSlug: typeof obj.weightSlug === 'string' ? obj.weightSlug : undefined,
      yardage: typeof obj.yardage === 'number' ? obj.yardage : undefined,
      colourHex: typeof obj.colourHex === 'string' ? obj.colourHex : undefined,
      colourName: typeof obj.colourName === 'string' ? obj.colourName : undefined,
      leftoverYardage: typeof obj.leftoverYardage === 'number' ? obj.leftoverYardage : undefined,
      notes: typeof obj.notes === 'string' ? obj.notes : undefined,
    })
  }
  return out
}
