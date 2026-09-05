import Link from 'next/link'
import { prisma, UserRole, type Prisma } from '@homemade/db'
import {
  MEMBER_COUNT_SELECT,
  PLAN_LABEL,
  SIGNAL_LABEL,
  SIGNAL_PILL_CLASS,
  computeSignal,
  contributionCount,
  finishedCountsByUser,
  planOf,
  planWhere,
  savedCount,
  signalWhere,
  startedCount,
  studioDesignCount,
  type MemberCounts,
  type Plan,
  type Signal,
} from './activity'

export const dynamic = 'force-dynamic'

const ROLE_FILTERS: { label: string; value: UserRole | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Admins', value: UserRole.ADMIN },
  { label: 'Editors', value: UserRole.EDITOR },
  { label: 'Members', value: UserRole.MEMBER },
]

const SIGNAL_FILTERS: { label: string; value: Signal | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Quiet', value: 'QUIET' },
  { label: 'Likely spam', value: 'SPAM' },
]

const PLAN_FILTERS: { label: string; value: Plan | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'FREE' },
  { label: 'Premium', value: 'PREMIUM' },
  { label: 'Creator', value: 'CREATOR' },
  { label: 'Tester', value: 'TESTER' },
]

const PAGE_SIZE = 50

interface PageProps {
  searchParams: Promise<{
    q?: string
    role?: string
    suspended?: string
    signal?: string
    plan?: string
    page?: string
  }>
}

function isSignal(value: string | undefined): value is Signal {
  return value === 'ACTIVE' || value === 'QUIET' || value === 'SPAM'
}

function isPlan(value: string | undefined): value is Plan {
  return value === 'FREE' || value === 'PREMIUM' || value === 'CREATOR' || value === 'TESTER'
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { q, role, suspended, signal: signalParam, plan: planParam, page: pageParam } =
    await searchParams
  const activeRole = role ?? 'all'
  const suspendedOnly = suspended === '1'
  const activeSignal = isSignal(signalParam) ? signalParam : 'all'
  const activePlan = isPlan(planParam) ? planParam : 'all'
  const page = Math.max(1, Number(pageParam) || 1)
  const now = new Date()

  const where: Prisma.UserWhereInput = {}
  const and: Prisma.UserWhereInput[] = []
  if (activeRole !== 'all') where.role = activeRole as UserRole
  if (suspendedOnly) where.isSuspended = true
  if (activeSignal !== 'all') and.push(signalWhere(activeSignal, now))
  if (activePlan !== 'all') and.push(planWhere(activePlan))
  if (and.length > 0) where.AND = and
  if (q && q.trim()) {
    const qq = q.trim()
    where.OR = [
      { email: { contains: qq, mode: 'insensitive' } },
      { name: { contains: qq, mode: 'insensitive' } },
      { displayHandle: { contains: qq, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ lastSeenAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        displayHandle: true,
        role: true,
        isSuspended: true,
        suspendedUntil: true,
        createdAt: true,
        lastSeenAt: true,
        isCreator: true,
        isPatternTester: true,
        premiumActive: true,
        signupRiskScore: true,
        emailDomain: true,
        _count: { select: MEMBER_COUNT_SELECT },
      },
    }),
    prisma.user.count({ where }),
  ])

  const finished = await finishedCountsByUser(users.map((u) => u.id))

  const rows = users.map((u) => {
    const counts = u._count as unknown as MemberCounts
    const started = startedCount(counts)
    const signal = computeSignal({
      counts,
      lastSeenAt: u.lastSeenAt,
      createdAt: u.createdAt,
      signupRiskScore: u.signupRiskScore,
      emailDomain: u.emailDomain,
      now,
    })
    return {
      ...u,
      started,
      finished: Math.min(started, finished.get(u.id) ?? 0),
      saved: savedCount(counts),
      studioDesigns: studioDesignCount(counts),
      contributions: contributionCount(counts),
      signal,
      plan: planOf(u),
    }
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function filterHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const next = {
      q,
      role: activeRole === 'all' ? undefined : activeRole,
      suspended: suspendedOnly ? '1' : undefined,
      signal: activeSignal === 'all' ? undefined : activeSignal,
      plan: activePlan === 'all' ? undefined : activePlan,
      ...overrides,
    }
    for (const [k, v] of Object.entries(next)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return `/admin/users${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Members</h1>
          <p>
            Every account that has signed in — what they&rsquo;ve started, saved, made and
            posted. Click a row to see the full activity timeline.
          </p>
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
          {activeSignal !== 'all' && <input type="hidden" name="signal" value={activeSignal} />}
          {activePlan !== 'all' && <input type="hidden" name="plan" value={activePlan} />}
          <button className="admin-btn secondary" type="submit">
            Search
          </button>
        </form>
      </div>

      <div className="admin-filter-row">
        {ROLE_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={filterHref({ role: f.value === 'all' ? undefined : f.value })}
            className={`admin-filter-chip ${activeRole === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
        <Link
          href={filterHref({ suspended: suspendedOnly ? undefined : '1' })}
          className={`admin-filter-chip ${suspendedOnly ? 'active' : ''}`}
        >
          Suspended
        </Link>
      </div>

      <div className="admin-filter-row">
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)', alignSelf: 'center', marginRight: 4 }}>
          Signal
        </span>
        {SIGNAL_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={filterHref({ signal: f.value === 'all' ? undefined : f.value })}
            className={`admin-filter-chip ${activeSignal === f.value ? 'active' : ''}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="admin-filter-row">
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 12, color: 'var(--color-warm-taupe)', alignSelf: 'center', marginRight: 4 }}>
          Plan
        </span>
        {PLAN_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={filterHref({ plan: f.value === 'all' ? undefined : f.value })}
            className={`admin-filter-chip ${activePlan === f.value ? 'active' : ''}`}
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
          No users match.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Handle</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Last seen</th>
                <th>Started / finished</th>
                <th>Saved</th>
                <th>Studio designs</th>
                <th>Contributions</th>
                <th>Signal</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.displayHandle ?? <span style={{ opacity: 0.4 }}>—</span>}</td>
                  <td>
                    <span className="admin-pill">{u.role.toLowerCase()}</span>
                  </td>
                  <td>
                    <span className="admin-pill">{PLAN_LABEL[u.plan]}</span>
                  </td>
                  <td>
                    {u.isSuspended ? (
                      <span className="admin-pill flagged">
                        suspended
                        {u.suspendedUntil
                          ? ` · until ${u.suspendedUntil.toLocaleDateString('en-GB')}`
                          : ''}
                      </span>
                    ) : (
                      <span className="admin-pill approved">active</span>
                    )}
                  </td>
                  <td>
                    {u.lastSeenAt ? (
                      u.lastSeenAt.toLocaleDateString('en-GB')
                    ) : (
                      <span style={{ opacity: 0.4 }}>never</span>
                    )}
                  </td>
                  <td>
                    {u.started} / {u.finished}
                  </td>
                  <td>{u.saved}</td>
                  <td>{u.studioDesigns}</td>
                  <td>{u.contributions}</td>
                  <td>
                    <span className={`admin-pill ${SIGNAL_PILL_CLASS[u.signal]}`}>
                      {SIGNAL_LABEL[u.signal]}
                    </span>
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
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 24, alignItems: 'center' }}>
          {page > 1 && (
            <Link href={filterHref({ page: String(page - 1) })} className="admin-btn">
              Previous
            </Link>
          )}
          <span style={{ fontSize: 13, color: 'var(--color-warm-taupe)' }}>
            Page {page} of {totalPages} ({total.toLocaleString('en-GB')} total)
          </span>
          {page < totalPages && (
            <Link href={filterHref({ page: String(page + 1) })} className="admin-btn">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
