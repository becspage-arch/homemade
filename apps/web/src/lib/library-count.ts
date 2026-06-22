import 'server-only'
import { prisma, TutorialStatus, Visibility } from '@homemade/db'

/**
 * Live count of everything published across the whole library.
 *
 * Same definition the admin dashboard uses for "real library total":
 * published tutorials + public house-owned patterns (ownerUserId null). Pulled
 * at render so the /premium page never hardcodes the figure.
 */
export async function countPublishedLibrary(): Promise<number> {
  const [tutorials, patterns] = await Promise.all([
    prisma.tutorial.count({ where: { status: TutorialStatus.PUBLISHED } }),
    prisma.pattern.count({
      where: { visibility: Visibility.PUBLIC, ownerUserId: null },
    }),
  ])
  return tutorials + patterns
}

/**
 * Format a library count as a rounded-down "9,400+" style label. Rounds down to
 * the nearest hundred so the figure is always honest (never claims more than is
 * live). Falls back to the raw number under 100.
 */
export function formatLibraryCount(n: number): string {
  if (n < 100) return String(n)
  const floored = Math.floor(n / 100) * 100
  return `${floored.toLocaleString('en-GB')}+`
}
