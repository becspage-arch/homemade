import 'server-only'
import { prisma } from '@homemade/db'
import { ROLLUP_TOTAL_DIMENSION } from './analytics-events'

/**
 * Read-side helpers for the /admin/analytics dashboards. Every helper
 * goes through the summary tables (AnalyticsDailyRollup +
 * AnalyticsCohortRollup) — the raw AnalyticsEvent table is only touched
 * for views that don't have a pre-aggregated equivalent (e.g. top
 * searches, zero-result queries) where the read volume is small.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function daysAgo(n: number, anchor: Date = new Date()): Date {
  return startOfUtcDay(new Date(anchor.getTime() - n * MS_PER_DAY))
}

export interface DailyPoint {
  date: string // YYYY-MM-DD UTC
  value: number
}

/**
 * Daily total for a metric over the last N days, filled in with zeros
 * for dates the rollup hasn't written yet. Always returns N+1 points
 * (today inclusive).
 */
export async function dailyMetric(metric: string, days: number): Promise<DailyPoint[]> {
  const from = daysAgo(days)
  const to = startOfUtcDay(new Date())
  const rows = await prisma.analyticsDailyRollup.findMany({
    where: {
      metric,
      dimension: ROLLUP_TOTAL_DIMENSION,
      date: { gte: from, lte: to },
    },
    orderBy: { date: 'asc' },
  })
  const byDate = new Map(
    rows.map((r) => [r.date.toISOString().slice(0, 10), Number(r.value)]),
  )
  const points: DailyPoint[] = []
  for (let i = days; i >= 0; i--) {
    const d = daysAgo(i)
    const key = d.toISOString().slice(0, 10)
    points.push({ date: key, value: byDate.get(key) ?? 0 })
  }
  return points
}

/**
 * Sum a metric over a date range (inclusive). Returns 0 if no rows exist.
 */
export async function metricSum(metric: string, from: Date, to: Date): Promise<number> {
  const rows = await prisma.analyticsDailyRollup.findMany({
    where: {
      metric,
      dimension: ROLLUP_TOTAL_DIMENSION,
      date: { gte: startOfUtcDay(from), lte: startOfUtcDay(to) },
    },
  })
  return rows.reduce((sum, r) => sum + Number(r.value), 0)
}

/**
 * Most recent value of a rolling metric (e.g. MAU). Returns 0 if no
 * rollup row for today yet.
 */
export async function metricLatest(metric: string): Promise<number> {
  const row = await prisma.analyticsDailyRollup.findFirst({
    where: { metric, dimension: ROLLUP_TOTAL_DIMENSION },
    orderBy: { date: 'desc' },
  })
  return row ? Number(row.value) : 0
}

/**
 * Compare current N-day window against previous N-day window. Returns the
 * delta as both an absolute number and a percentage string suitable for
 * the KPI card "(+12% vs prior week)" line.
 */
export async function metricDelta(metric: string, days: number): Promise<{
  current: number
  previous: number
  deltaPct: number | null
  tone: 'positive' | 'negative' | 'neutral'
}> {
  const today = startOfUtcDay(new Date())
  const currentFrom = daysAgo(days - 1)
  const previousFrom = daysAgo(2 * days - 1)
  const previousTo = daysAgo(days)
  const [current, previous] = await Promise.all([
    metricSum(metric, currentFrom, today),
    metricSum(metric, previousFrom, previousTo),
  ])
  const deltaPct = previous > 0 ? ((current - previous) / previous) * 100 : null
  const tone =
    deltaPct === null
      ? 'neutral'
      : deltaPct > 1
        ? 'positive'
        : deltaPct < -1
          ? 'negative'
          : 'neutral'
  return { current, previous, deltaPct, tone }
}

export function formatDelta(deltaPct: number | null, days: number): string {
  if (deltaPct === null) return `vs prior ${days}d — no data`
  const sign = deltaPct >= 0 ? '+' : ''
  return `${sign}${deltaPct.toFixed(1)}% vs prior ${days}d`
}

/**
 * Splits of a metric on a date range, grouped by dimension prefix.
 * Returns the sum per dimension over the date range, sorted desc.
 */
export async function metricByDimension(
  metric: string,
  prefix: string,
  from: Date,
  to: Date,
  limit = 20,
): Promise<Array<{ key: string; value: number }>> {
  const rows = await prisma.analyticsDailyRollup.findMany({
    where: {
      metric,
      dimension: { startsWith: `${prefix}=` },
      date: { gte: startOfUtcDay(from), lte: startOfUtcDay(to) },
    },
  })
  const byKey = new Map<string, number>()
  for (const r of rows) {
    const key = r.dimension.slice(prefix.length + 1) // strip "prefix="
    byKey.set(key, (byKey.get(key) ?? 0) + Number(r.value))
  }
  return Array.from(byKey.entries())
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

/**
 * Latest rollup-run timestamp. Used by the system dashboard.
 */
export async function lastRollupRun(): Promise<{
  date: Date
  completedAt: Date | null
  error: string | null
} | null> {
  const r = await prisma.analyticsRollupRun.findFirst({
    orderBy: { date: 'desc' },
  })
  return r ? { date: r.date, completedAt: r.completedAt, error: r.error } : null
}
