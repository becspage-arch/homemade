import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Server-side shopping-list state for signed-in Makers. Free sign-in carrot:
 * the same working list anonymous Makers keep in localStorage, persisted so it
 * follows them across devices. Anonymous callers get 401 and the client falls
 * back to localStorage.
 */
export async function GET(): Promise<Response> {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'signed-out' }, { status: 401 })

  const state = await prisma.shoppingListState.findUnique({
    where: { userId: user.id },
    select: { recipeSlugs: true, tickedIngredientIds: true },
  })
  return NextResponse.json({
    recipeSlugs: state?.recipeSlugs ?? [],
    tickedIngredientIds: state?.tickedIngredientIds ?? [],
  })
}

function cleanStrings(value: unknown, cap: number): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const s = item.trim()
    if (!s || seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= cap) break
  }
  return out
}

export async function PUT(request: Request): Promise<Response> {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'signed-out' }, { status: 401 })

  let body: { recipeSlugs?: unknown; tickedIngredientIds?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 })
  }

  // Partial update: the add-to-list button owns recipeSlugs, the list view owns
  // tickedIngredientIds. Only overwrite a field the caller actually sent, so the
  // two surfaces never clobber each other.
  const existing = await prisma.shoppingListState.findUnique({
    where: { userId: user.id },
    select: { recipeSlugs: true, tickedIngredientIds: true },
  })

  const recipeSlugs =
    body.recipeSlugs !== undefined ? cleanStrings(body.recipeSlugs, 200) : existing?.recipeSlugs ?? []
  const tickedIngredientIds =
    body.tickedIngredientIds !== undefined
      ? cleanStrings(body.tickedIngredientIds, 1000)
      : existing?.tickedIngredientIds ?? []

  await prisma.shoppingListState.upsert({
    where: { userId: user.id },
    create: { userId: user.id, recipeSlugs, tickedIngredientIds },
    update: { recipeSlugs, tickedIngredientIds },
  })

  return NextResponse.json({ ok: true })
}
