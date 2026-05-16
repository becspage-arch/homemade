/**
 * Auto-flip the `Category.isPublicVisible` flag once a category crosses
 * `PUBLIC_VISIBILITY_THRESHOLD` published tutorials. Idempotent — safe to
 * call from any publish-transition path.
 *
 * The first 10 tutorials in a new category act as a private-beta backlog;
 * the category appears in public nav only when there's enough content for
 * a category page that doesn't read empty.
 */

import type { PrismaClient } from '@prisma/client'

export const PUBLIC_VISIBILITY_THRESHOLD = 10

export async function maybeFlipCategoryVisibility(
  prisma: PrismaClient,
  categoryId: string,
): Promise<{ flipped: boolean; publishedCount: number; isPublicVisible: boolean }> {
  const [category, publishedCount] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, slug: true, isPublicVisible: true },
    }),
    prisma.tutorial.count({
      where: { categoryId, status: 'PUBLISHED' },
    }),
  ])

  if (!category) {
    return { flipped: false, publishedCount: 0, isPublicVisible: false }
  }

  if (category.isPublicVisible) {
    // Already visible — never auto-unflip. Admin can flip back manually if
    // they need to take a category private.
    return { flipped: false, publishedCount, isPublicVisible: true }
  }

  if (publishedCount < PUBLIC_VISIBILITY_THRESHOLD) {
    return { flipped: false, publishedCount, isPublicVisible: false }
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { isPublicVisible: true },
  })
  return { flipped: true, publishedCount, isPublicVisible: true }
}
