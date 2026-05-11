import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser, isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface PageProps {
  searchParams: Promise<{
    actor?: string
    action?: string
    resource?: string
    page?: string
  }>
}

export default async function AdminAuditLogPage({ searchParams }: PageProps) {
  // Audit log is ADMIN-only — editors can't read it. Sidebar already hides
  // /admin/audit-log for non-admins; this is the route-level enforcement.
  const actor = await getCurrentDbUser()
  if (!actor || !isAdmin(actor)) redirect('/admin')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const skip = (page - 1) * PAGE_SIZE

  const where: Record<string, unknown> = {}
  if (params.action) where.action = { contains: params.action }
  if (params.resource) where.resource = { contains: params.resource }
  if (params.actor) {
    const matchingActor = await prisma.user.findFirst({
      where: { email: { contains: params.actor, mode: 'insensitive' } },
      select: { id: true },
    })
    if (matchingActor) where.actorId = matchingActor.id
    else where.actorId = '__no_match__'
  }

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: PAGE_SIZE,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Audit log</h1>
          <p>Every admin write is recorded here. {total} entries.</p>
        </div>
      </div>

      <form
        method="GET"
        action="/admin/audit-log"
        className="admin-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr) auto',
          gap: 8,
          padding: 16,
          alignItems: 'end',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-lora)', fontSize: 12 }}>
          <span style={{ color: 'var(--color-warm-taupe)' }}>Actor email</span>
          <input
            type="text"
            name="actor"
            defaultValue={params.actor ?? ''}
            style={{
              padding: '6px 10px',
              border: '0.5px solid var(--color-linen-grey)',
              borderRadius: 3,
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-lora)', fontSize: 12 }}>
          <span style={{ color: 'var(--color-warm-taupe)' }}>Action contains</span>
          <input
            type="text"
            name="action"
            defaultValue={params.action ?? ''}
            placeholder="review.approved"
            style={{
              padding: '6px 10px',
              border: '0.5px solid var(--color-linen-grey)',
              borderRadius: 3,
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-lora)', fontSize: 12 }}>
          <span style={{ color: 'var(--color-warm-taupe)' }}>Resource contains</span>
          <input
            type="text"
            name="resource"
            defaultValue={params.resource ?? ''}
            placeholder="Review:..."
            style={{
              padding: '6px 10px',
              border: '0.5px solid var(--color-linen-grey)',
              borderRadius: 3,
            }}
          />
        </label>
        <button className="admin-btn" type="submit">
          Filter
        </button>
      </form>

      {entries.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          No entries match.
        </p>
      ) : (
        <table className="admin-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                  {e.createdAt.toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td style={{ fontSize: 13 }}>{e.actor.email}</td>
                <td>
                  <code style={{ fontSize: 12, color: 'var(--color-sage)' }}>{e.action}</code>
                </td>
                <td>
                  <code style={{ fontSize: 12, color: 'var(--color-warm-taupe)' }}>{e.resource}</code>
                </td>
                <td>
                  {e.metadata ? (
                    <pre
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                        maxWidth: 360,
                        color: 'var(--color-warm-taupe)',
                      }}
                    >
                      {JSON.stringify(e.metadata, null, 2)}
                    </pre>
                  ) : (
                    <span style={{ opacity: 0.4 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pages > 1 && (
        <div className="admin-filter-row" style={{ marginTop: 18 }}>
          {Array.from({ length: pages }).slice(0, 20).map((_, i) => {
            const p = i + 1
            const sp = new URLSearchParams()
            if (params.actor) sp.set('actor', params.actor)
            if (params.action) sp.set('action', params.action)
            if (params.resource) sp.set('resource', params.resource)
            sp.set('page', String(p))
            return (
              <Link
                key={p}
                href={`/admin/audit-log?${sp.toString()}`}
                className={`admin-filter-chip ${p === page ? 'active' : ''}`}
              >
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
