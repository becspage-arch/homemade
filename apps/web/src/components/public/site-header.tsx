import Link from 'next/link'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { UserMenu } from './user-menu'
import { CategoryMenu } from './category-menu'

export async function SiteHeader() {
  const [categories, dbUser] = await Promise.all([
    prisma.category.findMany({
      where: { isPublicVisible: true },
      orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: {
        slug: true,
        name: true,
        archetype: true,
        subCategories: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
          select: { slug: true, name: true },
        },
      },
    }),
    getCurrentDbUser(),
  ])

  const all = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    archetype: c.archetype,
    subCategories: c.subCategories,
  }))

  const greeting = dbUser?.name?.split(' ')[0] ?? null
  const initial =
    (dbUser?.name?.trim()?.[0] ?? dbUser?.email?.trim()?.[0] ?? 'h').toUpperCase()

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-header-wordmark">
          homemade
        </Link>

        {categories.length > 0 && <CategoryMenu all={all} />}

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
