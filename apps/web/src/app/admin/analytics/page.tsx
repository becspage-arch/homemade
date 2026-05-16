import { prisma } from '@homemade/db'
import {
  dailyMetric,
  metricDelta,
  metricLatest,
  metricByDimension,
  daysAgo,
  startOfUtcDay,
  formatDelta,
} from '@/lib/analytics-queries'
import { KpiCard, ChartCard } from '@/components/admin/analytics/chart-card'
import { LineTrend, Sparkline } from '@/components/admin/analytics/line-trend'
import { BarRank } from '@/components/admin/analytics/bar-rank'
import { CHART_COLORS } from '@/components/admin/analytics/chart-theme'

export const dynamic = 'force-dynamic'

const COMPACT = new Intl.NumberFormat('en-GB', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const STANDARD = new Intl.NumberFormat('en-GB')

export default async function AnalyticsOverviewPage() {
  // Parallel reads — every helper is a small index lookup.
  const [
    dau,
    dau30d,
    mau,
    signups7,
    published7,
    bookmarks7,
    projectsInProgress,
    zeroResultsToday,
    errorsThis,
    errorsLast,
    signupsTrend,
    dauTrend,
    topCategories,
  ] = await Promise.all([
    metricLatest('dau'),
    dailyMetric('dau', 30),
    metricLatest('mau'),
    metricDelta('signups', 7),
    metricDelta('tutorials_published', 7),
    metricDelta('bookmarks_created', 7),
    prisma.userProject.count({ where: { completedAt: null, abandonedAt: null } }),
    prisma.analyticsDailyRollup.findFirst({
      where: { metric: 'search_zero_results', dimension: '__total__', date: startOfUtcDay(new Date()) },
    }),
    metricDelta('errors_total', 7),
    metricDelta('errors_total', 14).then((d) => d.previous),
    dailyMetric('signups', 30),
    dailyMetric('dau', 30),
    metricByDimension(
      'tutorials_published',
      'category',
      daysAgo(7),
      startOfUtcDay(new Date()),
      5,
    ).catch(() => [] as Array<{ key: string; value: number }>),
  ])

  const zeroResultsCount = zeroResultsToday ? Number(zeroResultsToday.value) : 0
  const errorsHighlight =
    errorsThis.current > Math.max(1, errorsLast) * 2 ? ('warn' as const) : undefined

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <KpiCard
          label="DAU today"
          value={STANDARD.format(dau)}
          delta={{
            value: formatDelta(metricDeltaFromTrend(dauTrend), 7),
            tone: deltaTone(metricDeltaFromTrend(dauTrend)),
          }}
        />
        <KpiCard
          label="MAU"
          value={COMPACT.format(mau)}
          delta={{ value: 'rolling 30d', tone: 'neutral' }}
        />
        <KpiCard
          label="Signups (7d)"
          value={STANDARD.format(signups7.current)}
          delta={{ value: formatDelta(signups7.deltaPct, 7), tone: signups7.tone }}
        />
        <KpiCard
          label="Published (7d)"
          value={STANDARD.format(published7.current)}
          delta={{ value: formatDelta(published7.deltaPct, 7), tone: published7.tone }}
        />
        <KpiCard
          label="Bookmarks (7d)"
          value={STANDARD.format(bookmarks7.current)}
          delta={{ value: formatDelta(bookmarks7.deltaPct, 7), tone: bookmarks7.tone }}
        />
        <KpiCard
          label="Projects in progress"
          value={STANDARD.format(projectsInProgress)}
          delta={{ value: 'live', tone: 'neutral' }}
        />
        <KpiCard
          label="Zero-result searches today"
          value={STANDARD.format(zeroResultsCount)}
          highlight={zeroResultsCount > 50 ? 'warn' : undefined}
          href="/admin/analytics/search"
        />
        <KpiCard
          label="Errors (7d)"
          value={STANDARD.format(errorsThis.current)}
          delta={{ value: formatDelta(errorsThis.deltaPct, 7), tone: errorsThis.tone }}
          highlight={errorsHighlight}
          href="/admin/analytics/system"
        />
      </div>

      {/* Sparkline-ish small section reusing same data — visual cue only */}
      <section
        style={{
          background: CHART_COLORS.surface,
          border: `0.5px solid ${CHART_COLORS.grid}`,
          borderRadius: 6,
          padding: '14px 18px',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-lora)',
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: CHART_COLORS.muted,
            }}
          >
            DAU — last 30 days
          </div>
        </div>
        <Sparkline data={dau30d} />
      </section>

      <ChartCard
        title="Daily signups, last 30 days"
        kpi={STANDARD.format(signupsTrend.reduce((s, p) => s + p.value, 0))}
        delta={{ value: formatDelta(signups7.deltaPct, 7), tone: signups7.tone }}
        description="Counts signup_completed events per UTC day."
      >
        <LineTrend data={signupsTrend} height={220} />
      </ChartCard>

      <ChartCard
        title="Daily active users, last 30 days"
        kpi={STANDARD.format(dau)}
        description="Distinct signed-in users with any event on a UTC day."
      >
        <LineTrend data={dauTrend} height={220} color={CHART_COLORS.primaryDeep} />
      </ChartCard>

      {topCategories.length > 0 ? (
        <ChartCard
          title="Top 5 categories by content published — last 7 days"
          description="One row per top-level category that shipped tutorials this week."
        >
          <BarRank data={topCategories} formatValue={(v) => STANDARD.format(v)} />
        </ChartCard>
      ) : null}

      <p
        style={{
          fontFamily: 'var(--font-lora)',
          fontSize: 11,
          color: CHART_COLORS.muted,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginTop: 24,
        }}
      >
        Click any KPI card to deep-dive — heatmap is on Cohorts.
      </p>
    </>
  )
}

function metricDeltaFromTrend(trend: { value: number }[]): number | null {
  if (trend.length < 14) return null
  const half = Math.floor(trend.length / 2)
  const first = trend.slice(0, half).reduce((s, p) => s + p.value, 0)
  const second = trend.slice(half).reduce((s, p) => s + p.value, 0)
  if (first === 0) return second > 0 ? 100 : null
  return ((second - first) / first) * 100
}

function deltaTone(pct: number | null): 'positive' | 'negative' | 'neutral' {
  if (pct === null) return 'neutral'
  if (pct > 1) return 'positive'
  if (pct < -1) return 'negative'
  return 'neutral'
}
