import Link from 'next/link'
import { prisma, ErrataStatus } from '@homemade/db'
import { ErrataCard } from './errata-card'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: ErrataStatus | 'all' }[] = [
  { label: 'Open', value: ErrataStatus.OPEN },
  { label: 'Addressed', value: ErrataStatus.ADDRESSED },
  { label: 'Dismissed', value: ErrataStatus.DISMISSED },
  { label: 'All', value: 'all' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminErrataPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams
  const active = statusParam ?? ErrataStatus.OPEN
  const where = active === 'all' ? {} : { status: active as ErrataStatus }

  const errata = await prisma.errata.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 100,
    include: {
      user: { select: { name: true, email: true, displayHandle: true } },
      tutorial: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: { select: { slug: true, name: true } },
        },
      },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Errata</h1>
          <p>Issues readers have spotted in tutorials. Mark addressed (with a note about the fix) or dismiss.</p>
        </div>
      </div>

      <div className="admin-filter-row">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? '/admin/errata?status=all'
                : `/admin/errata?status=${f.value}`
            }
            className={`admin-filter-chip ${active === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {errata.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          Nothing here.
        </p>
      ) : (
        errata.map((e) => <ErrataCard key={e.id} item={e} />)
      )}
    </div>
  )
}
