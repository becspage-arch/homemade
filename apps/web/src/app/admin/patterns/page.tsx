import Link from 'next/link'
import { prisma, PatternTestStatus, type Prisma } from '@homemade/db'

export const dynamic = 'force-dynamic'

type StatusFilter = 'ALL' | PatternTestStatus

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'all' },
  { value: PatternTestStatus.DRAFT, label: 'draft' },
  { value: PatternTestStatus.RECRUITING, label: 'recruiting' },
  { value: PatternTestStatus.IN_PROGRESS, label: 'in progress' },
  { value: PatternTestStatus.COMPLETED, label: 'completed' },
  { value: PatternTestStatus.CANCELLED, label: 'cancelled' },
]

function parseStatus(raw: string | undefined): StatusFilter {
  if (!raw) return 'ALL'
  const upper = raw.toUpperCase()
  if (upper === 'ALL') return 'ALL'
  if ((Object.values(PatternTestStatus) as string[]).includes(upper)) {
    return upper as PatternTestStatus
  }
  return 'ALL'
}

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminPatternsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filter = parseStatus(params.status)

  const where: Prisma.PatternTestWhereInput = filter === 'ALL' ? {} : { status: filter }

  const tests = await prisma.patternTest.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      creator: { select: { id: true, name: true, displayHandle: true, email: true } },
      tutorial: { select: { title: true, slug: true, category: { select: { slug: true } } } },
      _count: { select: { assignments: true } },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Pattern tests</h1>
          <p>All creator-run pattern tests across the platform.</p>
        </div>
      </div>

      <div className="admin-filter-row">
        {FILTERS.map((f) => {
          const active = filter === f.value
          const href =
            f.value === 'ALL' ? '/admin/patterns' : `/admin/patterns?status=${f.value}`
          return (
            <Link
              key={f.value}
              href={href}
              className={`admin-filter-chip ${active ? 'active' : ''}`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {tests.length === 0 ? (
        <p className="admin-empty">No pattern tests match this filter.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Creator</th>
              <th>Tutorial</th>
              <th>Status</th>
              <th>Testers</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id}>
                <td>
                  {t.status === PatternTestStatus.RECRUITING ? (
                    <Link href={`/patterns/${t.id}`} style={{ color: 'var(--color-sage)' }}>
                      {t.title}
                    </Link>
                  ) : (
                    <span>{t.title}</span>
                  )}
                </td>
                <td>
                  <Link
                    href={`/admin/users/${t.creator.id}`}
                    style={{ color: 'var(--color-sage)' }}
                  >
                    {t.creator.name ?? t.creator.displayHandle ?? t.creator.email}
                  </Link>
                </td>
                <td>{t.tutorial.title}</td>
                <td>
                  <span className={`admin-pill ${pillClass(t.status)}`}>
                    {t.status.toLowerCase().replace('_', ' ')}
                  </span>
                </td>
                <td>
                  {t._count.assignments} / {t.maxTesters}
                </td>
                <td>{t.updatedAt.toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function pillClass(status: PatternTestStatus): string {
  switch (status) {
    case PatternTestStatus.RECRUITING:
    case PatternTestStatus.IN_PROGRESS:
      return 'pending'
    case PatternTestStatus.COMPLETED:
      return 'approved'
    case PatternTestStatus.CANCELLED:
      return 'dismissed'
    default:
      return ''
  }
}
