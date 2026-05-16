import { prisma } from '@homemade/db'
import { daysAgo, startOfUtcDay } from '@/lib/analytics-queries'
import { ChartCard } from '@/components/admin/analytics/chart-card'
import { FunnelChart } from '@/components/admin/analytics/funnel-chart'

export const dynamic = 'force-dynamic'

const RANGES = [
  { key: '7d', days: 7, label: 'Last 7 days' },
  { key: '30d', days: 30, label: 'Last 30 days' },
  { key: '90d', days: 90, label: 'Last 90 days' },
] as const

type RangeKey = (typeof RANGES)[number]['key']

export default async function ActivationPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const rangeKey: RangeKey = ((): RangeKey => {
    const v = params.range
    if (v === '7d' || v === '30d' || v === '90d') return v
    return '30d'
  })()
  const range = RANGES.find((r) => r.key === rangeKey)!
  const since = daysAgo(range.days - 1)
  const today = startOfUtcDay(new Date())

  // Stage counts. Each stage counts the distinct clerkUserId who fired the
  // step's event at least once in the window. We use distinct counts so a
  // single user can't inflate the funnel by repeating the action.
  const [pageviews, signups, onboarded, firstBookmark, firstStarted, firstCompleted] =
    await Promise.all([
      prisma.analyticsEvent
        .findMany({
          where: { event: 'pageview', createdAt: { gte: since, lte: new Date() } },
          select: { clerkUserId: true, sessionId: true },
        })
        .then((rows) => {
          const set = new Set<string>()
          for (const r of rows) set.add(r.clerkUserId ?? `s:${r.sessionId}`)
          return set.size
        }),
      distinctUsers('signup_completed', since),
      distinctUsers('onboarding_completed', since),
      distinctUsers('first_bookmark', since),
      distinctUsers('first_project_started', since),
      distinctUsers('first_project_completed', since),
    ])

  const steps = [
    { label: 'Visit (any page)', count: pageviews },
    { label: 'Sign-up completed', count: signups },
    { label: 'Onboarding completed', count: onboarded },
    { label: 'First bookmark', count: firstBookmark },
    { label: 'First project started', count: firstStarted },
    { label: 'First project completed', count: firstCompleted },
  ]

  // Cohort-aware view: for each cohort week in window, % that reached each step.
  const cohorts = await prisma.user.groupBy({
    by: ['signupCohortWeek'],
    where: { signupCohortWeek: { not: null }, createdAt: { gte: since, lte: today } },
    _count: { _all: true },
  })
  const cohortRows = await Promise.all(
    cohorts
      .filter((c) => c.signupCohortWeek !== null)
      .map(async (c) => {
        const label = c.signupCohortWeek as string
        const [bm, ps, pc] = await Promise.all([
          distinctUsersInCohort('first_bookmark', label),
          distinctUsersInCohort('first_project_started', label),
          distinctUsersInCohort('first_project_completed', label),
        ])
        return {
          cohortWeek: label,
          size: c._count._all,
          bookmark: bm,
          started: ps,
          completed: pc,
        }
      }),
  )
  cohortRows.sort((a, b) => b.cohortWeek.localeCompare(a.cohortWeek))

  return (
    <>
      <RangePicker active={rangeKey} />

      <ChartCard
        title={`Activation funnel — ${range.label.toLowerCase()}`}
        description="Distinct users at each stage. Drop-off = the share lost between consecutive steps."
      >
        <FunnelChart steps={steps} />
      </ChartCard>

      <ChartCard
        title="Cohort-aware activation"
        description="Of users who signed up in each ISO week, the share that reached each milestone within the window. Caps at the cohorts that landed in the selected range."
      >
        {cohortRows.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 13,
              color: 'var(--color-warm-taupe)',
            }}
          >
            No cohorts in this window have data yet.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-lora)', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--color-warm-taupe)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                <th style={{ padding: '6px 8px' }}>Cohort</th>
                <th style={{ padding: '6px 8px' }}>Size</th>
                <th style={{ padding: '6px 8px' }}>Reached: bookmark</th>
                <th style={{ padding: '6px 8px' }}>Reached: project started</th>
                <th style={{ padding: '6px 8px' }}>Reached: project completed</th>
              </tr>
            </thead>
            <tbody>
              {cohortRows.map((r) => (
                <tr key={r.cohortWeek} style={{ borderTop: '0.5px solid var(--color-linen-grey)' }}>
                  <td style={{ padding: '8px', fontVariantNumeric: 'tabular-nums' }}>{r.cohortWeek}</td>
                  <td style={{ padding: '8px', fontVariantNumeric: 'tabular-nums' }}>{r.size}</td>
                  <td style={{ padding: '8px' }}>
                    {formatRate(r.bookmark, r.size)}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {formatRate(r.started, r.size)}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {formatRate(r.completed, r.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ChartCard>
    </>
  )
}

function RangePicker({ active }: { active: RangeKey }) {
  return (
    <nav style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {RANGES.map((r) => {
        const isActive = r.key === active
        return (
          <a
            key={r.key}
            href={`/admin/analytics/activation?range=${r.key}`}
            style={{
              padding: '6px 12px',
              fontFamily: 'var(--font-lora)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              background: isActive ? 'var(--color-sage)' : 'transparent',
              color: isActive ? 'var(--color-linen-cream)' : 'var(--color-warm-taupe)',
              border: '0.5px solid var(--color-sage)',
              borderRadius: 4,
              textDecoration: 'none',
            }}
          >
            {r.label}
          </a>
        )
      })}
    </nav>
  )
}

function formatRate(numerator: number, denominator: number): string {
  if (denominator === 0) return '—'
  const pct = (numerator / denominator) * 100
  return `${pct.toFixed(1)}% (${numerator})`
}

async function distinctUsers(event: string, since: Date): Promise<number> {
  const rows = await prisma.analyticsEvent.findMany({
    where: { event, createdAt: { gte: since }, clerkUserId: { not: null } },
    select: { clerkUserId: true },
    distinct: ['clerkUserId'],
  })
  return rows.length
}

async function distinctUsersInCohort(event: string, cohortWeek: string): Promise<number> {
  const rows = await prisma.analyticsEvent.findMany({
    where: { event, cohortWeek, clerkUserId: { not: null } },
    select: { clerkUserId: true },
    distinct: ['clerkUserId'],
  })
  return rows.length
}
