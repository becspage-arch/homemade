import Link from 'next/link'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { UserMenu } from './user-menu'

export async function SiteHeader() {
  // `getCurrentDbUser` is React-cached so when a page below also calls it
  // (every tutorial / category / /me page does) the lookup is shared.
  const [categories, dbUser] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: { slug: true, name: true },
    }),
    getCurrentDbUser(),
  ])

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
          <nav className="site-header-nav" aria-label="Categories">
            {categories.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </nav>
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
            placeholder="Search"
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
