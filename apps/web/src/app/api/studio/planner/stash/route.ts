import { NextResponse } from 'next/server'

import { prisma, PlannerCraft } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { listPlannerStash } from '@/lib/planner/service'
import { flossDetails } from '@/lib/floss/stash-ownership'

export const dynamic = 'force-dynamic'

const CRAFTS = new Set<string>(Object.values(PlannerCraft))

/**
 * The maker's materials stash for a craft — what they already own, counted
 * against project needs so the shopping list shows only what's left to buy.
 *
 *   GET  /api/studio/planner/stash?craft=CROSS_STITCH
 *   POST /api/studio/planner/stash
 *
 * Free for any signed-in maker. Keeping a stash is the free half of the deal:
 * the pattern page counts a chart's palette against it, the library card shows
 * "22 of 28 owned", and the Studio floss key ticks the colours already in the
 * drawer. The premium half stays where it was, in the planner: the cross-
 * project materials roll-up and the printable shopping list.
 */

interface PostBody {
  craft?: string
  brand?: string | null
  code?: string | null
  name?: string | null
  colourRgb?: string | null
  quantityOwned?: number
  unit?: string
  notes?: string | null
}

export async function GET(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const craftParam = url.searchParams.get('craft') ?? 'CROSS_STITCH'
  if (!CRAFTS.has(craftParam)) {
    return NextResponse.json({ error: 'unknown craft' }, { status: 400 })
  }
  const entries = await listPlannerStash(user.id, craftParam as PlannerCraft)
  return NextResponse.json({ entries })
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

  const craft = body.craft ?? 'CROSS_STITCH'
  if (!CRAFTS.has(craft)) {
    return NextResponse.json({ error: 'unknown craft' }, { status: 400 })
  }
  // A stash item needs at least an identity — a code or a name.
  const brand = clean(body.brand)
  const code = clean(body.code)
  const name = clean(body.name)
  if (!code && !name) {
    return NextResponse.json({ error: 'code or name required' }, { status: 400 })
  }

  const quantityOwned =
    typeof body.quantityOwned === 'number' && body.quantityOwned >= 0
      ? body.quantityOwned
      : 1

  // Fill the shade name and the swatch from the embedded floss tables when the
  // caller sent only a code, so the stash list reads like a floss key rather
  // than a column of numbers.
  const details = flossDetails(brand, code)
  const resolvedName = name ?? details?.name ?? null
  const resolvedRgb = clean(body.colourRgb) ?? details?.rgb ?? null

  try {
    const row = await prisma.plannerStashItem.upsert({
      where: {
        userId_craft_brand_code: {
          userId: user.id,
          craft: craft as PlannerCraft,
          brand: brand ?? '',
          code: code ?? '',
        },
      },
      // Re-adding a colour already owned tops up rather than erroring.
      update: {
        quantityOwned,
        name: resolvedName ?? undefined,
        colourRgb: resolvedRgb ?? undefined,
        notes: clean(body.notes) ?? undefined,
        archivedAt: null,
      },
      create: {
        userId: user.id,
        craft: craft as PlannerCraft,
        brand: brand ?? '',
        code: code ?? '',
        name: resolvedName,
        colourRgb: resolvedRgb,
        quantityOwned,
        unit: clean(body.unit) ?? 'skein',
        notes: clean(body.notes),
      },
      select: { id: true },
    })
    return NextResponse.json({ id: row.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'could not save' }, { status: 500 })
  }
}

function clean(s: string | null | undefined): string | null {
  if (typeof s !== 'string') return null
  const t = s.trim()
  return t.length > 0 ? t : null
}
