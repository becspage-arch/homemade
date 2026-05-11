import Link from 'next/link'
import { prisma } from '@homemade/db'

export async function SiteHeader() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { slug: true, name: true },
  })

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
      </div>
    </header>
  )
}
