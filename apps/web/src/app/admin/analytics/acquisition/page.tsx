import { prisma } from '@homemade/db'
import { ChartCard } from '@/components/admin/analytics/chart-card'
import { BarRank } from '@/components/admin/analytics/bar-rank'
import { CHART_COLORS } from '@/components/admin/analytics/chart-theme'
import { daysAgo, metricByDimension, startOfUtcDay } from '@/lib/analytics-queries'

export const dynamic = 'force-dynamic'

const RANGES = [
  { key: '7d', days: 7, label: 'Last 7 days' },
  { key: '30d', days: 30, label: 'Last 30 days' },
  { key: '90d', days: 90, label: 'Last 90 days' },
] as const

type RangeKey = (typeof RANGES)[number]['key']

const STANDARD = new Intl.NumberFormat('en-GB')

export default async function AcquisitionPage({
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

  // Channel + country splits come from the rollup table (one row per
  // dimension per day). UTM source needs a raw scan since it's not in
  // the daily rollup taxonomy yet.
  const [byChannel, byCountry, utmRaw, deviceRaw, retentionRows] = await Promise.all([
    metricByDimension('signups', 'channel', since, today, 20),
    metricByDimension('signups', 'country', since, today, 20),
    prisma.analyticsEvent.findMany({
      where: {
        event: 'signup_completed',
        createdAt: { gte: since, lte: new Date() },
      },
      select: { utmSource: true, deviceClass: true },
    }),
    Promise.resolve([]),
    prisma.analyticsCohortRollup.findMany({ where: { weeksAfterSignup: 4 } }),
  ])

  void deviceRaw

  const utmCounts = new Map<string, number>()
  const deviceCounts = new Map<string, number>()
  for (const r of utmRaw) {
    const src = (r.utmSource ?? 'direct').toLowerCase()
    utmCounts.set(src, (utmCounts.get(src) ?? 0) + 1)
    const dev = r.deviceClass ?? 'unknown'
    deviceCounts.set(dev, (deviceCounts.get(dev) ?? 0) + 1)
  }
  const topUtm = Array.from(utmCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([key, value]) => ({ key, value }))
  const topDevice = Array.from(deviceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ key, value }))

  // Retention by channel — D30 (= week 4) cohort retention split by the
  // channel that brought each cohort. Approximation: take all W4 cohorts,
  // for each cohort look up the dominant channel of its signups, then
  // bucket retention by channel.
  const channelRetention = await computeChannelRetention(retentionRows)

  return (
    <>
      <RangePicker active={rangeKey} />

      <ChartCard
        title="Signups by channel"
        description="From the daily rollup channel split. Direct = no UTM and a self / empty referrer."
      >
        <BarRank data={byChannel} formatValue={(v) => STANDARD.format(v)} />
      </ChartCard>

      <ChartCard
        title="Signups by country"
        description="ISO 3166 alpha-2 from Cloudflare CF-IPCountry. Top 20."
      >
        <BarRank data={byCountry} formatValue={(v) => STANDARD.format(v)} />
      </ChartCard>

      <ChartCard
        title="Signups by UTM source"
        description="Top 20 utm_source values on signup. Empty source bucketed as 'direct'."
      >
        <BarRank data={topUtm} formatValue={(v) => STANDARD.format(v)} />
      </ChartCard>

      <ChartCard
        title="Signups by device class"
        description="Coarse UA bucket — mobile, tablet, desktop."
      >
        <BarRank data={topDevice} formatValue={(v) => STANDARD.format(v)} />
      </ChartCard>

      <ChartCard
        title="W4 cohort retention by channel"
        description="Of users brought in by each channel, the share still active in the 4th week after signup. Tells you which channels send long-term users vs one-and-done."
        fullBleed
      >
        {channelRetention.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: CHART_COLORS.muted, padding: 16 }}>
            No cohorts have reached W4 with channel attribution yet.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-lora)', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: CHART_COLORS.muted, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px' }}>Channel</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Cohort size</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Retained W4</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {channelRetention.map((r) => (
                <tr key={r.channel} style={{ borderTop: `0.5px solid ${CHART_COLORS.grid}` }}>
                  <td style={{ padding: '10px 12px' }}>{r.channel}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.cohortSize}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.retainedCount}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{(r.rate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ChartCard>
    </>
  )
}

async function computeChannelRetention(
  cohorts: Array<{ cohortWeek: string; cohortSize: number; retainedCount: number; retentionRate: number }>,
): Promise<Array<{ channel: string; cohortSize: number; retainedCount: number; rate: number }>> {
  // For each cohort week, the dominant channel = the most common
  // acquisitionChannel among users with that signupCohortWeek.
  const channelByWeek = new Map<string, string>()
  for (const c of cohorts) {
    const grouped = await prisma.user.groupBy({
      by: ['acquisitionChannel'],
      where: { signupCohortWeek: c.cohortWeek, acquisitionChannel: { not: null } },
      _count: { _all: true },
    })
    const dominant = grouped.sort((a, b) => b._count._all - a._count._all)[0]
    channelByWeek.set(c.cohortWeek, dominant?.acquisitionChannel ?? 'unknown')
  }

  const totals = new Map<string, { cohortSize: number; retainedCount: number }>()
  for (const c of cohorts) {
    const ch = channelByWeek.get(c.cohortWeek) ?? 'unknown'
    const acc = totals.get(ch) ?? { cohortSize: 0, retainedCount: 0 }
    acc.cohortSize += c.cohortSize
    acc.retainedCount += c.retainedCount
    totals.set(ch, acc)
  }

  return Array.from(totals.entries())
    .map(([channel, agg]) => ({
      channel,
      cohortSize: agg.cohortSize,
      retainedCount: agg.retainedCount,
      rate: agg.cohortSize > 0 ? agg.retainedCount / agg.cohortSize : 0,
    }))
    .sort((a, b) => b.cohortSize - a.cohortSize)
}

function RangePicker({ active }: { active: RangeKey }) {
  return (
    <nav style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {RANGES.map((r) => {
        const isActive = r.key === active
        return (
          <a
            key={r.key}
            href={`/admin/analytics/acquisition?range=${r.key}`}
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
