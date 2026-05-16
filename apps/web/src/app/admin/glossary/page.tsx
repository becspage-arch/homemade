import Link from 'next/link'
import { prisma, type Prisma } from '@homemade/db'

import './glossary.css'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
  }>
}

export default async function GlossaryIndexPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = (params.q ?? '').trim()
  const categoryFilter = (params.category ?? '').trim()
  const pageNum = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const skip = (pageNum - 1) * PAGE_SIZE

  const where: Prisma.GlossaryTermWhereInput = {}
  if (q) {
    where.OR = [
      { term: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
      { definition: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (categoryFilter === '_none') {
    where.categoryId = null
  } else if (categoryFilter) {
    where.categoryId = categoryFilter
  }

  const [terms, total, categories] = await Promise.all([
    prisma.glossaryTerm.findMany({
      where,
      orderBy: { term: 'asc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.glossaryTerm.count({ where }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

  return (
    <div className="glossary-page">
      <header className="glossary-header">
        <div>
          <h1>Glossary</h1>
          <p className="glossary-subtitle">
            Inline tooltip source. Words like &ldquo;roux&rdquo; or &ldquo;blind
            bake&rdquo; defined once here, then attached to tutorial bodies via
            the editor&apos;s glossary tooltip mark.
          </p>
        </div>
        <Link href="/admin/glossary/new" className="glossary-new">
          + new term
        </Link>
      </header>

      <form className="glossary-filters" method="GET" action="/admin/glossary">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search term, slug, or definition"
          className="glossary-search"
        />
        <select name="category" defaultValue={categoryFilter} className="glossary-select">
          <option value="">All categories</option>
          <option value="_none">Cross-category (no parent)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="glossary-apply">
          Apply
        </button>
        {(q || categoryFilter) && (
          <Link href="/admin/glossary" className="glossary-clear">
            clear
          </Link>
        )}
      </form>

      <p className="glossary-summary">
        {total === 0
          ? 'No glossary terms match the current filter.'
          : `Showing ${skip + 1}–${Math.min(skip + terms.length, total)} of ${total.toLocaleString('en-GB')}`}
      </p>

      {terms.length > 0 && (
        <table className="glossary-table">
          <thead>
            <tr>
              <th>Term</th>
              <th>Slug</th>
              <th>Definition</th>
              <th>Category</th>
              <th aria-label="Edit" />
            </tr>
          </thead>
          <tbody>
            {terms.map((t) => (
              <tr key={t.id}>
                <td className="glossary-term">{t.term}</td>
                <td>
                  <code className="glossary-slug">{t.slug}</code>
                </td>
                <td className="glossary-def">{t.definition}</td>
                <td>
                  {t.categoryId ? (
                    <span>{categoryNameById.get(t.categoryId) ?? '—'}</span>
                  ) : (
                    <span className="glossary-cross">cross-category</span>
                  )}
                </td>
                <td>
                  <Link href={`/admin/glossary/${t.id}`} className="glossary-edit">
                    edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pageCount > 1 && (
        <nav className="glossary-pagination" aria-label="Glossary pages">
          {Array.from({ length: Math.min(pageCount, 30) }).map((_, i) => {
            const p = i + 1
            const sp = new URLSearchParams()
            if (q) sp.set('q', q)
            if (categoryFilter) sp.set('category', categoryFilter)
            if (p > 1) sp.set('page', String(p))
            const search = sp.toString()
            const href = search ? `/admin/glossary?${search}` : '/admin/glossary'
            return (
              <Link
                key={p}
                href={href}
                className={`glossary-page-link${p === pageNum ? ' active' : ''}`}
              >
                {p}
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
