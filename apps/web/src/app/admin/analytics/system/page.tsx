import { prisma } from '@homemade/db'
import { dailyMetric, lastRollupRun } from '@/lib/analytics-queries'
import { ChartCard, KpiCard } from '@/components/admin/analytics/chart-card'
import { LineTrend } from '@/components/admin/analytics/line-trend'
import { CHART_COLORS } from '@/components/admin/analytics/chart-theme'

export const dynamic = 'force-dynamic'

const STANDARD = new Intl.NumberFormat('en-GB')

export default async function SystemAnalyticsPage() {
  const [errorsTrend, latestRun, recentRuns, totalEvents] = await Promise.all([
    dailyMetric('errors_total', 89),
    lastRollupRun(),
    prisma.analyticsRollupRun.findMany({
      orderBy: { date: 'desc' },
      take: 14,
    }),
    prisma.analyticsEvent.count(),
  ])

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
        <KpiCard label="Events stored" value={STANDARD.format(totalEvents)} />
        <KpiCard
          label="Last rollup"
          value={latestRun?.completedAt ? latestRun.date.toISOString().slice(0, 10) : '—'}
          delta={
            latestRun?.error
              ? { value: 'failed', tone: 'negative' }
              : latestRun?.completedAt
                ? { value: 'ok', tone: 'positive' }
                : undefined
          }
        />
        <KpiCard
          label="Days rolled up"
          value={STANDARD.format(recentRuns.filter((r) => r.completedAt && !r.error).length)}
          delta={{ value: 'of last 14', tone: 'neutral' }}
        />
        <KpiCard
          label="Errors today"
          value={STANDARD.format(errorsTrend[errorsTrend.length - 1]?.value ?? 0)}
        />
      </div>

      <ChartCard
        title="Error boundary triggers — last 90 days"
        description="Count of error_boundary_triggered events per UTC day, from the daily rollup."
      >
        <LineTrend data={errorsTrend} height={220} color={CHART_COLORS.accent} />
      </ChartCard>

      <ChartCard
        title="Rollup cron history — last 14 days"
        description="Idempotency tracker for the nightly analytics rollup. Failures show the last error message."
        fullBleed
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-lora)', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: CHART_COLORS.muted, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 12px' }}>Date</th>
              <th style={{ padding: '8px 12px' }}>Started</th>
              <th style={{ padding: '8px 12px' }}>Completed</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Events</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Metrics</th>
              <th style={{ padding: '8px 12px' }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {recentRuns.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: CHART_COLORS.muted }}>
                  No rollup runs yet. The cron fires at 02:00 UTC daily.
                </td>
              </tr>
            ) : (
              recentRuns.map((r) => (
                <tr key={r.id} style={{ borderTop: `0.5px solid ${CHART_COLORS.grid}` }}>
                  <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums' }}>
                    {r.date.toISOString().slice(0, 10)}
                  </td>
                  <td style={{ padding: '8px 12px', color: CHART_COLORS.muted, fontSize: 12 }}>
                    {r.startedAt.toISOString().slice(11, 19)}
                  </td>
                  <td style={{ padding: '8px 12px', color: CHART_COLORS.muted, fontSize: 12 }}>
                    {r.completedAt ? r.completedAt.toISOString().slice(11, 19) : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {STANDARD.format(r.eventsProcessed)}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {STANDARD.format(r.metricsWritten)}
                  </td>
                  <td style={{ padding: '8px 12px', color: r.error ? CHART_COLORS.accent : CHART_COLORS.muted, fontSize: 12 }}>
                    {r.error ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ChartCard>

      <ChartCard
        title="Operational links"
        description="The cron health view above is what to read first. Deploy + voice-check + bulk-batch reports continue to live in their existing surfaces."
      >
        <ul
          style={{
            fontFamily: 'var(--font-lora)',
            fontSize: 13,
            color: CHART_COLORS.text,
            margin: 0,
            paddingLeft: 18,
            lineHeight: 1.7,
          }}
        >
          <li>
            <a href="/admin/system/jobs" style={{ color: CHART_COLORS.text }}>
              /admin/system/jobs
            </a>{' '}
            — re-run the analytics rollup for a date range.
          </li>
          <li>
            <a href="/admin/system/errors" style={{ color: CHART_COLORS.text }}>
              /admin/system/errors
            </a>{' '}
            — Sentry-style error feed (existing).
          </li>
          <li>
            <a
              href="https://github.com/anthropics/homemade/actions/workflows/deploy.yml"
              target="_blank"
              rel="noreferrer"
              style={{ color: CHART_COLORS.text }}
            >
              Deploy history →
            </a>
          </li>
        </ul>
      </ChartCard>
    </>
  )
}
