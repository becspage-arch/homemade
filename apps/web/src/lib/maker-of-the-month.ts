import 'server-only'
import { prisma } from '@homemade/db'

export interface MakerOfTheMonthTile {
  id: string
  userId: string
  monthStart: Date
  monthEnd: Date
  featuredReason: string
  user: {
    name: string | null
    displayHandle: string | null
    bio: string | null
    isPublicMakerProfile: boolean
    makerHeaderImage: {
      cloudflareId: string | null
      r2Key: string | null
    } | null
  }
}

/**
 * The currently-active Maker of the Month, or null if there isn't one this
 * month. Active = (monthStart <= now() <= monthEnd) AND the featured Maker
 * still has a public profile + a handle (defensive — admin can clear those
 * after picking).
 */
export async function loadActiveMakerOfTheMonth(): Promise<MakerOfTheMonthTile | null> {
  const now = new Date()
  const row = await prisma.makerOfTheMonth.findFirst({
    where: {
      monthStart: { lte: now },
      monthEnd: { gte: now },
    },
    orderBy: { monthStart: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          displayHandle: true,
          bio: true,
          isPublicMakerProfile: true,
          makerHeaderImage: { select: { cloudflareId: true, r2Key: true } },
        },
      },
    },
  })
  if (!row) return null
  if (!row.user.isPublicMakerProfile) return null
  if (!row.user.displayHandle) return null
  return row
}

export async function listMakerOfTheMonthEntries(opts: {
  limit?: number
} = {}): Promise<MakerOfTheMonthTile[]> {
  const limit = opts.limit ?? 24
  const rows = await prisma.makerOfTheMonth.findMany({
    orderBy: { monthStart: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          displayHandle: true,
          bio: true,
          isPublicMakerProfile: true,
          makerHeaderImage: { select: { cloudflareId: true, r2Key: true } },
        },
      },
    },
  })
  return rows
}

/**
 * Returns whether the Maker `userId` is the current month's pick. Used by
 * the public profile page to render the badge. Returns null when this
 * Maker is not the current pick, or when there is no current pick at all.
 */
export async function currentMonthBadgeFor(
  userId: string,
): Promise<{ monthStart: Date; monthEnd: Date } | null> {
  const now = new Date()
  const row = await prisma.makerOfTheMonth.findFirst({
    where: {
      userId,
      monthStart: { lte: now },
      monthEnd: { gte: now },
    },
    select: { monthStart: true, monthEnd: true },
  })
  return row
}
