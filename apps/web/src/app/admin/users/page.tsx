import Link from 'next/link'
import { prisma, UserRole } from '@homemade/db'

export const dynamic = 'force-dynamic'

const ROLE_FILTERS: { label: string; value: UserRole | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Admins', value: UserRole.ADMIN },
  { label: 'Editors', value: UserRole.EDITOR },
  { label: 'Members', value: UserRole.MEMBER },
]

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; suspended?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { q, role, suspended } = await searchParams
  const activeRole = role ?? 'all'
  const suspendedOnly = suspended === '1'

  const where: Record<string, unknown> = {}
  if (activeRole !== 'all') where.role = activeRole as UserRole
  if (suspendedOnly) where.isSuspended = true
  if (q && q.trim()) {
    const qq = q.trim()
    where.OR = [
      { email: { contains: qq, mode: 'insensitive' } },
      { name: { contains: qq, mode: 'insensitive' } },
      { displayHandle: { contains: qq, mode: 'insensitive' } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
    select: {
      id: true,
      email: true,
      name: true,
      displayHandle: true,
      role: true,
      isSuspended: true,
      suspendedUntil: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
          reviews: true,
          ugcPhotos: true,
          questions: true,
        },
      },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Users</h1>
          <p>Every account that has signed in. Click a row to see activity and moderation tools.</p>
        </div>
        <form action="/admin/users" method="GET" style={{ display: 'flex', gap: 8 }}>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search email, name, handle"
            style={{
              fontFamily: 'var(--font-lora)',
              padding: '6px 10px',
              border: '0.5px solid var(--color-linen-grey)',
              borderRadius: 3,
              minWidth: 240,
            }}
          />
          {activeRole !== 'all' && <input type="hidden" name="role" value={activeRole} />}
          {suspendedOnly && <input type="hidden" name="suspended" value="1" />}
          <button className="admin-btn secondary" type="submit">
            Search
          </button>
        </form>
      </div>

      <div className="admin-filter-row">
        {ROLE_FILTERS.map((f) => {
          const params = new URLSearchParams()
          if (q) params.set('q', q)
          if (f.value !== 'all') params.set('role', f.value)
          if (suspendedOnly) params.set('suspended', '1')
          const href = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`
          return (
            <Link
              key={f.value}
              href={href}
              className={`admin-filter-chip ${activeRole === f.value ? 'active' : ''}`}
            >
              {f.label}
            </Link>
          )
        })}
        <Link
          href={`/admin/users${(() => {
            const p = new URLSearchParams()
            if (q) p.set('q', q)
            if (activeRole !== 'all') p.set('role', activeRole)
            p.set('suspended', '1')
            return `?${p.toString()}`
          })()}`}
          className={`admin-filter-chip ${suspendedOnly ? 'active' : ''}`}
        >
          Suspended
        </Link>
      </div>

      {users.length === 0 ? (
        <p
          className="admin-card"
          style={{ fontStyle: 'italic', color: 'var(--color-warm-taupe)' }}
        >
          No users match.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Handle</th>
              <th>Role</th>
              <th>Status</th>
              <th>Projects</th>
              <th>UGC</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.displayHandle ?? <span style={{ opacity: 0.4 }}>—</span>}</td>
                <td>
                  <span className="admin-pill">{u.role.toLowerCase()}</span>
                </td>
                <td>
                  {u.isSuspended ? (
                    <span className="admin-pill flagged">
                      suspended
                      {u.suspendedUntil ? ` · until ${u.suspendedUntil.toLocaleDateString('en-GB')}` : ''}
                    </span>
                  ) : (
                    <span className="admin-pill approved">active</span>
                  )}
                </td>
                <td>{u._count.projects}</td>
                <td>
                  {u._count.reviews + u._count.ugcPhotos + u._count.questions}
                </td>
                <td>{u.createdAt.toLocaleDateString('en-GB')}</td>
                <td>
                  <Link href={`/admin/users/${u.id}`} className="admin-btn secondary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
