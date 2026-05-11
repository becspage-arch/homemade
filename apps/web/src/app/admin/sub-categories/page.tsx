import Link from 'next/link'
import { prisma } from '@homemade/db'

export const dynamic = 'force-dynamic'

export default async function SubCategoriesIndexPage() {
  const subCategories = await prisma.subCategory.findMany({
    orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }, { name: 'asc' }],
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { tutorials: true } },
    },
  })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1
          className="text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Sub-categories
        </h1>
        <Link
          href="/admin/sub-categories/new"
          className="bg-[var(--color-sage)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          new sub-category
        </Link>
      </div>

      {subCategories.length === 0 ? (
        <p
          className="mt-12 text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          No sub-categories yet.
        </p>
      ) : (
        <table className="mt-12 w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-linen-grey)] text-left">
              <Th>Order</Th>
              <Th>Parent</Th>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Tutorials</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {subCategories.map((s) => (
              <tr key={s.id} className="border-b border-[var(--color-linen-grey)]">
                <Td>{s.order}</Td>
                <Td>{s.category.name}</Td>
                <Td>
                  <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.1rem' }}>
                    {s.name}
                  </span>
                </Td>
                <Td>
                  <code className="text-sm text-[var(--color-warm-taupe)]">{s.slug}</code>
                </Td>
                <Td>{s._count.tutorials}</Td>
                <Td>
                  <Link
                    href={`/admin/sub-categories/${s.id}`}
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
