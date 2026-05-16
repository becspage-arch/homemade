import 'server-only'
import { prisma } from '@homemade/db'
import { ROLLUP_TOTAL_DIMENSION } from './analytics-events'

/**
 * Rolls up raw `AnalyticsEvent` rows into `AnalyticsDailyRollup` +
 * `AnalyticsCohortRollup` summary tables that the admin dashboards read
 * from. Idempotent — re-running for the same date is safe.
 *
 * Driven by `inngest/functions/analytics-rollup.ts` at 02:00 UTC daily,
 * with a manual trigger button in /admin/system/jobs for backfills.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function endOfUtcDay(date: Date): Date {
  const d = startOfUtcDay(date)
  return new Date(d.getTime() + MS_PER_DAY - 1)
}

interface DailyMetricRow {
  metric: string
  dimension: string
  value: bigint
}

/**
 * Compute every daily metric for one UTC day, write to AnalyticsDailyRollup,
 * upsert the cohort retention rollup, and mark AnalyticsRollupRun as done.
 *
 * Caller passes the date as a UTC midnight Date. The function is idempotent
 * — upserts handle re-runs cleanly.
 */
export async function rollupDay(date: Date): Promise<{
  date: Date
  eventsProcessed: number
  metricsWritten: number
}> {
  const dayStart = startOfUtcDay(date)
  const dayEnd = endOfUtcDay(date)

  const run = await prisma.analyticsRollupRun.upsert({
    where: { date: dayStart },
    create: { date: dayStart, startedAt: new Date(), eventsProcessed: 0, metricsWritten: 0 },
    update: { startedAt: new Date(), error: null, completedAt: null },
  })

  try {
    const rows: DailyMetricRow[] = []

    // ── DAU — distinct clerkUserId with any event that day ───────────────
    const dauRows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT "clerkUserId")::bigint AS count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${dayStart} AND "createdAt" <= ${dayEnd}
        AND "clerkUserId" IS NOT NULL
    `
    rows.push({ metric: 'dau', dimension: ROLLUP_TOTAL_DIMENSION, value: dauRows[0]?.count ?? 0n })

    // ── MAU — rolling 30-day window ending on this day ───────────────────
    const mauStart = new Date(dayEnd.getTime() - 30 * MS_PER_DAY + 1)
    const mauRows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT "clerkUserId")::bigint AS count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${mauStart} AND "createdAt" <= ${dayEnd}
        AND "clerkUserId" IS NOT NULL
    `
    rows.push({ metric: 'mau', dimension: ROLLUP_TOTAL_DIMENSION, value: mauRows[0]?.count ?? 0n })

    // ── Signups — count of signup_completed events ───────────────────────
    const signups = await prisma.analyticsEvent.count({
      where: { event: 'signup_completed', createdAt: { gte: dayStart, lte: dayEnd } },
    })
    rows.push({ metric: 'signups', dimension: ROLLUP_TOTAL_DIMENSION, value: BigInt(signups) })

    // Signups split by acquisition channel (one row per channel for this day).
    const signupsByChannel = await prisma.analyticsEvent.groupBy({
      by: ['acquisitionChannel'],
      where: { event: 'signup_completed', createdAt: { gte: dayStart, lte: dayEnd } },
      _count: { _all: true },
    })
    for (const r of signupsByChannel) {
      const channel = r.acquisitionChannel ?? 'unknown'
      rows.push({
        metric: 'signups',
        dimension: `channel=${channel}`,
        value: BigInt(r._count._all),
      })
    }

    // Signups split by country (top-level dimensions).
    const signupsByCountry = await prisma.analyticsEvent.groupBy({
      by: ['country'],
      where: { event: 'signup_completed', createdAt: { gte: dayStart, lte: dayEnd } },
      _count: { _all: true },
    })
    for (const r of signupsByCountry) {
      const country = r.country ?? 'unknown'
      rows.push({
        metric: 'signups',
        dimension: `country=${country}`,
        value: BigInt(r._count._all),
      })
    }

    // ── Content published — Tutorial.publishedAt fell in the window ─────
    const published = await prisma.tutorial.count({
      where: { publishedAt: { gte: dayStart, lte: dayEnd } },
    })
    rows.push({
      metric: 'tutorials_published',
      dimension: ROLLUP_TOTAL_DIMENSION,
      value: BigInt(published),
    })

    // ── Engagement counters ─────────────────────────────────────────────
    for (const event of [
      'tutorial_viewed',
      'tutorial_bookmarked',
      'tutorial_completed',
      'first_project_started',
      'first_project_completed',
      'search_query',
    ]) {
      const c = await prisma.analyticsEvent.count({
        where: { event, createdAt: { gte: dayStart, lte: dayEnd } },
      })
      const metric =
        event === 'tutorial_viewed'
          ? 'tutorial_views'
          : event === 'tutorial_bookmarked'
            ? 'bookmarks_created'
            : event === 'tutorial_completed'
              ? 'tutorials_completed'
              : event === 'first_project_started'
                ? 'projects_started'
                : event === 'first_project_completed'
                  ? 'projects_completed'
                  : 'search_queries'
      rows.push({ metric, dimension: ROLLUP_TOTAL_DIMENSION, value: BigInt(c) })
    }

    // ── Search — zero-result queries ────────────────────────────────────
    // Properties.zeroResult = true is the contract from the search page.
    const zeroResults = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "AnalyticsEvent"
      WHERE "event" = 'search_query'
        AND "createdAt" >= ${dayStart} AND "createdAt" <= ${dayEnd}
        AND ("properties" ->> 'zeroResult') = 'true'
    `
    rows.push({
      metric: 'search_zero_results',
      dimension: ROLLUP_TOTAL_DIMENSION,
      value: zeroResults[0]?.count ?? 0n,
    })

    // ── Errors total ────────────────────────────────────────────────────
    const errors = await prisma.analyticsEvent.count({
      where: { event: 'error_boundary_triggered', createdAt: { gte: dayStart, lte: dayEnd } },
    })
    rows.push({
      metric: 'errors_total',
      dimension: ROLLUP_TOTAL_DIMENSION,
      value: BigInt(errors),
    })

    // ── Persist daily rollup rows ───────────────────────────────────────
    let metricsWritten = 0
    for (const r of rows) {
      await prisma.analyticsDailyRollup.upsert({
        where: {
          date_metric_dimension: {
            date: dayStart,
            metric: r.metric,
            dimension: r.dimension,
          },
        },
        create: {
          date: dayStart,
          metric: r.metric,
          dimension: r.dimension,
          value: r.value,
        },
        update: { value: r.value },
      })
      metricsWritten++
    }

    // ── Cohort retention rollup ─────────────────────────────────────────
    await rollupCohortRetention(dayStart)

    const eventsProcessed = await prisma.analyticsEvent.count({
      where: { createdAt: { gte: dayStart, lte: dayEnd } },
    })

    await prisma.analyticsRollupRun.update({
      where: { id: run.id },
      data: {
        completedAt: new Date(),
        eventsProcessed,
        metricsWritten,
      },
    })

    return { date: dayStart, eventsProcessed, metricsWritten }
  } catch (err) {
    await prisma.analyticsRollupRun.update({
      where: { id: run.id },
      data: {
        completedAt: new Date(),
        error: err instanceof Error ? err.message : String(err),
      },
    })
    throw err
  }
}

/**
 * Recompute cohort retention up to (and including) the day the rollup is
 * running for. Retention can change as data lands late, so this is an
 * upsert across every (cohortWeek, weeksAfterSignup) pair we have data for.
 *
 * Cohort = users whose `signupCohortWeek` matches the cohort label.
 * "Retained in week N" = the user fired any AnalyticsEvent inside the
 * 7-day window starting N weeks after their cohort's Monday.
 */
async function rollupCohortRetention(asOf: Date): Promise<void> {
  // Pull every cohort label that has at least one user. The User table is
  // the source of truth — events alone might miss inactive cohorts.
  const cohorts = await prisma.user.groupBy({
    by: ['signupCohortWeek'],
    where: { signupCohortWeek: { not: null } },
    _count: { _all: true },
  })

  for (const cohort of cohorts) {
    const label = cohort.signupCohortWeek
    if (!label) continue
    const cohortSize = cohort._count._all

    const cohortStart = mondayOfIsoWeek(label)
    if (!cohortStart) continue

    // How many full weeks have elapsed since the cohort's Monday? We
    // compute retention for weeks 0 .. min(N, 12). 12-week window is
    // standard product-health depth; extend later if useful.
    const weeksElapsed = Math.floor((asOf.getTime() - cohortStart.getTime()) / (7 * MS_PER_DAY))
    const maxWeek = Math.min(weeksElapsed, 12)

    for (let w = 0; w <= maxWeek; w++) {
      const weekStart = new Date(cohortStart.getTime() + w * 7 * MS_PER_DAY)
      const weekEnd = new Date(weekStart.getTime() + 7 * MS_PER_DAY - 1)

      // Distinct clerk ids of users in this cohort who fired any event
      // in the week-N window. We join via the denormalised cohortWeek on
      // the event row itself for cheap GROUP BY.
      const retained = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT "clerkUserId")::bigint AS count
        FROM "AnalyticsEvent"
        WHERE "cohortWeek" = ${label}
          AND "createdAt" >= ${weekStart} AND "createdAt" <= ${weekEnd}
          AND "clerkUserId" IS NOT NULL
      `
      const retainedCount = Number(retained[0]?.count ?? 0n)
      const retentionRate = cohortSize > 0 ? retainedCount / cohortSize : 0

      await prisma.analyticsCohortRollup.upsert({
        where: {
          cohortWeek_weeksAfterSignup: { cohortWeek: label, weeksAfterSignup: w },
        },
        create: {
          cohortWeek: label,
          weeksAfterSignup: w,
          cohortSize,
          retainedCount,
          retentionRate,
        },
        update: { cohortSize, retainedCount, retentionRate },
      })
    }
  }
}

/**
 * Return the UTC Monday of the given ISO week label (e.g. "2026-W19"), or
 * null if the label is malformed.
 */
export function mondayOfIsoWeek(label: string): Date | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(label)
  if (!m) return null
  const year = Number(m[1])
  const week = Number(m[2])
  // ISO 8601: week 1 contains the year's first Thursday.
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const week1Monday = new Date(jan4.getTime() - (jan4Day - 1) * MS_PER_DAY)
  return new Date(week1Monday.getTime() + (week - 1) * 7 * MS_PER_DAY)
}

/**
 * Roll up every UTC day in [from..to] inclusive that hasn't already been
 * processed (or that the caller wants re-processed via `force: true`).
 *
 * Used by both the nightly cron (from = to = yesterday) and the manual
 * backfill button (admin-provided date range).
 */
export async function rollupRange(args: {
  from: Date
  to: Date
  force?: boolean
}): Promise<{ datesProcessed: string[] }> {
  const datesProcessed: string[] = []
  let cursor = startOfUtcDay(args.from)
  const end = startOfUtcDay(args.to)
  while (cursor.getTime() <= end.getTime()) {
    const day = new Date(cursor.getTime())
    const existing = await prisma.analyticsRollupRun.findUnique({ where: { date: day } })
    if (!args.force && existing?.completedAt && !existing.error) {
      cursor = new Date(cursor.getTime() + MS_PER_DAY)
      continue
    }
    await rollupDay(day)
    datesProcessed.push(day.toISOString().slice(0, 10))
    cursor = new Date(cursor.getTime() + MS_PER_DAY)
  }
  return { datesProcessed }
}
