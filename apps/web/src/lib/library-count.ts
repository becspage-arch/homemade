import 'server-only'
import { prisma, TutorialStatus, Visibility } from '@homemade/db'

/**
 * Live count of everything published that a member can actually reach.
 *
 * Published tutorials + public house-owned patterns (ownerUserId null), but
 * scoped to publicly-visible (signed-off) categories only. Hidden categories
 * 404 to the public, so counting their content would over-claim the library on
 * /premium. Pulled at render so the page never hardcodes the figure.
 */
export async function countPublishedLibrary(): Promise<number> {
  const [tutorials, patterns] = await Promise.all([
    prisma.tutorial.count({
      where: {
        status: TutorialStatus.PUBLISHED,
        category: { isPublicVisible: true },
      },
    }),
    prisma.pattern.count({
      where: {
        visibility: Visibility.PUBLIC,
        ownerUserId: null,
        subCategory: { category: { isPublicVisible: true } },
      },
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
