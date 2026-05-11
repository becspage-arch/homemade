import Link from 'next/link'
import { prisma, DeletionStatus } from '@homemade/db'
import { CancelButton } from './cancel-button'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: DeletionStatus | 'all' }[] = [
  { label: 'Scheduled', value: DeletionStatus.SCHEDULED },
  { label: 'Cancelled', value: DeletionStatus.CANCELLED },
  { label: 'Completed', value: DeletionStatus.COMPLETED },
  { label: 'All', value: 'all' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB')
}

function daysLeft(d: Date): number {
  const ms = d.getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

export default async function AdminDeletionQueuePage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams
  const active = statusParam ?? DeletionStatus.SCHEDULED
  const where = active === 'all' ? {} : { status: active as DeletionStatus }

  const rows = await prisma.accountDeletionRequest.findMany({
    where,
    orderBy: [{ scheduledFor: 'asc' }],
    take: 200,
    include: {
      user: {
        select: { id: true, email: true, displayHandle: true, name: true, isSuspended: true },
      },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Deletion queue</h1>
          <p>
            Accounts scheduled to be deleted, with a 30-day grace period. An
            admin can cancel a scheduled deletion (for support cases) —
            audit-logged.
          </p>
        </div>
      </div>

      <div className="admin-filter-row">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? '/admin/users/deletion-queue?status=all'
                : `/admin/users/deletion-queue?status=${f.value}`
            }
            className={`admin-filter-chip ${active === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          Nothing in this state.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Scheduled for</th>
                <th>Days left</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const handle = r.user.displayHandle ?? r.user.name ?? r.user.email
                return (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/users/${r.user.id}`}>{handle}</Link>
                      <br />
                      <span style={{ fontSize: 12, color: 'var(--color-warm-taupe)' }}>
                        {r.user.email}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-pill ${r.status === DeletionStatus.SCHEDULED ? 'pending' : r.status === DeletionStatus.CANCELLED ? 'dismissed' : 'approved'}`}
                      >
                        {r.status.toLowerCase()}
                      </span>
                    </td>
                    <td>{formatDate(r.requestedAt)}</td>
                    <td>{formatDate(r.scheduledFor)}</td>
                    <td>{r.status === DeletionStatus.SCHEDULED ? daysLeft(r.scheduledFor) : '—'}</td>
                    <td style={{ fontSize: 13, maxWidth: 260 }}>
                      {r.reason ?? <span style={{ color: 'var(--color-warm-taupe)' }}>—</span>}
                    </td>
                    <td>
                      {r.status === DeletionStatus.SCHEDULED && (
                        <CancelButton requestId={r.id} userId={r.user.id} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
