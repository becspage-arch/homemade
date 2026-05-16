import Link from 'next/link'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { UserMenu } from './user-menu'
import { CategoryMenu } from './category-menu'

/**
 * Locked spine-category slugs for the top-level desktop nav. The first
 * five categories the homepage rebuild promotes to header-level. Anything
 * else slides into the "All categories" overflow.
 */
const SPINE_CATEGORY_SLUGS = [
  'cooking',
  'baking',
  'garden',
  'mindset',
  'herbal',
  'herbal-medicine',
]

export async function SiteHeader() {
  const [categories, dbUser] = await Promise.all([
    prisma.category.findMany({
      where: { isPublicVisible: true },
      orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: { slug: true, name: true },
    }),
    getCurrentDbUser(),
  ])

  // The five spine items keep their canonical order even if `Category.order`
  // disagrees. Everything else falls into "All categories" as already sorted.
  const spine: { slug: string; name: string }[] = []
  for (const slug of SPINE_CATEGORY_SLUGS) {
    const match = categories.find((c) => c.slug === slug)
    if (match && !spine.some((s) => s.slug === match.slug)) {
      spine.push({ slug: match.slug, name: match.name })
    }
    if (spine.length === 5) break
  }
  const otherCategories = categories.filter(
    (c) => !spine.some((s) => s.slug === c.slug),
  )

  const greeting = dbUser?.name?.split(' ')[0] ?? null
  const initial =
    (dbUser?.name?.trim()?.[0] ?? dbUser?.email?.trim()?.[0] ?? 'h').toUpperCase()

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-header-wordmark">
          homemade
        </Link>

        {categories.length > 0 && (
          <CategoryMenu spine={spine} other={otherCategories} />
        )}

        <form
          method="GET"
          action="/search"
          className="site-header-search"
          role="search"
        >
          <label className="visually-hidden" htmlFor="site-search-q">
            Search the site
          </label>
          <input
            id="site-search-q"
            type="search"
            name="q"
            placeholder="What are you making?"
            aria-label="Search"
            className="site-header-search-input"
          />
        </form>

        <div className="site-header-user">
          {dbUser ? (
            <UserMenu initial={initial} greeting={greeting} />
          ) : (
            <Link href="/sign-in" className="site-header-signin">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
