import Link from 'next/link'
import { prisma } from '@homemade/db'

export const dynamic = 'force-dynamic'

export default async function GlossaryIndexPage() {
  const [terms, categories] = await Promise.all([
    prisma.glossaryTerm.findMany({
      orderBy: { term: 'asc' },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
    }),
  ])

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1
          className="text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Glossary
        </h1>
        <Link
          href="/admin/glossary/new"
          className="bg-[var(--color-sage)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          new term
        </Link>
      </div>

      {terms.length === 0 ? (
        <p
          className="mt-12 text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          No glossary terms yet. Add one to get started.
        </p>
      ) : (
        <table className="mt-12 w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-linen-grey)] text-left">
              <Th>Term</Th>
              <Th>Slug</Th>
              <Th>Definition</Th>
              <Th>Category</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {terms.map((t) => (
              <tr key={t.id} className="border-b border-[var(--color-linen-grey)]">
                <Td>
                  <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.1rem' }}>
                    {t.term}
                  </span>
                </Td>
                <Td>
                  <code className="text-sm text-[var(--color-warm-taupe)]">{t.slug}</code>
                </Td>
                <Td>
                  <span className="line-clamp-2 text-sm">{t.definition}</span>
                </Td>
                <Td>
                  {t.categoryId ? (
                    <span className="text-sm">{categoryNameById.get(t.categoryId) ?? '—'}</span>
                  ) : (
                    <span
                      className="text-xs italic text-[var(--color-warm-taupe)] opacity-60"
                      style={{ fontFamily: 'var(--font-lora)' }}
                    >
                      cross-category
                    </span>
                  )}
                </Td>
                <Td>
                  <Link
                    href={`/admin/glossary/${t.id}`}
                    className="text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
                    style={{ fontFamily: 'var(--font-lora)' }}
                  >
                    edit
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      className="py-3 text-xs uppercase text-[var(--color-warm-taupe)]"
      style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.18em', fontWeight: 500 }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children?: React.ReactNode }) {
  return (
    <td
      className="py-4 align-top text-[var(--color-warm-taupe)]"
      style={{ fontFamily: 'var(--font-lora)' }}
    >
      {children}
    </td>
  )
}
