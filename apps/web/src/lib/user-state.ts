import 'server-only'
import { prisma, UserProjectStatus, type UserProject } from '@homemade/db'

/**
 * Per-tutorial state for the signed-in reader. Used by tutorial cards and
 * tutorial pages to render saved / in-progress indicators without refetching
 * once per card.
 */
export interface ReaderTutorialState {
  bookmarked: boolean
  projectStatus: UserProjectStatus | null
  projectId: string | null
  projectProgressPercent: number | null
}

export type ReaderStateMap = Map<string, ReaderTutorialState>

/**
 * Empty state — used when no user is signed in. Returns a `Map` that always
 * yields false / null so call sites don't have to null-check.
 */
export function emptyReaderState(): ReaderStateMap {
  return new Map()
}

export function readerStateFor(
  map: ReaderStateMap,
  tutorialId: string,
): ReaderTutorialState {
  return (
    map.get(tutorialId) ?? {
      bookmarked: false,
      projectStatus: null,
      projectId: null,
      projectProgressPercent: null,
    }
  )
}

/**
 * Single batched query for the signed-in reader's bookmark + project state on
 * every tutorial in `tutorialIds`. Two queries, regardless of how many
 * tutorials are on the page.
 */
export async function loadReaderState(
  userId: string | null | undefined,
  tutorialIds: string[],
): Promise<ReaderStateMap> {
  if (!userId || tutorialIds.length === 0) return emptyReaderState()

  const [bookmarks, projects] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId, tutorialId: { in: tutorialIds } },
      select: { tutorialId: true },
    }),
    prisma.userProject.findMany({
      where: { userId, tutorialId: { in: tutorialIds } },
      select: {
        id: true,
        tutorialId: true,
        status: true,
        readingProgressPercent: true,
      },
    }),
  ])

  const map: ReaderStateMap = new Map()
  for (const id of tutorialIds) {
    map.set(id, {
      bookmarked: false,
      projectStatus: null,
      projectId: null,
      projectProgressPercent: null,
    })
  }
  for (const b of bookmarks) {
    const cur = map.get(b.tutorialId)
    if (cur) cur.bookmarked = true
  }
  for (const p of projects) {
    const cur = map.get(p.tutorialId)
    if (cur) {
      cur.projectStatus = p.status
      cur.projectId = p.id
      cur.projectProgressPercent = p.readingProgressPercent
    }
  }
  return map
}

/**
 * Counts shown on the /me dashboard. Two cheap counts plus one count grouped
 * by project status.
 */
export async function getReaderCounts(userId: string): Promise<{
  bookmarks: number
  inProgress: number
  completed: number
  abandoned: number
}> {
  const [bookmarks, statusCounts] = await Promise.all([
    prisma.bookmark.count({ where: { userId } }),
    prisma.userProject.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    }),
  ])
  const by: Record<UserProjectStatus, number> = {
    IN_PROGRESS: 0,
    COMPLETED: 0,
    ABANDONED: 0,
  }
  for (const row of statusCounts) {
    by[row.status] = row._count._all
  }
  return {
    bookmarks,
    inProgress: by.IN_PROGRESS,
    completed: by.COMPLETED,
    abandoned: by.ABANDONED,
  }
}

/**
 * Most recently viewed IN_PROGRESS projects for the "Continue making" strip on
 * both the home page and the /me dashboard.
 */
export async function getContinueMaking(
  userId: string,
  limit = 3,
): Promise<UserProject[]> {
  return prisma.userProject.findMany({
    where: { userId, status: UserProjectStatus.IN_PROGRESS },
    orderBy: { lastViewedAt: 'desc' },
    take: limit,
  })
}
