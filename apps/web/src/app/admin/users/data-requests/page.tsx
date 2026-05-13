import Link from 'next/link'
import { prisma, DataExportStatus } from '@homemade/db'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS: { label: string; value: DataExportStatus | 'all' }[] = [
  { label: 'Requested', value: DataExportStatus.REQUESTED },
  { label: 'Processing', value: DataExportStatus.PROCESSING },
  { label: 'Ready', value: DataExportStatus.READY },
  { label: 'Expired', value: DataExportStatus.EXPIRED },
  { label: 'Failed', value: DataExportStatus.FAILED },
  { label: 'All', value: 'all' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB')
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function AdminDataRequestsPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams
  const active = statusParam ?? 'all'
  const where = active === 'all' ? {} : { status: active as DataExportStatus }

  const requests = await prisma.dataExportRequest.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
    include: {
      user: {
        select: { id: true, email: true, displayHandle: true, name: true },
      },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Data export requests</h1>
          <p>
            GDPR subject-access requests fired from the user&apos;s data-rights
            centre. The bundle itself belongs to the user — admins see the
            row state but not the contents.
          </p>
        </div>
      </div>

      <div className="admin-filter-row">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === 'all'
                ? '/admin/users/data-requests'
                : `/admin/users/data-requests?status=${f.value}`
            }
            className={`admin-filter-chip ${active === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          No requests.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Bytes</th>
                <th>Created</th>
                <th>Completed</th>
                <th>Expires</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const handle =
                  r.user.displayHandle ?? r.user.name ?? r.user.email
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
                        className={`admin-pill ${r.status.toLowerCase()}`}
                      >
                        {r.status.toLowerCase()}
                      </span>
                    </td>
                    <td>{formatBytes(r.bytes)}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>{formatDate(r.completedAt)}</td>
                    <td>{formatDate(r.expiresAt)}</td>
                    <td style={{ color: 'var(--color-burnt-sienna)', fontSize: 12 }}>
                      {r.error ?? '—'}
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
