import type { Metadata } from 'next'
import { prisma, parsePatternData, type PatternData, PatternType, Visibility } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium, isPremiumContent } from '@/lib/entitlements'
import { StudioShell } from '@/components/studio/shell/StudioShell'
import { StudioAuthGate } from '@/components/premium/StudioAuthGate'
import { StudioPremiumGate } from '@/components/premium/StudioPremiumGate'
import { patternHeroUrl } from '@/lib/studio/pattern-hero'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cross-stitch Studio · homemade',
  description: 'Stitch a pattern. Make your own. Start from a photo.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{
    patternId?: string
    new?: 'blank' | 'photo' | 'idea'
    progress?: 'local' | 'server'
  }>
}

/**
 * /studio/cross-stitch — the single cross-stitch Studio route.
 *
 * State is derived from the URL query, not the path. The shell decides
 * which surface to render based on (signed-in?, ?patternId, ?new=…):
 *
 *   no patternId, no ?new            → empty state (sign-in hero or "Your patterns")
 *   patternId=…                      → load that pattern + render the Studio
 *   ?new=blank                       → blank-canvas dialog
 *   ?new=photo                       → photo-to-chart panel (premium)
 *   ?new=idea                        → describe-an-idea panel (premium)
 *
 * Library patterns load read-only until the user makes their first edit;
 * the silent-fork path then swaps `patternId` for the new fork's id.
 */
export default async function CrossStitchStudioPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const user = await getCurrentDbUser()
  const premium = hasPremium(user)

  // The Studio is a free signed-in surface (an auth gate, NOT a paywall).
  // Anonymous visitors can browse the library and see the Studio's front door,
  // but opening a working surface — a pattern, a blank canvas, photo-to-chart —
  // needs a free account. Content viewing on /cross-stitch/patterns stays open.
  const wantsWorkingSurface =
    Boolean(sp.patternId) || sp.new === 'blank' || sp.new === 'photo' || sp.new === 'idea'
  if (!user && wantsWorkingSurface) {
    const q = new URLSearchParams()
    if (sp.patternId) q.set('patternId', sp.patternId)
    if (sp.new) q.set('new', sp.new)
    const returnTo = `/studio/cross-stitch${q.toString() ? `?${q.toString()}` : ''}`
    return <StudioAuthGate craftLabel="the cross-stitch Studio" returnTo={returnTo} />
  }

  let pattern: { id: string; name: string; data: PatternData; ownerUserId: string | null } | null = null
  let stitchedKeys: string[] = []

  if (sp.patternId) {
    const row = await prisma.pattern.findUnique({
      where: { id: sp.patternId },
      select: {
        id: true,
        name: true,
        data: true,
        ownerUserId: true,
        visibility: true,
        premium: true,
        designer: { select: { isHouseDesigner: true } },
      },
    })
    if (row) {
      const isOwned = user && row.ownerUserId === user.id
      const isLibrary =
        row.ownerUserId === null &&
        (row.visibility === Visibility.PUBLIC || row.visibility === Visibility.UNLISTED)
      // Premium-content access gate: opening a library premium (independent-
      // designer) pattern in the Studio needs premium. Owners always reach
      // their own patterns; free + house library patterns open straight in.
      if (
        isLibrary &&
        !isOwned &&
        isPremiumContent({ premium: row.premium, designer: row.designer }) &&
        !premium
      ) {
        return (
          <StudioPremiumGate
            craftLabel={row.name}
            browseHref="/cross-stitch"
            browseLabel="Or keep browsing the library"
          />
        )
      }
      if (isOwned || isLibrary) {
        try {
          const parsed = parsePatternData(row.data)
          pattern = { id: row.id, name: row.name, data: parsed, ownerUserId: row.ownerUserId }
        } catch {
          // Malformed JSON — fall through to empty state; user will see the
          // empty-state hero with a "this pattern failed to load" note.
        }
      }
    }
    if (pattern && user) {
      const prog = await prisma.userPatternProgress.findUnique({
        where: { userId_patternId: { userId: user.id, patternId: pattern.id } },
        select: { stitchedCells: true },
      })
      if (prog?.stitchedCells && typeof prog.stitchedCells === 'object') {
        stitchedKeys = Object.keys(prog.stitchedCells as Record<string, true>)
      }
    }
  }

  let myPatterns: Array<{
    id: string
    name: string
    updatedAt: Date
    widthCells: number
    heightCells: number
    colourCount: number
  }> = []
  if (user && !pattern) {
    myPatterns = await prisma.pattern.findMany({
      where: { ownerUserId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 24,
      select: {
        id: true,
        name: true,
        updatedAt: true,
        widthCells: true,
        heightCells: true,
        colourCount: true,
      },
    })
  }

  // Recently added to the library - shown on the Studio landing as a
  // taste of what's been published lately, with a link back to the full
  // library on /cross-stitch. Always rendered when there's published
  // pattern data, regardless of sign-in state.
  const recentlyAddedRows = pattern
    ? []
    : await prisma.pattern.findMany({
        where: {
          ownerUserId: null,
          visibility: Visibility.PUBLIC,
          publishedAt: { not: null },
          type: PatternType.CROSS_STITCH,
        },
        orderBy: { publishedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          slug: true,
          name: true,
          hero: { select: { cloudflareId: true, r2Key: true } },
        },
      })
  const recentlyAdded = recentlyAddedRows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    thumbnailUrl: patternHeroUrl({ id: p.id, hero: p.hero }, 'card'),
  }))

  const startMode: 'empty' | 'pattern' | 'new-blank' | 'new-photo' | 'new-idea' = pattern
    ? 'pattern'
    : sp.new === 'blank'
    ? 'new-blank'
    : sp.new === 'photo'
    ? 'new-photo'
    : sp.new === 'idea'
    ? 'new-idea'
    : 'empty'

  return (
    <StudioShell
      startMode={startMode}
      signedIn={Boolean(user)}
      isPremium={premium}
      userEmail={user?.email ?? null}
      userName={user?.name ?? null}
      pattern={pattern}
      stitchedKeys={stitchedKeys}
      myPatterns={myPatterns.map((p) => ({
        id: p.id,
        name: p.name,
        updatedAt: p.updatedAt.toISOString(),
        widthCells: p.widthCells,
        heightCells: p.heightCells,
        colourCount: p.colourCount,
      }))}
      recentlyAdded={recentlyAdded}
    />
  )
}

