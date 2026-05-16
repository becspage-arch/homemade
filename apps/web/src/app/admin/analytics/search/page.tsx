import { prisma } from '@homemade/db'
import { dailyMetric, daysAgo } from '@/lib/analytics-queries'
import { KpiCard, ChartCard } from '@/components/admin/analytics/chart-card'
import { LineTrend } from '@/components/admin/analytics/line-trend'
import { CHART_COLORS } from '@/components/admin/analytics/chart-theme'

export const dynamic = 'force-dynamic'

const STANDARD = new Intl.NumberFormat('en-GB')

export default async function SearchAnalyticsPage() {
  const since7 = daysAgo(6)
  const since30 = daysAgo(29)

  const [searchQueries, zeroResults, allSearchTrend, clickEvents] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { event: 'search_query', createdAt: { gte: since7 } },
      select: { properties: true, createdAt: true },
      take: 50000,
    }),
    prisma.analyticsEvent.findMany({
      where: {
        event: 'search_query',
        createdAt: { gte: since30 },
      },
      select: { properties: true },
      take: 50000,
    }),
    dailyMetric('search_queries', 89),
    prisma.analyticsEvent.findMany({
      where: { event: 'search_result_clicked', createdAt: { gte: since7 } },
      select: { properties: true },
      take: 50000,
    }),
  ])

  // Top 50 by frequency in last 7d.
  const topQueries = topByProp(searchQueries, 'query', 50)
  // CTR per query = clicks / queries for that query.
  const clicksByQuery = countByProp(clickEvents, 'query')
  const topWithCtr = topQueries.map(([q, c]) => ({
    query: q,
    count: c,
    clicks: clicksByQuery.get(q) ?? 0,
    ctr: c > 0 ? ((clicksByQuery.get(q) ?? 0) / c) * 100 : 0,
  }))

  // Zero-result queries: pull from last 30d, filter to events where
  // properties.zeroResult === true.
  const zeroOnly = zeroResults.filter((e) => {
    const props = (e.properties ?? {}) as Record<string, unknown>
    return props.zeroResult === true || props.totalResults === 0
  })
  const zeroTop = topByProp(zeroOnly, 'query', 50)

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
        <KpiCard label="Searches (7d)" value={STANDARD.format(searchQueries.length)} />
        <KpiCard label="Unique queries (7d)" value={STANDARD.format(topQueries.length)} />
        <KpiCard label="Zero-results (30d)" value={STANDARD.format(zeroOnly.length)} highlight={zeroOnly.length > 100 ? 'warn' : undefined} />
        <KpiCard label="Result clicks (7d)" value={STANDARD.format(clickEvents.length)} />
      </div>

      <ChartCard
        title="Daily search queries, last 90 days"
        description="From the daily rollup of search_query events."
      >
        <LineTrend data={allSearchTrend} height={220} />
      </ChartCard>

      <ChartCard
        title="Top 50 searches — last 7 days"
        description="Queries sorted by frequency. CTR is clicks ÷ queries for that exact string."
        fullBleed
      >
        <SearchTable
          rows={topWithCtr.map((r) => ({
            primary: r.query,
            count: r.count,
            secondary: `CTR ${r.ctr.toFixed(1)}%`,
          }))}
          emptyLabel="No searches in the last 7 days."
        />
      </ChartCard>

      <ChartCard
        title="Zero-result searches — last 30 days"
        description="Strong content-gap signal — every row is a query users tried that returned nothing. Prioritise these for editorial planning."
        fullBleed
      >
        <SearchTable
          rows={zeroTop.map(([q, c]) => ({ primary: q, count: c }))}
          emptyLabel="No zero-result searches in the last 30 days."
        />
      </ChartCard>
    </>
  )
}

function SearchTable({
  rows,
  emptyLabel,
}: {
  rows: Array<{ primary: string; count: number; secondary?: string }>
  emptyLabel: string
}) {
  if (rows.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: CHART_COLORS.muted, padding: 16 }}>
        {emptyLabel}
      </p>
    )
  }
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'var(--font-lora)',
        fontSize: 13,
      }}
    >
      <tbody>
        {rows.map((r, i) => (
          <tr key={`${r.primary}-${i}`} style={{ borderTop: `0.5px solid ${CHART_COLORS.grid}` }}>
            <td style={{ padding: '8px 12px', color: CHART_COLORS.text }}>{r.primary}</td>
            <td
              style={{
                padding: '8px 12px',
                textAlign: 'right',
                fontFamily: 'var(--font-mono, ui-monospace)',
                fontVariantNumeric: 'tabular-nums',
                width: 100,
              }}
            >
              {r.count.toLocaleString('en-GB')}
            </td>
            {r.secondary !== undefined ? (
              <td
                style={{
                  padding: '8px 12px',
                  color: CHART_COLORS.muted,
                  width: 120,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {r.secondary}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function topByProp(
  events: Array<{ properties: unknown }>,
  key: string,
  limit: number,
): Array<[string, number]> {
  const counts = countByProp(events, key)
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function countByProp(events: Array<{ properties: unknown }>, key: string): Map<string, number> {
  const out = new Map<string, number>()
  for (const e of events) {
    const props = (e.properties ?? {}) as Record<string, unknown>
    const v = props[key]
    if (typeof v !== 'string' || v.length === 0) continue
    const norm = v.trim().toLowerCase()
    if (!norm) continue
    out.set(norm, (out.get(norm) ?? 0) + 1)
  }
  return out
}
